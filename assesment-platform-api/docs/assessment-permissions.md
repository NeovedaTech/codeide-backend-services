# Assessment Permission Flags — Design & Implementation Plan

## Overview

Three admin-controlled flags on the `Assesment` model gate what a candidate experiences when taking a test:

| Flag | What it controls |
|------|-----------------|
| `isProctored` | Behavioural monitoring (tab switch, fullscreen, devtools) + backend log persistence |
| `isAvEnabled` | Webcam + mic recording uploaded to S3 in chunks |
| `passCodeEnabled` | Passcode gate before the assessment can be accessed |

These flags are set by an admin at assessment creation/edit time. They affect three points in the candidate flow: **accessing the assessment**, **the instructions screen**, and **during the attempt**.

> `isAvEnabled` always implies `isProctored`. You cannot enable AV without also enabling behavioural proctoring. The admin panel enforces this: toggling on `isAvEnabled` auto-enables `isProctored`.

---

## Current State

| Area | Status |
|------|--------|
| `Assesment` schema | Has `name`, `slug`, `skillId`, `sections` — no permission flags |
| `Proctoring.tsx` | Tracks events client-side only, logs to `console.log`, nothing sent to backend |
| `AssesmentInstructions.tsx` | Always shows proctoring warnings regardless of actual assessment config |
| `assessmentStart.js` | No permission checks, always succeeds if solutionId valid |
| `assesmentCreateSolution.js` | No passcode check, no proctoring flag check |
| AV recording | Not yet implemented (see `docs/av-plan.md`) |

---

## 1. Schema Changes

### `models/Assesment.js` — add to `AssesmentSchema`

```js
isProctored:     { type: Boolean, default: false },
isAvEnabled:     { type: Boolean, default: false },
passCodeEnabled: { type: Boolean, default: false },
passCode:        { type: String,  default: null },   // bcrypt-hashed at save time
```

**On save hook** — hash the passcode before writing to DB:

```js
AssesmentSchema.pre("save", async function (next) {
  if (this.isModified("passCode") && this.passCode) {
    this.passCode = await bcrypt.hash(this.passCode, 10);
  }
  next();
});
```

The raw passcode is never stored. Validation uses `bcrypt.compare`.

### `models/Solution.js` — extend `ProctoringDataSchema`

```js
isProctored: { type: Boolean, default: false },   // mirrors assessment flag at start time
isAvEnabled: { type: Boolean, default: false },   // mirrors assessment flag at start time
```

Set once in `assessmentStart.js` from the assessment flags — so even if the assessment is edited later, the solution retains the proctoring mode it was started under.

---

## 2. Backend Changes

### 2.1 Flag propagation in `createTestSnapshot` (`assesmentCreateSolution.js`)

The snapshot returned to the frontend already strips sensitive data. Add permission flags to the snapshot so the frontend knows what to activate without fetching the raw assessment:

```js
// In createTestSnapshot, add to each snapshot object:
{
  ...existingFields,
  isProctored:     assessment.isProctored,
  isAvEnabled:     assessment.isAvEnabled,
  passCodeEnabled: assessment.passCodeEnabled,
}
```

These flags are safe to expose — they do not leak answers or test cases.

---

### 2.2 Passcode Verification — `POST /api/v1/assesments/solution`

Add before creating/returning the solution:

```js
// After fetching the assessment (line 133-138 in assesmentCreateSolution.js)
if (assessment.passCodeEnabled) {
  const { passCode } = req.body;
  if (!passCode) {
    return res.status(403).json({ message: "Passcode required" });
  }
  const valid = await bcrypt.compare(passCode, assessment.passCode);
  if (!valid) {
    return res.status(403).json({ message: "Invalid passcode" });
  }
}
```

This runs before the existing-solution lookup. If the passcode fails, no solution document is created or returned — the candidate cannot proceed at all.

**Why here, not at `start-assesment`?**
The solution document is the candidate's entry point. Without it, nothing else in the flow works (`start-assesment`, `submit-section`, all require `solutionId`). Gating at solution creation is the earliest and strictest enforcement point.

---

### 2.3 Proctoring Activation — `POST /api/v1/assesments/start-assesment`

After the existing `hasAgreed = true` logic (around line 65–68 in `assessmentStart.js`):

```js
// Read flags from the stored snapshot (already on the solution)
const { isProctored, isAvEnabled } = assessment; // re-fetch or read from snapshot

// Write into proctoringData
assessmentSolution.proctoringData = {
  ...assessmentSolution.proctoringData,
  isProctored,
  isAvEnabled,
  isEnabled: isProctored || isAvEnabled,
  recordingStatus: isAvEnabled ? "not_started" : "n/a",
};
```

The flags are locked to the solution at start time. Subsequent edits to the assessment do not change an in-progress attempt.

