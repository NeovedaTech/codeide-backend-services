# AV Proctoring — Implementation Plan

## Overview

Add audio/video proctoring to the assessment platform. During an active assessment, the candidate's webcam feed is recorded in chunks and uploaded directly to S3 via presigned URLs. Behavioral logs (tab switches, violations, etc.) are persisted to the database. Admins can review recordings and violation timelines per solution.

---

## Current State

| Area | Status |
|------|--------|
| Frontend `Proctoring.tsx` | Tracks violations/logs, but only `console.log`s them — never sent to backend |
| `AssesmentAttempt.tsx` | Has `handleProctoringLog` stub (line 44–46) — wired to nothing |
| Backend proctoring routes | None |
| Solution model | Has `ufmAttempts: Number` but no detailed log or recording references |
| S3 / cloud storage | Not integrated anywhere |
| `POST /api/v1/assesments/mark-ufm` | Exists but is a placeholder stub |

---

## Architecture

```
Browser
  ├── MediaRecorder (webcam + mic)     → chunked .webm blobs every 30s
  │     └── PUT chunk → S3 presigned URL  (direct upload, bypasses API server)
  │
  ├── Proctoring.tsx violation events  → POST /api/v1/proctoring/log
  │
  └── On assessment end               → POST /api/v1/proctoring/complete

API Server (Express)
  ├── POST /api/v1/proctoring/presigned-url   → returns S3 presigned PUT URL
  ├── POST /api/v1/proctoring/log             → appends event to proctoringLogs[]
  ├── POST /api/v1/proctoring/complete        → marks recording done, stores chunk list
  └── GET  /api/v1/proctoring/:solutionId     → admin: returns logs + signed GET URLs

S3 Bucket
  └── recordings/
        └── {assessmentId}/
              └── {solutionId}/
                    ├── chunk-0.webm
                    ├── chunk-1.webm
                    └── chunk-N.webm
```

---

## Phase 1 — Backend Infrastructure

### 1.1 Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 1.2 Environment Variables

Add to `.env` (and `.env.example`):

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=assessment-proctoring
S3_PRESIGNED_URL_EXPIRY=300        # seconds — 5 min per chunk upload window
S3_GET_URL_EXPIRY=3600             # seconds — 1 hour for admin playback
```

### 1.3 S3 Client (`config/s3.js`)

```js
import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config.js";

export const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});
```

### 1.4 Update `config/config.js`

Add under the exported config object:

```js
aws: {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET_NAME,
  putExpiry: Number(process.env.S3_PRESIGNED_URL_EXPIRY) || 300,
  getExpiry: Number(process.env.S3_GET_URL_EXPIRY) || 3600,
},
```

### 1.5 S3 Bucket Policy

- Block all public access
- CORS rule to allow `PUT` from the frontend origin:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["https://your-frontend-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Phase 2 — Database Schema Changes

### 2.1 Proctoring Sub-schemas in `models/Solution.js`

```js
const ProctoringLogSchema = new Schema({
  type: {
    type: String,
    enum: ["tab_switch", "window_blur", "devtools", "keystroke", "fullscreen_exit"],
    required: true,
  },
  timestamp: { type: Date, required: true },
  detail: { type: String },
}, { _id: false });

