# Admin Panel — Design Document

## Overview

A fully-featured admin panel for the Assessment Platform. Admins can create and manage assessments, review candidate solutions, monitor proctoring recordings, and manage the question/problem library. The panel is a protected route group inside the existing Next.js frontend (`assesment-platform-ui`) backed by new admin-scoped Express routes.

---

## Table of Contents

1. [Role System](#1-role-system)
2. [Backend — New Routes](#2-backend--new-routes)
3. [Frontend — Route Structure](#3-frontend--route-structure)
4. [Page Designs](#4-page-designs)
   - 4.1 [Dashboard](#41-dashboard)
   - 4.2 [Assessments List](#42-assessments-list)
   - 4.3 [Assessment Creation Wizard](#43-assessment-creation-wizard)
   - 4.4 [Assessment Edit](#44-assessment-edit)
   - 4.5 [Question Pool Manager](#45-question-pool-manager)
   - 4.6 [Problem Library](#46-problem-library)
   - 4.7 [Candidates (Solutions List)](#47-candidates-solutions-list)
   - 4.8 [Solution Detail](#48-solution-detail)
   - 4.9 [Proctoring Review](#49-proctoring-review)
   - 4.10 [Role & Skill Manager](#410-role--skill-manager)
5. [API Contracts](#5-api-contracts)
6. [Schema Changes](#6-schema-changes)
7. [Navigation & Layout](#7-navigation--layout)
8. [Implementation Order](#8-implementation-order)

---

## 1. Role System

### 1.1 Add `role` to User Model (`models/User.js`)

```js
role: {
  type: String,
  enum: ["candidate", "admin"],
  default: "candidate",
},
```

Existing fields untouched: `userId`, `name`, `email`, `skillLevel`, `assessmentStatus`, `startedAt`, `completedAt`, `score`, `totalScore`.

### 1.2 Implement `isAllowed` Middleware (`middlewares/isAllowed.js`)

Currently a stub that calls `next()` unconditionally. Replace with:

```js
export const isAllowed = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};
```

All admin routes use `[isAuthenticated, isAllowed]` middleware chain.

### 1.3 Admin Auth Guard — Frontend (`guards/AdminGuard.tsx`)

Mirrors existing `AuthGurard.tsx` but adds a role check:

```tsx
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingBox />;
  if (!user) redirect("/auth");
  if (user.role !== "admin") redirect("/");

  return <>{children}</>;
}
```

Wrap `app/(admin)/layout.tsx` with `AdminGuard`.

---

## 2. Backend — New Routes

### 2.1 File: `routes/adminRoutes.js`

```
GET    /api/v1/admin/metrics                         — dashboard stats
GET    /api/v1/admin/assessments                     — paginated list
POST   /api/v1/admin/assessments                     — create assessment
GET    /api/v1/admin/assessments/:id                 — single assessment detail
PUT    /api/v1/admin/assessments/:id                 — update assessment
DELETE /api/v1/admin/assessments/:id                 — soft-delete (isActive: false)

GET    /api/v1/admin/solutions                       — paginated solutions with filters
GET    /api/v1/admin/solutions/:solutionId           — single solution detail

GET    /api/v1/admin/problems                        — paginated problems
POST   /api/v1/admin/problems                        — create problem
PUT    /api/v1/admin/problems/:id                    — update problem
DELETE /api/v1/admin/problems/:id                    — delete problem

GET    /api/v1/admin/question-pools                  — list pools
POST   /api/v1/admin/question-pools                  — create pool
PUT    /api/v1/admin/question-pools/:id              — update pool
DELETE /api/v1/admin/question-pools/:id              — delete pool

GET    /api/v1/admin/roles                           — list roles
POST   /api/v1/admin/roles                           — create role
GET    /api/v1/admin/skills                          — list skills
POST   /api/v1/admin/skills                          — create skill
POST   /api/v1/admin/role-skill-mapping              — create role-skill mapping
DELETE /api/v1/admin/role-skill-mapping/:id          — delete mapping
```

Register in `index.js`:

```js
import adminRouter from "./routes/adminRoutes.js";
app.use("/api/v1/admin", [isAuthenticated, isAllowed], adminRouter);
```

### 2.2 New Controller File: `controllers/admin/adminController.js`

Each handler is a named export. Key ones:

**`getMetrics(req, res)`**
```js
// Aggregates across AssesmentSolution, User, Assesment
// Returns counts: totalAssessments, totalCandidates, submittedToday,
//                 pendingEvaluation, flaggedSolutions, certificatesSent
```

**`createAssessment(req, res)`**

Accepts and validates the full assessment structure matching existing `Assesment` schema fields:
- `name`, `slug`, `skillId`, `sections[]`
  - Each section: `title`, `type` (quiz | coding | mixed), `questionPool`, `problemPool[]`, `maxQuestion`, `maxTime`, `maxScore`, `description`
- `isProctoringEnabled` (new field)
- `isPublished` (new field)

**`getAdminSolutions(req, res)`**

Query params:
```
?assessmentId=&minViolations=&status=submitted|evaluated&isEvaluated=&page=&limit=
```

---

## 3. Frontend — Route Structure

New route group inside `assesment-platform-ui/app`:

```
app/
└── (admin)/
    ├── layout.tsx                 — AdminGuard + AdminSidebar wrapper
    ├── dashboard/
    │   └── page.tsx
    ├── assessments/
    │   ├── page.tsx               — list
    │   ├── new/
    │   │   └── page.tsx           — creation wizard
    │   └── [id]/
    │       └── edit/
    │           └── page.tsx       — edit form
    ├── question-pools/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    ├── problems/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    ├── candidates/
    │   ├── page.tsx               — solutions list
    │   └── [solutionId]/
    │       ├── page.tsx           — solution detail
    │       └── proctoring/
    │           └── page.tsx       — AV review
    └── settings/
        └── page.tsx               — roles, skills, mappings
```

New files in `components/admin/`:
```
AdminSidebar.tsx
AdminMetricCard.tsx
AssessmentWizard/
  Step1BasicInfo.tsx
  Step2Sections.tsx
  Step3Pools.tsx
  Step4Review.tsx
SolutionTable.tsx
ProctoringViewer.tsx
QuestionEditor.tsx
ProblemEditor.tsx
```

New API routes in `constants/ApiRoutes.ts`:
```ts
ADMIN_METRICS:           "/api/v1/admin/metrics",
ADMIN_ASSESSMENTS:       "/api/v1/admin/assessments",
ADMIN_SOLUTIONS:         "/api/v1/admin/solutions",
ADMIN_PROBLEMS:          "/api/v1/admin/problems",
ADMIN_QUESTION_POOLS:    "/api/v1/admin/question-pools",
ADMIN_ROLES:             "/api/v1/admin/roles",
ADMIN_SKILLS:            "/api/v1/admin/skills",
ADMIN_ROLE_SKILL:        "/api/v1/admin/role-skill-mapping",
```

---

## 4. Page Designs

### 4.1 Dashboard

**Route:** `/admin/dashboard`
**Data:** `GET /api/v1/admin/metrics`

```
┌──────────────────────────────────────────────────────────────────────┐
│  Assessment Platform Admin                    [Admin ▾]  [Logout]    │
├───────────────┬──────────────────────────────────────────────────────┤
│               │                                                       │
│  Dashboard  ← │  Dashboard                         Today: 26 Apr     │
│  Assessments  │                                                       │
│  Candidates   │  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  Problems     │  │ Assessments  │ │  Submitted   │ │  Pending    │  │
│  Q. Pools     │  │              │ │   Today      │ │ Evaluation  │  │
│  Settings     │  │     24       │ │     47       │ │     13      │  │
│               │  └──────────────┘ └──────────────┘ └─────────────┘  │
│               │  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│               │  │  Candidates  │ │  Flagged     │ │Certificates │  │
│               │  │   (total)    │ │  (UFM ≥ 3)   │ │    Sent     │  │
│               │  │    1,204     │ │    12  ⚠     │ │    890      │  │
│               │  └──────────────┘ └──────────────┘ └─────────────┘  │
│               │                                                       │
│               │  Recent Submissions                    [View all →]  │
│               │  ┌──────────────────────────────────────────────┐    │
│               │  │ Candidate      Assessment      Score  Flags  │    │
│               │  │ Jane S.        React Senior    61%    3 ⚠    │    │
│               │  │ John D.        Java Mid.       88%    0      │    │
│               │  │ Alice T.       Python Jr.      45%    7 🔴   │    │
│               │  │ Bob K.         Node.js Sr.     73%    1      │    │
│               │  └──────────────────────────────────────────────┘    │
│               │                                                       │
│               │  Assessments by Skill                                 │
│               │  React ████████████ 34                                │
│               │  Java  ████████ 22                                    │
│               │  Python ██████ 18                                     │
│               │  Node   ████ 12                                       │
└───────────────┴──────────────────────────────────────────────────────┘
```

**Metric card data shape:**
```json
{
  "totalAssessments": 24,
  "submittedToday": 47,
  "pendingEvaluation": 13,
  "totalCandidates": 1204,
  "flaggedSolutions": 12,
  "certificatesSent": 890,
  "recentSubmissions": [...],
  "submissionsBySkill": [{ "skillName": "React", "count": 34 }]
}
```

---

### 4.2 Assessments List

**Route:** `/admin/assessments`
**Data:** `GET /api/v1/admin/assessments?page=1&limit=20&skillId=&published=`

```
┌──────────────────────────────────────────────────────────────────────┐
│  Assessments                                  [+ Create Assessment]  │
│                                                                       │
│  Search [__________________]  Skill [All ▾]  Status [All ▾]         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Name              Skill      Sections  Attempts  Status     │    │
│  │  ─────────────────────────────────────────────────────────── │    │
│  │  React Senior      React      2         134       Published  │    │
│  │  Java Mid-Level    Java       3          89       Published  │    │
│  │  Python Beginner   Python     1          45       Draft      │    │
│  │  Node.js Full      Node.js    2           0       Draft      │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  Showing 1-20 of 24          [← Prev]  [1] [2]  [Next →]            │
└──────────────────────────────────────────────────────────────────────┘
```

Each row has a `[⋮]` action menu: **Edit**, **Duplicate**, **View Candidates**, **Publish / Unpublish**, **Delete**.

**Table columns map to:**
- `name` — `Assesment.name`
- Skill — via `Assesment.skillId` → `Skill.name`
- Sections — `Assesment.sections.length`
- Attempts — count of `AssesmentSolution` docs for this assessment
- Status — `isPublished` flag

---

### 4.3 Assessment Creation Wizard

**Route:** `/admin/assessments/new`

Four-step wizard. Progress indicator at top. Each step validates before proceeding to the next.

---

#### Step 1 — Basic Info

```
  [1 Basic Info] ──── [2 Sections] ──── [3 Pools] ──── [4 Review]

┌──────────────────────────────────────────────────┐
│  Assessment Name *                               │
│  [______________________________________________] │
│                                                  │
│  Slug *   (auto-generated from name, editable)   │
│  [______________________________________________] │
│                                                  │
│  Skill                                           │
│  [Dropdown — populated from GET /admin/skills  ] │
│                                                  │
│  AV Proctoring                                   │
│  [ ] Enable webcam + mic recording               │
│                                                  │
│  Visibility                                      │
│  (●) Save as Draft   ( ) Publish immediately     │
│                                                  │
│                            [Cancel]  [Next →]    │
└──────────────────────────────────────────────────┘
```

Fields: `name`, `slug`, `skillId`, `isProctoringEnabled`, `isPublished`

---

#### Step 2 — Sections

```
  [1 Basic Info] ──── [2 Sections ●] ──── [3 Pools] ──── [4 Review]

┌──────────────────────────────────────────────────────────┐
│  Sections                              [+ Add Section]   │
│                                                          │
│  ┌─ Section 1 ───────────────────────────────────────┐   │
│  │  Title *       [_______________________________]  │   │
│  │                                                   │   │
│  │  Type          (●) Quiz  ( ) Coding  ( ) Mixed    │   │
│  │                                                   │   │
│  │  Max Time      [30]  mins                         │   │
│  │  Max Score     [100]                              │   │
│  │  Max Questions [10]                               │   │
│  │                                                   │   │
│  │  Description   [_______________________________]  │   │
│  │                                        [Remove ×] │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Section 2 ───────────────────────────────────────┐   │
│  │  Title *       [_______________________________]  │   │
│  │  Type          ( ) Quiz  (●) Coding  ( ) Mixed    │   │
│  │  Max Time      [60]  mins                         │   │
│  │  Max Score     [200]                              │   │
│  │  Max Questions [3]                                │   │
│  │  Description   [_______________________________]  │   │
│  │                                        [Remove ×] │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│                              [← Back]  [Next →]          │
└──────────────────────────────────────────────────────────┘
```

Each section maps to `SectionSchema`: `title`, `type`, `maxTime`, `maxScore`, `maxQuestion`, `description`.

---

#### Step 3 — Assign Pools

Rendered per section based on type from Step 2.

```
  [1 Basic Info] ──── [2 Sections] ──── [3 Pools ●] ──── [4 Review]

┌──────────────────────────────────────────────────────────────┐
│  Section 1 — MCQ Quiz                                        │
│                                                              │
│  Question Pool *                                             │
│  [Dropdown — list from GET /admin/question-pools          ]  │
│                              [+ Create New Pool]             │
│                                                              │
│  Preview: 24 questions in selected pool                      │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Section 2 — Coding                                          │
│                                                              │
│  Problems *                                                  │
│  [Multi-select searchable — from GET /admin/problems      ]  │
│                              [+ Create New Problem]          │
│                                                              │
│  Selected (2):                                               │
│  ● Two Sum               Easy    Python/JS/Java/C++          │
│  ● Binary Search Tree    Medium  Python/JS/Java/C++    [×]   │
│                                                              │
│                              [← Back]  [Next →]              │
└──────────────────────────────────────────────────────────────┘
```

Section pool fields: `questionPool` (ObjectId) for quiz/mixed, `problemPool[]` (ObjectId[]) for coding/mixed.

---

#### Step 4 — Review & Publish

```
  [1 Basic Info] ──── [2 Sections] ──── [3 Pools] ──── [4 Review ●]

┌──────────────────────────────────────────────────────────────┐
│  Review Assessment                                           │
│                                                              │
│  Name:          React Senior Engineer                        │
│  Slug:          react-senior-engineer                        │
│  Skill:         React                                        │
│  Proctoring:    Enabled                                      │
│                                                              │
│  Sections                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  #  Title          Type    Time   Score  Questions  │    │
│  │  1  MCQ Round      Quiz    30m    100    10         │    │
│  │  2  Coding Round   Coding  60m    200    3          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Pools                                                       │
│  Section 1 — Question Pool: "React MCQs" (24 questions)     │
│  Section 2 — Problems: Two Sum, Binary Search Tree          │
│                                                              │
│                     [← Back]                                 │
│                     [Save as Draft]   [Publish →]            │
└──────────────────────────────────────────────────────────────┘
```

**Save as Draft** → `POST /api/v1/admin/assessments` with `{ isPublished: false }`
**Publish** → `POST /api/v1/admin/assessments` with `{ isPublished: true }`

---

### 4.4 Assessment Edit

**Route:** `/admin/assessments/[id]/edit`
**Data:** `GET /api/v1/admin/assessments/:id`

Same form layout as the wizard but pre-populated. All fields editable inline. Save button triggers `PUT /api/v1/admin/assessments/:id`.

Danger zone at bottom:
- **Unpublish** — sets `isPublished: false`
- **Delete** — soft-delete (`isActive: false`), requires typing assessment name to confirm

---

### 4.5 Question Pool Manager

**Route:** `/admin/question-pools`
**Data:** `GET /api/v1/admin/question-pools`

```
┌──────────────────────────────────────────────────────────────┐
│  Question Pools                          [+ New Pool]        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pool Name          Questions  Used in           Edit │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │  React MCQs         24         2 assessments    [→]  │   │
│  │  Java Fundamentals  18         1 assessment     [→]  │   │
│  │  DS Algorithms      30         0 assessments    [→]  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Pool Detail Page** (`/admin/question-pools/[id]`):

```
┌──────────────────────────────────────────────────────────────┐
│  React MCQs   (24 questions)                  [+ Add Question]│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  #   Question (preview)         Type  Marks  Neg    │   │
│  │  1   What is a React Hook?      MCQ   2      0  [✎] │   │
│  │  2   Which is a side effect...  MSQ   3      1  [✎] │   │
│  │  3   Explain virtual DOM        Text  5      0  [✎] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Inline question editor (expands on [✎]):                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Question *  [_____________________________________]  │   │
│  │  Category    (●) MCQ  ( ) MSQ  ( ) Text              │   │
│  │  Marks *     [2]    Negative [0]                     │   │
│  │  Topic       [_____________________________________]  │   │
│  │                                                      │   │
│  │  Options                            [+ Add Option]   │   │
│  │  [ ] Option A  [__________________]                  │   │
│  │  [✓] Option B  [__________________]  ← correct       │   │
│  │  [ ] Option C  [__________________]                  │   │
│  │                                                      │   │
│  │                        [Cancel]  [Save Question]     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

Question fields from `QuestionSchema`: `question`, `category` (MCQ | MSQ | Text), `marks`, `negative`, `topic`, `options[]` (`text`, `isCorrect`), `answer` (for Text type).

Validation rules enforced in UI:
- MCQ: exactly 1 `isCorrect` option, minimum 2 options total
- MSQ: at least 1 `isCorrect` option, minimum 2 options total
- Text: `answer` field required

---

### 4.6 Problem Library

**Route:** `/admin/problems`
**Data:** `GET /api/v1/admin/problems?difficulty=&language=&page=`

```
┌──────────────────────────────────────────────────────────────┐
│  Problems                                  [+ New Problem]   │
│                                                              │
│  Search [________________]  Difficulty [All ▾]              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Title              Difficulty  Languages   Used in  │   │
│  │  Two Sum            Easy        Py/JS/C++   3 sets   │   │
│  │  BST Traversal      Medium      Py/JS/C++/J 1 set    │   │
│  │  Graph DFS          Hard        Py/C++      0 sets   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Problem Detail / Edit** (`/admin/problems/[id]`):

Tabbed editor:

```
[Description] [Test Cases] [Function Signatures] [Settings]

── Description tab ─────────────────────────────────────────
  Title *         [_______________________________]
  Difficulty      (●) Easy  ( ) Medium  ( ) Hard
  Description     [Markdown editor]
  Constraints     [+ Add constraint]
                  ● 1 ≤ n ≤ 10^4  [×]
  Input Format    [+ Add line]
  Output Format   [+ Add line]
  Examples        [+ Add example]
  Hints           [+ Add hint]
  Languages       [✓] Python  [✓] C++  [✓] Java  [✓] JS  [ ] C

── Test Cases tab ───────────────────────────────────────────
  ┌──────────────────────────────────────┐
  │  #   Input       Expected   Hidden   │
  │  1   [4,2,1,3]  [1,2,3,4]  No  [✎]  │
  │  2   [5]        [5]        Yes [✎]  │
  │                             [+ Add]  │
  └──────────────────────────────────────┘
  timeLimit   [1000] ms
  memoryLimit [256000] bytes

── Function Signatures tab ──────────────────────────────────
  [ Python  ] [def twoSum(nums: List[int], target: int):...]
  [ C++     ] [vector<int> twoSum(vector<int>&...]
  [ Java    ] [public int[] twoSum(int[] nums...]
  [ JS      ] [function twoSum(nums, target) {...]

── Settings tab ─────────────────────────────────────────────
  Time Limit    [1000] ms
  Memory Limit  [256000] bytes
```

Fields map to `Problem` schema: `title`, `difficulty`, `description`, `constraints[]`, `inputFormat[]`, `outputFormat[]`, `examples[]`, `testCases[]`, `functionSignature[]`, `hints[]`, `timeLimit`, `memoryLimit`, `languagesSupported[]`.

---

### 4.7 Candidates (Solutions List)

**Route:** `/admin/candidates`
**Data:** `GET /api/v1/admin/solutions`

```
┌──────────────────────────────────────────────────────────────────┐
│  Candidates                                                       │
│                                                                   │
│  Assessment [All ▾]   Violations [Any ▾]   Status [All ▾]        │
│  Date range [Apr 1 – Apr 26]                       [Export CSV]  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Candidate   Assessment    Score    Flags  Status     View  │  │
│  │  ──────────────────────────────────────────────────────── │  │
│  │  Jane S.     React Sr.     61/300   3 ⚠   Evaluated   [→] │  │
│  │  John D.     Java Mid.     220/300  0      Evaluated   [→] │  │
│  │  Alice T.    Python Jr.    45/100   7 🔴   Evaluated   [→] │  │
│  │  Bob K.      Node Sr.      —        1      In Progress [→] │  │
│  │  Carol M.    React Sr.     —        0      Not Started [→] │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Showing 1-20 of 312            [← Prev] [1][2][3] [Next →]     │
└──────────────────────────────────────────────────────────────────┘
```

**Column sources:**
- Candidate — `User.name` (via `solution.userId`)
- Assessment — `Assesment.name` (via `solution.assessmentId`)
- Score — `feedback[].score` / `feedback[].maxScore` (post-evaluation)
- Flags — `ufmAttempts`
- Status — derived from `isSubmitted` + `isEvaluated` + `hasAgreed`

**Query params:**
```
?assessmentId=&minViolations=&isEvaluated=&isSubmitted=&page=&limit=
```

---

### 4.8 Solution Detail

**Route:** `/admin/candidates/[solutionId]`
**Data:** `GET /api/v1/admin/solutions/:solutionId`

```
┌──────────────────────────────────────────────────────────────────┐
│  Solution — Jane S. / React Senior              [View Proctoring]│
│  Submitted: 2025-01-15 14:52  │  Score: 61/300  │  Flags: 3 ⚠   │
│                                                                   │
│  Sections                                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Section     Type   Score      Started     Duration        │  │
│  │  MCQ Round   Quiz   40/100     14:10:00    28m 12s         │  │
│  │  Coding      Code   21/200     14:40:00    12m 48s         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Section 1 — MCQ Round                                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Q   Question (preview)       Candidate Answer   Correct   │  │
│  │  1   What is useEffect?       B                  B  ✓      │  │
│  │  2   React reconciliation?    A, C               B, C  ✗   │  │
│  │  3   What is JSX?             (text) JSX is...   —   ✓     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Section 2 — Coding Round                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Problem         Language  Test Cases   Status             │  │
│  │  Two Sum         Python    4 / 5 ✓✓✓✓✗  Partial           │  │
│  │  BST Traversal   Python    0 / 5 ✗✗✗✗✗  Failed            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Actions                                                          │
│  [Re-evaluate]   [Flag for UFM Review]   [Send Certificate]       │
└──────────────────────────────────────────────────────────────────┘
```

**Data sources:**
- Section timing: `response[n].startedAt`, `response[n].pausedAt`
- Quiz answers: `response[n].quizAnswers[]` matched against question correct options
- Coding results: `response[n].codingAnswers[]` with test case pass/fail
- Total score: `feedback[]` (populated by evaluator worker)

---

### 4.9 Proctoring Review

**Route:** `/admin/candidates/[solutionId]/proctoring`
**Data:** `GET /api/v1/proctoring/:solutionId`

```
┌──────────────────────────────────────────────────────────────────┐
│  Proctoring — Jane S. / React Senior                [← Solution] │
│  Flags: 3  │  Sessions: 2  │  Recording: 48m 12s                 │
├──────────────────────────────┬───────────────────────────────────┤
│                              │                                    │
│   ┌──────────────────────┐   │  Violation Timeline               │
│   │                      │   │                                    │
│   │                      │   │  ● 00:02:15  tab_switch            │
│   │   Video Playback     │   │  ● 00:07:44  fullscreen_exit       │
│   │                      │   │  ● 00:11:02  devtools              │
│   │  ▶  ─────────── 00:14│   │  ○ 00:14:18  reconnect (session 2)│
│   │                      │   │                                    │
│   └──────────────────────┘   │  (click any event to seek video)  │
│                              │                                    │
│   Chunks                     │  ────────────────────────────────  │
│   [0] [1] [2] [3] [4] [5]    │  Session Log                      │
│   ↑ click to jump to chunk   │                                    │
│                              │  14:10:00  Recording started       │
│                              │  14:12:15  Tab switch              │
│                              │  14:17:44  Exited fullscreen       │
│                              │  14:21:02  DevTools detected       │
│                              │  14:24:18  Session reconnected     │
│                              │  14:52:00  Recording ended         │
│                              │                                    │
│                              │  ────────────────────────────────  │
│                              │  Actions                           │
│                              │  [Mark Reviewed]                   │
│                              │  [Flag for UFM]                    │
│                              │  [Download All Chunks]             │
└──────────────────────────────┴───────────────────────────────────┘
```

**Video playback behaviour:**
- Chunk URLs are presigned `GetObject` URLs from S3 (1-hour expiry, regenerated per page load)
- When chunk N ends, auto-load chunk N+1 URL
- Clicking a violation timestamp seeks to `violationTimestamp - recordingStartedAt` offset in seconds

**Violation icon legend:**
- `●` red = hard violation (tab_switch, devtools, fullscreen_exit)
- `○` grey = informational (reconnect, session_end)

---

### 4.10 Role & Skill Manager

**Route:** `/admin/settings`

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                    │
│                                                              │
│  ── Roles ────────────────────────────────── [+ Add Role]   │
│  ┌──────────────────────────────────────┐                   │
│  │  ID   Name                  Actions  │                   │
│  │  1    Frontend Engineer     [✎] [×]  │                   │
│  │  2    Backend Engineer      [✎] [×]  │                   │
│  │  3    Data Scientist        [✎] [×]  │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ── Skills ───────────────────────────────── [+ Add Skill]  │
│  ┌──────────────────────────────────────┐                   │
│  │  ID   Name          Actions          │                   │
│  │  1    React         [✎] [×]          │                   │
│  │  2    Java          [✎] [×]          │                   │
│  │  3    Python        [✎] [×]          │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ── Role-Skill Mappings ─────────── [+ Add Mapping]         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Role                  Skill     Level        Remove  │   │
│  │  Frontend Engineer     React     advanced      [×]    │   │
│  │  Frontend Engineer     Node.js   intermediate  [×]    │   │
│  │  Backend Engineer      Java      advanced       [×]    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Add Mapping                                                 │
│  Role  [Frontend Engineer ▾]  Skill [React ▾]               │
│  Level (●) beginner  ( ) intermediate  ( ) advanced         │
│                                        [Add Mapping]        │
└──────────────────────────────────────────────────────────────┘
```

**RoleSkills fields:** `role` (ObjectId), `skill` (ObjectId), `level` (beginner | intermediate | advanced). Unique compound index on `{role, skill}` already exists in schema — UI shows error if duplicate attempted.

---

## 5. API Contracts

### `GET /api/v1/admin/metrics`

```json
{
  "totalAssessments": 24,
  "submittedToday": 47,
  "pendingEvaluation": 13,
  "totalCandidates": 1204,
  "flaggedSolutions": 12,
  "certificatesSent": 890,
  "recentSubmissions": [
    {
      "solutionId": "...",
      "candidateName": "Jane S.",
      "assessmentName": "React Senior",
      "score": 61,
      "maxScore": 300,
      "ufmAttempts": 3,
      "submittedAt": "2025-01-15T14:52:00Z"
    }
  ],
  "submissionsBySkill": [
    { "skillName": "React", "count": 34 }
  ]
}
```

### `GET /api/v1/admin/assessments`

Query: `?page=1&limit=20&skillId=&isPublished=`

```json
{
  "data": [
    {
      "_id": "...",
      "name": "React Senior",
      "slug": "react-senior",
      "skillId": { "skillId": 1, "name": "React" },
      "sections": [...],
      "isProctoringEnabled": true,
      "isPublished": true,
      "attemptCount": 134,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 24, "pages": 2 }
}
```

### `POST /api/v1/admin/assessments`

Request body:
```json
{
  "name": "React Senior Engineer",
  "slug": "react-senior-engineer",
  "skillId": 1,
  "isProctoringEnabled": true,
  "isPublished": false,
  "sections": [
    {
      "title": "MCQ Round",
      "type": "quiz",
      "maxTime": 30,
      "maxScore": 100,
      "maxQuestion": 10,
      "description": "...",
      "questionPool": "...",
      "problemPool": []
    },
    {
      "title": "Coding Round",
      "type": "coding",
      "maxTime": 60,
      "maxScore": 200,
      "maxQuestion": 3,
      "description": "...",
      "questionPool": null,
      "problemPool": ["problemId1", "problemId2"]
    }
  ]
}
```

### `GET /api/v1/admin/solutions`

Query: `?assessmentId=&minViolations=&isEvaluated=&isSubmitted=&page=&limit=`

```json
{
  "data": [
    {
      "_id": "...",
      "userId": { "_id": "...", "name": "Jane S.", "email": "..." },
      "assessmentId": { "_id": "...", "name": "React Senior" },
      "isSubmitted": true,
      "isEvaluated": true,
      "ufmAttempts": 3,
      "feedback": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 312, "pages": 16 }
}
```

---

## 6. Schema Changes

All changes are additive (no existing fields removed or renamed).

### `models/User.js`

```js
role: {
  type: String,
  enum: ["candidate", "admin"],
  default: "candidate",
},
```

### `models/Assesment.js`

```js
isProctoringEnabled: { type: Boolean, default: false },
isPublished:         { type: Boolean, default: false },
isActive:            { type: Boolean, default: true },   // soft-delete flag
```

---

## 7. Navigation & Layout

### `components/admin/AdminSidebar.tsx`

```
Assessment Platform Admin
─────────────────────────
  Dashboard
  Assessments
  Candidates
  Problems
  Question Pools
  Settings
─────────────────────────
  [user avatar] Admin
  [Logout]
```

Active route highlighted. Sidebar collapses to icon-only on narrow viewports.

### `app/(admin)/layout.tsx`

```tsx
export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
```

### Auth flow

```
GET /admin/dashboard
  → AdminGuard checks user from AuthContext
  → if no user → redirect /auth
  → if user.role !== "admin" → redirect /
  → render dashboard
```

---

## 8. Implementation Order

| # | Task | Files |
|---|------|-------|
| 1 | Add `role` field to User model | `models/User.js` |
| 2 | Implement `isAllowed` middleware | `middlewares/isAllowed.js` |
| 3 | Add `isProctoringEnabled`, `isPublished`, `isActive` to Assesment model | `models/Assesment.js` |
| 4 | Create admin controller | `controllers/admin/adminController.js` |
| 5 | Create admin routes, register in `index.js` | `routes/adminRoutes.js`, `index.js` |
| 6 | Frontend: `AdminGuard`, `AdminSidebar`, `(admin)/layout.tsx` | UI repo |
| 7 | Frontend: Dashboard page + metrics API hook | `app/(admin)/dashboard/` |
| 8 | Frontend: Assessments list + wizard (4 steps) | `app/(admin)/assessments/` |
| 9 | Frontend: Question Pool manager + inline editor | `app/(admin)/question-pools/` |
| 10 | Frontend: Problem library + tabbed editor | `app/(admin)/problems/` |
| 11 | Frontend: Candidates list + solution detail | `app/(admin)/candidates/` |
| 12 | Frontend: Proctoring review page (after AV Phase 3) | `app/(admin)/candidates/[id]/proctoring/` |
| 13 | Frontend: Settings page (roles, skills, mappings) | `app/(admin)/settings/` |