---

### 2.4 Admin: Passcode Set/Update — `PUT /api/v1/admin/assessments/:id`

When `passCodeEnabled` transitions from `false` to `true`, the request body must include a `passCode` value. The controller validates this:

```js
if (body.passCodeEnabled && !body.passCode) {
  return res.status(400).json({ message: "passCode is required when passCodeEnabled is true" });
}
if (!body.passCodeEnabled) {
  body.passCode = null;  // clear stored hash if passcode disabled
}
```

The `pre("save")` hook on the model handles hashing.

---

### 2.5 New Endpoint — `POST /api/v1/assesments/verify-passcode`

Optional lightweight endpoint for real-time passcode validation (used by frontend to show ✓ / ✗ before the full solution-creation request):

```
POST /api/v1/assesments/verify-passcode
Body: { assessmentId, passCode }
Response 200: { valid: true }
Response 403: { valid: false, message: "Invalid passcode" }
```

Guarded by `isAuthenticated` only (not `isAllowed` — any authenticated candidate can call it).

---

## 3. Frontend Changes

### 3.1 Flags Available in Context

The snapshot (already returned by `POST /api/v1/assesments/solution`) will include `isProctored`, `isAvEnabled`, `passCodeEnabled`. Expose these from `AssesmentContext`:

```ts
// Add to AssesmentContextType interface
isProctored:     boolean;
isAvEnabled:     boolean;
passCodeEnabled: boolean;
```

Set in the context effect alongside `hasStarted` and `hasSubmitted` (around lines 127–132 in `AssesmentContext.tsx`).

---

### 3.2 Candidate Flow with Flags

```
User visits /assessment/[id]
        │
        ▼
  passCodeEnabled?
  ┌─ YES ─────────────────────────────────────────────────┐
  │  Show PasscodeGate component                          │
  │  → User enters code                                   │
  │  → POST /assesments/solution { assessmentId, passCode }│
  │  → 403? show "Invalid passcode" error                 │
  │  → 200? proceed                                       │
  └───────────────────────────────────────────────────────┘
  ┌─ NO ──────────────────────────────────────────────────┐
  │  POST /assesments/solution { assessmentId }           │
  └───────────────────────────────────────────────────────┘
        │
        ▼
  Instructions page
  (tailored warnings based on isProctored / isAvEnabled)
        │
        ▼
  isAvEnabled?  → request getUserMedia({ video, audio })
                  denied? → block start (strict mode)
        │
        ▼
  User clicks "I Agree" → POST /start-assesment
        │
        ▼
  Assessment attempt
  ├── isProctored  → Proctoring.tsx active + logs sent to backend
  └── isAvEnabled  → AVProctoring.tsx active + chunks uploaded to S3
```

---

### 3.3 New Component — `PasscodeGate.tsx`

Shown when `passCodeEnabled === true` and `solutionId` not yet obtained.

```
┌─────────────────────────────────────────────┐
│                                             │
│   🔒  This assessment is passcode-protected │
│                                             │
│   Enter passcode provided by your recruiter │
│                                             │
│   [________________________]                │
│                                             │
│   [Enter Assessment]                        │
│                                             │
│   ⚠ Invalid passcode  ← shown on 403       │
└─────────────────────────────────────────────┘
```

**Behaviour:**
- Calls `POST /api/v1/assesments/solution` with `{ assessmentId, passCode }`
- On 200 → stores `solutionId` in context, proceeds to instructions
- On 403 → shows inline error, clears input, does NOT store any partial state
- Passcode is not persisted to `localStorage` (no leakage across sessions)

---

### 3.4 Updated `AssesmentInstructions.tsx`

Currently always renders all proctoring warnings. Change to conditional rendering based on flags:

```tsx
const { isProctored, isAvEnabled } = useAssesmentContext();

// Code of Conduct section
{isProctored && (
  <>
    <TabSwitchWarning />
    <FullscreenWarning />
    <DevToolsWarning />
  </>
)}

{isAvEnabled && (
  <CameraWarning />   // new: "Your webcam and mic will be recorded"
)}

{!isProctored && !isAvEnabled && (
  <NoMonitoringNotice />  // "No proctoring enabled for this assessment"
)}
```

**Camera permission request** (shown before "I Agree" button when `isAvEnabled`):

```
┌──────────────────────────────────────────────────────┐
│  📷  Camera & Microphone Required                    │
│                                                      │
│  This assessment requires your webcam and            │
│  microphone to be active throughout.                 │
│                                                      │
│  [Allow Camera & Mic Access]   ← triggers getUserMedia│
│                                                      │
│  Status: ✓ Access granted     ← shown after allow   │
│  (The "I Agree" button remains disabled until        │
│   permission is granted)                             │
└──────────────────────────────────────────────────────┘
```