const RecordingChunkSchema = new Schema({
  chunkIndex: { type: Number, required: true },
  s3Key: { type: String, required: true },   // e.g. recordings/{assessmentId}/{solutionId}/chunk-0.webm
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const ProctoringDataSchema = new Schema({
  isEnabled: { type: Boolean, default: false },
  recordingStartedAt: { type: Date },
  recordingEndedAt: { type: Date },
  chunks: [RecordingChunkSchema],
  logs: [ProctoringLogSchema],
  violationCount: { type: Number, default: 0 },
}, { _id: false });
```

Add to `AssesmentSolutionSchema`:

```js
proctoringData: { type: ProctoringDataSchema, default: () => ({}) },
```

> The existing `ufmAttempts` field stays as a denormalised fast-access counter.
> `proctoringData.violationCount` is the canonical value going forward.

---

## Phase 3 — API Endpoints

All routes are protected by `isAuthenticated` middleware.

### 3.1 Route File — `routes/proctoringRoutes.js`

```
POST   /api/v1/proctoring/presigned-url   — get S3 PUT URL for next chunk
POST   /api/v1/proctoring/log             — append a proctoring event
POST   /api/v1/proctoring/complete        — mark recording complete
GET    /api/v1/proctoring/:solutionId     — admin: get full proctoring data + playback URLs
```

### 3.2 `POST /api/v1/proctoring/presigned-url`

**Request body:**
```json
{
  "solutionId": "...",
  "assessmentId": "...",
  "chunkIndex": 0,
  "contentType": "video/webm"
}
```

**Logic:**
1. Verify solution belongs to `req.user._id`
2. Build S3 key: `recordings/{assessmentId}/{solutionId}/chunk-{chunkIndex}.webm`
3. Generate presigned `PutObjectCommand` URL (expiry from config)
4. Return URL + key

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "key": "recordings/{assessmentId}/{solutionId}/chunk-0.webm",
  "expiresIn": 300
}
```

### 3.3 `POST /api/v1/proctoring/log`

**Request body:**
```json
{
  "solutionId": "...",
  "events": [
    { "type": "tab_switch", "timestamp": "2025-01-01T10:00:00Z" },
    { "type": "fullscreen_exit", "timestamp": "2025-01-01T10:01:00Z", "detail": "..." }
  ]
}
```

**Logic:**
1. Verify solution ownership
2. Append events to `proctoringData.logs`
3. Increment `proctoringData.violationCount` for violation-type events (`tab_switch`, `window_blur`, `fullscreen_exit`, `devtools`)
4. Mirror count to `ufmAttempts` for backwards compatibility

> Accepts a batch of events to reduce request frequency (frontend can buffer 10s of events).

### 3.4 `POST /api/v1/proctoring/complete`

**Request body:**
```json
{
  "solutionId": "...",
  "chunks": [
    { "chunkIndex": 0, "s3Key": "recordings/..." },
    { "chunkIndex": 1, "s3Key": "recordings/..." }
  ]
}
```

**Logic:**
1. Verify solution ownership
2. Set `proctoringData.recordingEndedAt = now`
3. Set `proctoringData.chunks = chunks`

### 3.5 `GET /api/v1/proctoring/:solutionId`

**Auth:** Requires admin role (add `isAllowed` with admin check).

**Logic:**
1. Fetch solution, validate access
2. For each chunk in `proctoringData.chunks`, generate a presigned `GetObjectCommand` URL
3. Return logs + signed playback URLs

**Response:**
```json
{
  "solutionId": "...",
  "violationCount": 3,
  "recordingStartedAt": "...",
  "recordingEndedAt": "...",
  "logs": [...],
  "playback": [
    { "chunkIndex": 0, "url": "https://s3.amazonaws.com/...", "expiresIn": 3600 }
  ]
}
```

### 3.6 Register Route in `index.js`

```js
import proctoringRouter from "./routes/proctoringRoutes.js";
app.use("/api/v1/proctoring", proctoringRouter);
```

---

## Phase 4 — Frontend Changes

### 4.1 New Hook — `AVProctoring.tsx` (in `components/`)

Responsibilities:
- Call `getUserMedia({ video: true, audio: true })` on mount
- Instantiate `MediaRecorder` with `video/webm; codecs=vp8,opus`
- Every 30 seconds: stop current recorder, flush blob, start new chunk
- For each blob: call `POST /api/v1/proctoring/presigned-url`, then `PUT blob → presigned URL`
- Track `chunkIndex` locally
- On assessment end: flush final chunk, call `POST /api/v1/proctoring/complete`

### 4.2 Connect `Proctoring.tsx` to Backend

In `AssesmentAttempt.tsx`, replace the `console.log` stub with a buffered log sender:

```ts
// Buffer events, flush to POST /api/v1/proctoring/log every 10 seconds
const handleProctoringLog = (log: ProctoringLog) => {
  logBuffer.current.push(log);
};
```

### 4.3 New API Routes in `constants/ApiRoutes.ts`

```ts
PROCTORING_PRESIGNED_URL: "/api/v1/proctoring/presigned-url",
PROCTORING_LOG:           "/api/v1/proctoring/log",
PROCTORING_COMPLETE:      "/api/v1/proctoring/complete",
```

### 4.4 Permission UX

Before starting the assessment, prompt the user to grant camera/mic access. If denied:
- Option A: block the assessment start (strict proctoring)
- Option B: allow but flag `proctoringData.isEnabled = false` (soft proctoring)

> Decision: agree with product/stakeholders before implementing.

---

## Phase 5 — Assessment Config Flag

Add `isProctoringEnabled: Boolean` to the `Assesment` model so proctoring can be toggled per assessment. The frontend checks this flag during `start-assesment` and activates AV capture only when `true`.

---

## Phase 6 — Security Considerations

| Risk | Mitigation |
|------|-----------|
| Presigned URL reuse / leakage | Short expiry (5 min), tied to specific S3 key |
| Candidate uploads arbitrary content | Enforce `ContentType` in presigned URL params |
| Admin URL leakage | Short-lived GET URLs (1 hour), regenerated on each request |
| Recording accessed by other users | Verify `solution.userId === req.user._id` on every endpoint |
| Large storage costs | Lifecycle rule: move to S3 Glacier after 90 days |
| CORS misconfiguration | Pin `AllowedOrigins` to exact frontend domain, not `*` |

---

## Phase 7 — S3 Lifecycle Policy

```json
{
  "Rules": [
    {
      "ID": "archive-old-recordings",
      "Filter": { "Prefix": "recordings/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 365 }
    }
  ]
}
```

---

## Phase 8 — Refresh & Reconnect Handling

### Context

The existing platform already handles assessment session resumption:
- `currSection` (Number) tracked in `AssesmentSolution` — frontend restores to this on reload
- `response[n].startedAt / pausedAt` track timing per section
- `localStorage` caches answers with key `{solutionId}-{sectionId}`, cleared on section submit
- `useGetAssesment()` hook re-fetches solution on mount, restoring `currSection` and `hasAgreed`

AV proctoring must hook into this same flow. The problem: after a refresh, the browser has no MediaRecorder state, the `chunkIndex` counter is lost, and the presigned URL from the previous session has expired.

---

### 8.1 New Schema Fields on `ProctoringDataSchema`

```js
lastKnownChunkIndex: { type: Number, default: -1 },   // Highest confirmed chunk index
sessionCount: { type: Number, default: 0 },            // Increments on each reconnect
recordingStatus: {
  type: String,
  enum: ["not_started", "active", "interrupted", "completed"],
  default: "not_started",
},
```

`lastKnownChunkIndex` is written by the backend when a `presigned-url` is issued — the server increments it, so on reconnect the frontend asks "what was the last chunk?" and resumes from there.

---

### 8.2 New Endpoint — `GET /api/v1/proctoring/session/:solutionId`

Called immediately after page load, alongside the existing `useGetAssesment()` call.

**Response:**
```json
{
  "recordingStatus": "interrupted",
  "lastKnownChunkIndex": 4,
  "sessionCount": 2,
  "isEnabled": true
}
```

Frontend logic on reconnect:
```
recordingStatus === "not_started"  → start fresh, chunkIndex = 0
recordingStatus === "active"       → resume from lastKnownChunkIndex + 1
recordingStatus === "interrupted"  → resume from lastKnownChunkIndex + 1, log reconnect event
recordingStatus === "completed"    → assessment already submitted, do nothing
```

---

### 8.3 Updated `POST /api/v1/proctoring/presigned-url` Behaviour

On each call, the backend:
1. Reads the requested `chunkIndex` from body
2. Updates `proctoringData.lastKnownChunkIndex = chunkIndex`
3. Sets `proctoringData.recordingStatus = "active"`
4. Returns the presigned PUT URL

This means even if the frontend crashes after requesting the URL but before uploading, the server knows which chunk was in flight. On reconnect the frontend resumes from `lastKnownChunkIndex + 1` — the in-flight chunk is simply a gap (acceptable, not a fatal error).

---

### 8.4 Recording Session Transitions

```
Browser closes / refresh detected
  → beforeunload event fires
  → frontend flushes current MediaRecorder blob (ondataavailable forced)
  → fires POST /api/v1/proctoring/log with { type: "session_end", detail: "beforeunload" }
  → backend sets recordingStatus = "interrupted"

Browser reconnects
  → GET /api/v1/proctoring/session/:solutionId
  → frontend re-requests getUserMedia (permissions already granted, no prompt)
  → resumes MediaRecorder from lastKnownChunkIndex + 1
  → backend sets recordingStatus = "active", increments sessionCount
  → logs event { type: "reconnect", detail: "session_N" }
```

Add `"session_end"` and `"reconnect"` to the `ProctoringLogSchema` enum.

---

### 8.5 Network Lag / Upload Failure Handling

Chunk uploads are direct browser → S3 (presigned PUT). The frontend must handle failures:

```
Chunk upload fails (network lag, timeout)
  → Retry with exponential backoff: 2s, 4s, 8s (max 3 retries)
  → If still failing after 3 retries:
      → Store blob in IndexedDB with key { solutionId, chunkIndex }
      → Set a flag: pendingChunks.current.push(chunkIndex)
  → When connectivity restores (navigator.onLine = true event):
      → Re-request presigned URL for the pending chunkIndex
      → Re-upload from IndexedDB
      → Remove from IndexedDB on success
```

**IndexedDB store name:** `av_proctoring_pending`
**Key:** `${solutionId}_chunk_${chunkIndex}`
**Value:** Blob

This ensures no chunk is silently dropped due to a transient network failure.

---

### 8.6 Assessment Already Submitted on Reconnect

If the user reconnects to an assessment where `isSubmitted = true` (they submitted in another tab, or the auto-submit fired):
- Skip `getUserMedia` entirely
- Call `POST /api/v1/proctoring/complete` with whatever chunks were confirmed
- Set `recordingStatus = "completed"`

This prevents a ghost recording session starting after submission.

---

### 8.7 `beforeunload` Flush — Frontend

In `AVProctoring.tsx`:

```ts
useEffect(() => {
  const handleBeforeUnload = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.requestData();   // forces ondataavailable
      // synchronous XHR to POST /proctoring/log (async fetch won't fire on unload)
      navigator.sendBeacon(
        `${API_BASE}/api/v1/proctoring/log`,
        JSON.stringify({ solutionId, events: [{ type: "session_end", timestamp: new Date().toISOString() }] })
      );
    }
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [solutionId]);
```

> `navigator.sendBeacon` is used instead of `fetch` because `fetch` is cancelled on page unload. `sendBeacon` is fire-and-forget and survives navigation.

---

### 8.8 Server-Sync Integration

The existing `GET /api/v1/assesments/server-sync` returns `{ serverTime }`. On reconnect, the frontend should:
1. Call server-sync to get authoritative time
2. Calculate clock drift: `drift = serverTime - Date.now()`
3. Use `Date.now() + drift` for all proctoring log timestamps going forward

This prevents timestamp manipulation via system clock changes.

---

## Phase 9 — Admin Panel Design

### 9.1 Overview

A separate Next.js route group `(admin)/` protected by an admin role guard. Two primary areas:

```
/admin
  ├── /dashboard          — overview metrics
  ├── /assessments        — list, create, edit assessments
  │     └── /new          — assessment creation wizard
  │     └── /[id]/edit    — edit existing assessment
  └── /proctoring         — candidate recording review
        └── /[solutionId] — single candidate review
```

---

### 9.2 Admin Role — Backend

#### Implement `isAllowed` middleware (`middlewares/isAllowed.js`)

Currently a stub. Add:

```js
export const isAllowed = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};
```

#### Add `role` field to `User` model

```js
role: {
  type: String,
  enum: ["candidate", "admin"],
  default: "candidate",
},
```

#### New Admin Routes — `routes/adminRoutes.js`

```
GET    /api/v1/admin/assessments              — paginated list of all assessments
POST   /api/v1/admin/assessments              — create new assessment
PUT    /api/v1/admin/assessments/:id          — update assessment
DELETE /api/v1/admin/assessments/:id          — soft-delete assessment

GET    /api/v1/admin/solutions                — paginated list of all solutions (with filters)
GET    /api/v1/admin/solutions/:solutionId    — single solution detail

GET    /api/v1/admin/metrics                  — dashboard numbers
```

All routes gated by `isAuthenticated` + `isAllowed`.

---

### 9.3 Admin Dashboard — `/admin/dashboard`

```
┌─────────────────────────────────────────────────────────────────┐
│  Assessment Platform Admin                          [Logout]     │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  Dashboard   │   Overview                                        │
│  Assessments │   ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  Proctoring  │   │  Total   │ │Submitted │ │Flagged   │        │
│              │   │Attempts  │ │ Today    │ │(UFM > 3) │        │
│              │   │  1,204   │ │   47     │ │   12     │        │
│              │   └──────────┘ └──────────┘ └──────────┘        │
│              │                                                   │
│              │   Recent Submissions                              │
│              │   ┌────────────────────────────────────────────┐ │
│              │   │ Candidate     Assessment   Score  Flags    │ │
│              │   │ John D.       React Sr.    82%    0        │ │
│              │   │ Jane S.       Java Mid.    61%    3 ⚠      │ │
│              │   │ ...                                         │ │
│              │   └────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────┘
```

**Data source:** `GET /api/v1/admin/metrics`

```json
{
  "totalAttempts": 1204,
  "submittedToday": 47,
  "flaggedSolutions": 12,
  "recentSubmissions": [...]
}
```

---

### 9.4 Assessment Creation Wizard — `/admin/assessments/new`

Multi-step form. Each step validates before proceeding.

#### Step 1 — Basic Info

```
┌─────────────────────────────────────────────┐
│  Assessment Name  [________________________] │
│  Slug             [________________________] │
│  Skill            [Dropdown: skills list   ] │
│  Proctoring       [ ] Enable AV Proctoring  │
│                                             │
│                          [Cancel] [Next →]  │
└─────────────────────────────────────────────┘
```

Fields map to: `name`, `slug`, `skillId`, `isProctoringEnabled`

#### Step 2 — Add Sections

```
┌─────────────────────────────────────────────────────┐
│  Sections                          [+ Add Section]  │
│                                                     │
│  ┌─ Section 1 ────────────────────────────────────┐ │
│  │  Title        [_____________________]           │ │
│  │  Type         ( ) Quiz  (●) Coding              │ │
│  │  Max Time     [30] mins                         │ │
│  │  Max Score    [100]                             │ │
│  │  Max Questions[10]                              │ │
│  │  Description  [_____________________]           │ │
│  │                                     [Remove ×]  │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Section 2 ────────────────────────────────────┐ │
│  │  ...                                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│                       [← Back]  [Next →]            │
└─────────────────────────────────────────────────────┘
```

#### Step 3 — Assign Question / Problem Pools

```
┌────────────────────────────────────────────────────┐
│  Section 1 (Quiz) — Question Pool                  │
│  Pool  [Dropdown: existing pools]  [+ New Pool]    │
│                                                    │
│  Section 2 (Coding) — Problem Pool                 │
│  Problems  [Multi-select: problems list]           │
│                                                    │
│                      [← Back]  [Review →]          │
└────────────────────────────────────────────────────┘
```

#### Step 4 — Review & Publish

Summary card of all entered data. Two actions:

- **Save as Draft** — creates assessment with `isPublished: false`
- **Publish** — creates with `isPublished: true`, immediately visible to candidates

> Add `isPublished: Boolean, default: false` to `Assesment` model.

---

### 9.5 Proctoring Review Page — `/admin/proctoring/[solutionId]`

```
┌──────────────────────────────────────────────────────────────────┐
│  Proctoring Review — Jane S. / React Senior Assessment           │
│  Submitted: 2025-01-15 14:32  │  Score: 61%  │  Violations: 3  ⚠ │
├────────────────────────────┬─────────────────────────────────────┤
│                            │                                     │
│   ┌────────────────────┐   │  Violation Timeline                 │
│   │                    │   │                                     │
│   │   Video Player     │   │  00:02:15  tab_switch               │
│   │   [  ▶  ──────── ] │   │  00:07:44  fullscreen_exit          │
│   │                    │   │  00:11:02  devtools                 │
│   └────────────────────┘   │                                     │
│                            │  ─────────────────────────────────  │
│   Chunks:                  │  Behavior Logs                      │
│   [0][1][2][3][4]          │                                     │
│   (click to seek)          │  14:30:01  Assessment started       │
│                            │  14:32:15  Tab switched away        │
│                            │  14:37:44  Exited fullscreen        │
│                            │  14:41:02  DevTools opened          │
│                            │  14:45:18  Session reconnected      │
│                            │  14:52:00  Assessment submitted     │
│                            │                                     │
│                            │  ─────────────────────────────────  │
│                            │  Actions                            │
│                            │  [Mark as Reviewed]                 │
│                            │  [Flag for UFM Review]              │
│                            │  [Download Recording]               │
└────────────────────────────┴─────────────────────────────────────┘
```

**Data source:** `GET /api/v1/proctoring/:solutionId`

- Video player loads chunk URLs sequentially — when chunk N ends, load chunk N+1 URL
- Clicking a violation timestamp seeks the video to that offset (calculated from `recordingStartedAt`)
- "Download Recording" links to all chunk presigned GET URLs as a zip, or sequentially

---

### 9.6 Solutions List with Proctoring Filter — `/admin/proctoring`

```
┌────────────────────────────────────────────────────────────────┐
│  Proctoring Reviews                                            │
│                                                                │
│  Filters:  [Assessment ▼]  [Date range]  [Flags: Any ▼]       │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Candidate   Assessment     Score  Flags  Status       │   │
│  │  Jane S.     React Sr.      61%    3 ⚠   Pending  [→] │   │
│  │  Bob K.      Java Mid.      88%    0      Reviewed [→] │   │
│  │  Alice T.    Python Jr.     45%    7 🔴   Flagged  [→] │   │
│  └────────────────────────────────────────────────────────┘   │
│  Showing 1-20 of 84          [← Prev]  [1] [2] [3]  [Next →] │
└────────────────────────────────────────────────────────────────┘
```

**Query params for `GET /api/v1/admin/solutions`:**
```
?assessmentId=...&minViolations=1&status=pending&page=1&limit=20
```

---

### 9.7 Admin Auth Guard — Frontend

New file `guards/AdminGuard.tsx`:

```tsx
// Wraps admin routes — redirects to / if user.role !== "admin"
export function AdminGuard({ children }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/auth" />;
  if (user.role !== "admin") return <Redirect to="/" />;
  return children;
}
```

Wrap `app/(admin)/layout.tsx` with `AdminGuard`.

---

### 9.8 Admin API Routes in `constants/ApiRoutes.ts`

```ts
ADMIN_ASSESSMENTS:        "/api/v1/admin/assessments",
ADMIN_ASSESSMENT_BY_ID:   "/api/v1/admin/assessments/:id",
ADMIN_SOLUTIONS:          "/api/v1/admin/solutions",
ADMIN_SOLUTION_BY_ID:     "/api/v1/admin/solutions/:solutionId",
ADMIN_METRICS:            "/api/v1/admin/metrics",
```

---

## Implementation Order

1. **Phase 1** — S3 client + env vars + config
2. **Phase 2** — Schema migration (additive, non-breaking; includes `ProctoringDataSchema` + `lastKnownChunkIndex` + `sessionCount` + `recordingStatus`)
3. **Phase 3** — Backend proctoring routes (presigned-url, log, complete, session, admin GET)
4. **Phase 8 backend** — Reconnect session endpoint + `recordingStatus` transitions
5. **Phase 4** — Frontend AV capture hook + `beforeunload` flush + IndexedDB retry
6. **Phase 8 frontend** — Reconnect flow: call session endpoint on mount, resume from `lastKnownChunkIndex`
7. **Phase 5** — `isProctoringEnabled` + `isPublished` flags on Assessment model
8. **Phase 9 backend** — Admin role on User model, implement `isAllowed`, admin routes
9. **Phase 9 frontend** — Admin route group, `AdminGuard`, dashboard, assessment wizard, proctoring review page
10. **Phase 6** — Security review + S3 CORS + bucket policy
11. **Phase 7** — S3 lifecycle policy

---

## Out of Scope (Future)

- Server-side video stitching/merging of chunks into a single file
- AI-based face detection or gaze tracking
- Real-time proctoring alerts to admins during live assessments
- Screen recording (separate `getDisplayMedia` flow)
- Bulk download of recordings as ZIP