The "I Agree & Start" button is disabled until:
- `isAvEnabled` is `false` OR camera permission state is `"granted"`

---

### 3.5 Updated `AssesmentAttempt.tsx`

Replace the `console.log` stub (line 44–46) with conditional activation:

```tsx
const { isProctored, isAvEnabled, solutionId } = useAssesmentContext();

// Behavioural proctoring — only if isProctored
{isProctored && (
  <Proctoring
    onLog={handleProctoringLog}       // buffered → POST /proctoring/log
    onViolation={handleViolation}
  />
)}

// AV recording — only if isAvEnabled (also implies isProctored)
{isAvEnabled && (
  <AVProctoring solutionId={solutionId} />
)}
```

---

### 3.6 Admin Panel — Assessment Wizard (Step 1) Update

Add to Step 1 of the creation wizard (`components/admin/AssessmentWizard/Step1BasicInfo.tsx`):

```
  Proctoring Settings
  ──────────────────────────────────────────────────────
  [✓] Enable Proctoring
      Track tab switches, fullscreen exits, devtools

  [ ] Enable AV Recording           ← disabled if Proctoring unchecked
      Record webcam & mic to S3
      (Enabling this automatically enables Proctoring)

  [ ] Require Passcode
      Candidates must enter a code to access this assessment
      Passcode  [________________]  ← shown only when checked
                 ↑ min 6 chars, no spaces
```

**Coupling rule** — enforced in form state:

```ts
// When isAvEnabled toggled ON:
setIsProctored(true);   // force-enable proctoring

// When isProctored toggled OFF:
setIsAvEnabled(false);  // force-disable AV (can't have AV without proctoring)

// When passCodeEnabled toggled OFF:
setPassCode("");        // clear the passcode field
```

---

## 4. Validation Rules Summary

| Scenario | Enforced where |
|----------|---------------|
| `passCode` required when `passCodeEnabled = true` | Admin API `PUT /admin/assessments/:id` |
| Passcode hashed before storage | Mongoose `pre("save")` hook |
| Wrong passcode → no solution created | `POST /assesments/solution` (backend) |
| `isAvEnabled = true` forces `isProctored = true` | Admin wizard form state (frontend) + admin API (backend validation) |
| Camera permission required before start when `isAvEnabled` | `AssesmentInstructions.tsx` (disables "I Agree" button) |
| Proctoring flags locked to solution at `start-assesment` | `assessmentStart.js` |

---

## 5. New API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/v1/assesments/verify-passcode` | Real-time passcode check before full solution creation |

Existing routes modified:
- `POST /api/v1/assesments/solution` — passcode check injected before solution creation
- `POST /api/v1/assesments/start-assesment` — writes `isProctored`/`isAvEnabled` to `proctoringData`
- `PUT /api/v1/admin/assessments/:id` — validates `passCode` present when `passCodeEnabled`

---

## 6. New Frontend Files

| File | Purpose |
|------|---------|
| `components/PasscodeGate.tsx` | Full-screen passcode entry UI |
| `components/CameraPermissionPrompt.tsx` | Camera grant UI on instructions page |
| `constants/ApiRoutes.ts` additions | `VERIFY_PASSCODE: "/api/v1/assesments/verify-passcode"` |

Existing files modified:
- `models/Assesment.js` — 4 new fields + `pre("save")` hook
- `models/Solution.js` — 2 new fields in `ProctoringDataSchema`
- `context/AssesmentContext.tsx` — expose `isProctored`, `isAvEnabled`, `passCodeEnabled`
- `components/AssesmentInstructions.tsx` — conditional proctoring sections + camera prompt
- `components/AssesmentAttempt.tsx` — conditional `<Proctoring>` and `<AVProctoring>` rendering
- `components/admin/AssessmentWizard/Step1BasicInfo.tsx` — new permission toggles

---

## 7. Implementation Order

1. Schema changes — `Assesment.js` (4 fields + pre-save hook), `Solution.js` (2 fields in ProctoringDataSchema)
2. `createTestSnapshot` — add flags to snapshot payload
3. `assesmentCreateSolution.js` — passcode validation block
4. `assessmentStart.js` — write proctoring flags to `proctoringData`
5. `POST /assesments/verify-passcode` — new lightweight route + controller
6. Admin API — validate `passCode` present when `passCodeEnabled` on create/update
7. `AssesmentContext.tsx` — expose three new flags
8. `PasscodeGate.tsx` — build component, wire into assessment entry flow
9. `AssesmentInstructions.tsx` — conditional rendering + `CameraPermissionPrompt`
10. `AssesmentAttempt.tsx` — conditional `<Proctoring>` and `<AVProctoring>`
11. Admin wizard `Step1BasicInfo.tsx` — permission toggles with coupling logic
