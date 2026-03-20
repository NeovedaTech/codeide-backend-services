# Database Schema Documentation

This document provides a comprehensive overview of the MongoDB database schema for the Assessment Platform, including model definitions, field descriptions, relationships, and end-to-end examples for creating assessments with Question Pools and Problem Pools.

---

## Table of Contents

1. [Entity Relationship Overview](#entity-relationship-overview)
2. [Model Definitions](#model-definitions)
   - [User](#1-user-model)
   - [Problem](#2-problem-model)
   - [QuestionPool](#3-questionpool-model)
   - [Assessment](#4-assessment-model)
   - [AssessmentSolution](#5-assessmentsolution-model)
3. [How to Create an Assessment (Step-by-Step)](#how-to-create-an-assessment-step-by-step)
   - [Step 1: Create Problems (for coding sections)](#step-1-create-problems-for-coding-sections)
   - [Step 2: Create a QuestionPool (for quiz sections)](#step-2-create-a-questionpool-for-quiz-sections)
   - [Step 3: Create the Assessment with Sections](#step-3-create-the-assessment-with-sections)
4. [Assessment Types & Section Configurations](#assessment-types--section-configurations)
5. [Seed Data Reference](#seed-data-reference)

---

## Entity Relationship Overview

```
┌──────────────┐         ┌─────────────────┐
│     User     │         │   Assessment    │
│              │─────────│  (Assesment)    │
│  assessmentId│         │                 │
└──────────────┘         │  sections[]     │
                         │   ├─ type: quiz │──────────┐
                         │   │   └─ questionPool ──►  │  QuestionPool
                         │   │                        │  └─ questions[]
                         │   └─ type: coding          │     ├─ MCQ
                         │       └─ problemPool[]──►  │     ├─ MSQ
                         └─────────────────┘          │     └─ Text
                                  │                   └──────────┘
                                  │ (1:many)
                                  ▼
                         ┌─────────────────┐
                         │  Assessment     │        ┌──────────┐
                         │  Solution       │        │  Problem │
                         │                 │        │          │
                         │  response[]     │        │ testCases│
                         │  ├─ quizAnswers │        │ examples │
                         │  └─ codingAnswers        │ functionSignature
                         └─────────────────┘        └──────────┘
```

**Key Relationships:**
- A `User` is assigned one `Assessment` via `assessmentId`
- An `Assessment` has many `Section`s (embedded)
- A quiz `Section` references one `QuestionPool` → contains N questions
- A coding `Section` references N `Problem`s via `problemPool[]`
- A `User` attempt creates one `AssessmentSolution` (with per-section responses)

---

## Model Definitions

---

### 1. User Model

Represents a candidate registered to take an assessment.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `userId` | String | ✅ | — | Unique identifier (e.g., `user_123456789_abcdef`) |
| `name` | String | ✅ | — | Full name (2–100 characters) |
| `email` | String | ✅ | — | Unique, validated email address |
| `password` | String | ❌ | — | Bcrypt-hashed password |
| `skillLevel` | Enum | ✅ | — | `easy` \| `medium` \| `hard` |
| `assessmentId` | String | ✅ | — | ID of the assigned assessment |
| `assessmentStatus` | Enum | — | `not_started` | `not_started` \| `in_progress` \| `completed` |
| `startedAt` | Date | ❌ | — | Timestamp when assessment was started |
| `completedAt` | Date | ❌ | — | Timestamp when assessment was submitted |
| `score` | Number | ❌ | — | Final score achieved |
| `totalScore` | Number | ❌ | — | Maximum possible score |
| `responseData` | Mixed | ❌ | — | Raw snapshot of user response data |
| `createdAt` | Date | — | auto | Auto-generated on creation |
| `updatedAt` | Date | — | auto | Auto-updated on modification |

---

### 2. Problem Model

Defines a single coding challenge used in `coding` or `mixed` assessment sections.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `title` | String | ✅ | — | Problem title (displayed to candidate) |
| `difficulty` | Enum | ✅ | — | `Easy` \| `Medium` \| `Hard` |
| `description` | String | ✅ | — | Full problem statement (Markdown supported) |
| `constraints` | Array\<String\> | ❌ | `[]` | List of constraint strings (e.g., `"1 ≤ n ≤ 10^5"`) |
| `inputFormat` | Array\<String\> | ❌ | `[]` | Description of input format, line by line |
| `outputFormat` | Array\<String\> | ❌ | `[]` | Description of expected output |
| `examples` | Array\<Object\> | ❌ | `[]` | Sample cases shown to the candidate (see below) |
| `testCases` | Array\<Object\> | ✅ | `[]` | Actual test cases used for evaluation (see below) |
| `functionSignature` | Array\<Object\> | ❌ | `[]` | Starter code template per language (see below) |
| `languagesSupported` | Array\<Enum\> | ✅ | — | Allowed languages: `python` \| `cpp` \| `java` \| `c` \| `javascript` |
| `hints` | Array\<String\> | ❌ | `[]` | Optional hints revealed to candidate |
| `timeLimit` | Number | ❌ | `1000` | Execution timeout in milliseconds |
| `memoryLimit` | Number | ❌ | `256000` | Memory limit in bytes |
| `createdAt` | Date | — | auto | — |
| `updatedAt` | Date | — | auto | — |

#### `examples[]` Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `input` | String | Sample input string |
| `output` | String | Expected output string |
| `explanation` | String | Human-readable explanation of the sample |

#### `testCases[]` Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `input` | String | Test input string |
| `output` | String | Expected output string |
| `hidden` | Boolean | `true` = hidden from candidate, used only for grading |

#### `functionSignature[]` Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `language` | String | Language identifier (e.g., `python`, `cpp`) |
| `signature` | String | Boilerplate/starter code shown in the editor |

---

### 3. QuestionPool Model

A named collection of objective questions (MCQ, MSQ, or Text). Referenced by quiz sections in an Assessment.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `name` | String | ✅ | — | Descriptive name for the pool (e.g., `"DSA Quiz Pool"`) |
| `questions` | Array\<Object\> | ✅ | `[]` | Embedded question objects (see below) |
| `problem` | ObjectId | ❌ | — | Optional reference to a linked `Problem` document |
| `createdAt` | Date | — | auto | — |
| `updatedAt` | Date | — | auto | — |

#### `questions[]` Object (Embedded)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `question` | String | ✅ | Question text (Markdown supported) |
| `image` | String | ❌ | URL to an optional image for the question |
| `category` | Enum | ✅ | `MCQ` (single correct) \| `MSQ` (multi-correct) \| `Text` (free text) |
| `marks` | Number | ✅ | Positive marks awarded for a correct answer |
| `negative` | Number | ❌ | Marks deducted for a wrong answer (default: `0`) |
| `options` | Array\<Object\> | ❌ | Answer options — required for `MCQ` and `MSQ` (see below) |
| `answer` | String | ❌ | Correct answer text — required for `Text` category |
| `topic` | String | ❌ | Topic/tag for the question (e.g., `"Arrays"`) |

#### `options[]` Object (inside a Question)
| Field | Type | Description |
| :--- | :--- | :--- |
| `text` | String | Option text |
| `image` | String | Optional image URL for the option |
| `isCorrect` | Boolean | `true` if this option is a correct answer |

> **Note:** For `MCQ`, exactly one option has `isCorrect: true`. For `MSQ`, one or more options can be correct.

---

### 4. Assessment Model

Defines the complete structure of an assessment: its sections, pools, scoring, and timing.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | String | ✅ | Display name of the assessment |
| `slug` | String | ✅ | URL-friendly unique identifier (e.g., `"js-fundamentals"`) |
| `sections` | Array\<Object\> | ✅ | Ordered list of assessment sections (see below) |
| `createdAt` | Date | — | Auto-generated |
| `updatedAt` | Date | — | Auto-generated |

#### `sections[]` Object (Embedded)
| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `title` | String | ✅ | — | Section title (e.g., `"MCQ Round"`, `"Coding Challenge"`) |
| `type` | Enum | ✅ | `quiz` | `quiz` \| `coding` \| `mixed` |
| `description` | String | ❌ | — | Instructions shown to the candidate before this section |
| `questionPool` | ObjectId | ❌ | — | Ref to `QuestionPool` — **required when `type` is `quiz` or `mixed`** |
| `problemPool` | Array\<ObjectId\> | ❌ | `[]` | Refs to `Problem` — **required when `type` is `coding` or `mixed`** |
| `maxQuestion` | Number | ❌ | — | How many questions/problems to randomly pick from the pool |
| `maxTime` | Number | ❌ | — | Time limit for this section in **minutes** |
| `maxScore` | Number | ❌ | — | Maximum achievable score for this section |

> **Important:** The platform randomly picks `maxQuestion` items from the pool at assessment start, ensuring each candidate gets a different subset.

---

### 5. AssessmentSolution Model

Stores a candidate's live and final responses to an assessment. Created when the user starts an assessment.

| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `userId` | ObjectId | ✅ | — | Reference to `User` |
| `assessmentId` | ObjectId | ✅ | — | Reference to `Assessment` |
| `currSection` | Number | — | `0` | Index of the section the user is currently on |
| `ufmAttempts` | Number | — | `0` | Count of Unfair Means (proctoring) alerts triggered |
| `assesmentSnapshot` | Array | ❌ | `[]` | Snapshot of the assessment structure at start time |
| `response` | Array | ❌ | `[]` | Per-section response objects (see below) |
| `hasAgreed` | Boolean | — | `false` | Whether user accepted the terms before starting |
| `isSubmitted` | Boolean | — | `false` | Whether the entire assessment has been finalized |
| `userDetails` | Mixed | ❌ | — | Snapshot of user info at the time of submission |
| `isEvaluated` | Boolean | — | `false` | Whether the background evaluator has scored this |
| `feedback` | Array | ❌ | `[]` | Grading feedback generated by the evaluator |
| `notified` | Boolean | — | `false` | Whether the result notification email was sent |
| `certificateSent` | Boolean | — | `false` | Whether a certificate was issued |
| `createdAt` | Date | — | auto | — |
| `updatedAt` | Date | — | auto | — |

#### `response[]` — SectionResponse Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `sectionId` | ObjectId | Reference to the section within the Assessment |
| `sectionType` | Enum | `quiz` \| `coding` |
| `quizAnswers` | Array | User's answers for MCQ/MSQ questions |
| `codingAnswers` | Array | User's code submissions per problem |
| `totalQuestions` | Number | Total questions assigned to user in this section |
| `correctAnswers` | Number | Number of correct answers (filled after evaluation) |
| `startedAt` | Date | When the user opened this section |
| `pausedAt` | Date | Last pause timestamp |
| `isSubmitted` | Boolean | Whether the user has locked in this section |

---

## How to Create an Assessment (Step-by-Step)

The creation order matters due to references. Always create in this order:

```
Problems → QuestionPool → Assessment
```

---

### Step 1: Create Problems (for coding sections)

Each `Problem` is an independent document. Create one per coding challenge.

```json
// POST /api/v1/problems  (or insert directly via seed)
{
  "title": "Two Sum",
  "difficulty": "Easy",
  "description": "Given an array of integers `nums` and a target integer `target`, return the indices of the two numbers that add up to `target`.",
  "constraints": [
    "2 ≤ nums.length ≤ 10^4",
    "-10^9 ≤ nums[i] ≤ 10^9",
    "Exactly one valid answer exists"
  ],
  "inputFormat": [
    "First line: space-separated integers (the array)",
    "Second line: integer target"
  ],
  "outputFormat": [
    "Two space-separated integers representing the indices"
  ],
  "examples": [
    {
      "input": "2 7 11 15\n9",
      "output": "0 1",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so return [0, 1]"
    }
  ],
  "testCases": [
    { "input": "2 7 11 15\n9",  "output": "0 1",  "hidden": false },
    { "input": "3 2 4\n6",      "output": "1 2",  "hidden": false },
    { "input": "3 3\n6",        "output": "0 1",  "hidden": true  },
    { "input": "1 5 3 7\n8",    "output": "1 3",  "hidden": true  }
  ],
  "functionSignature": [
    {
      "language": "python",
      "signature": "import sys\ndata = sys.stdin.read().split('\\n')\nnums = list(map(int, data[0].split()))\ntarget = int(data[1])\n# Write your solution here"
    },
    {
      "language": "javascript",
      "signature": "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split('\\n');\nconst nums = lines[0].split(' ').map(Number);\nconst target = Number(lines[1]);\n// Write your solution here"
    }
  ],
  "languagesSupported": ["python", "javascript"],
  "hints": ["Try using a hash map for O(n) time complexity"],
  "timeLimit": 2000,
  "memoryLimit": 256000
}
```

> Save the returned `_id` (e.g., `"64fa...0001"`) — you'll reference it in the Assessment's `problemPool`.

---

### Step 2: Create a QuestionPool (for quiz sections)

A `QuestionPool` holds all the questions from which the platform randomly picks `maxQuestion` for each candidate.

```json
// POST /api/v1/question-pools  (or insert directly via seed)
{
  "name": "JavaScript Concepts Pool",
  "questions": [
    {
      "question": "Which of the following correctly declares a constant in JavaScript?",
      "category": "MCQ",
      "marks": 5,
      "negative": 1,
      "topic": "Syntax",
      "options": [
        { "text": "var x = 10;",   "isCorrect": false },
        { "text": "let x = 10;",   "isCorrect": false },
        { "text": "const x = 10;", "isCorrect": true  },
        { "text": "constant x = 10;", "isCorrect": false }
      ]
    },
    {
      "question": "Which of these are falsy values in JavaScript? (Select all that apply)",
      "category": "MSQ",
      "marks": 10,
      "negative": 0,
      "topic": "Type Coercion",
      "options": [
        { "text": "0",          "isCorrect": true  },
        { "text": "\"\"",       "isCorrect": true  },
        { "text": "null",       "isCorrect": true  },
        { "text": "\"false\"",  "isCorrect": false },
        { "text": "[]",         "isCorrect": false }
      ]
    },
    {
      "question": "What does `typeof null` return in JavaScript?",
      "category": "Text",
      "marks": 5,
      "negative": 0,
      "topic": "Type System",
      "answer": "object"
    }
  ]
}
```

> Save the returned `_id` (e.g., `"64fa...0002"`) — you'll reference it in the Assessment's `questionPool`.

---

### Step 3: Create the Assessment with Sections

Now wire everything together. Each section references the IDs from Steps 1 and 2.

#### Example A: Pure Coding Assessment (one section)

```json
{
  "name": "JavaScript Fundamentals",
  "slug": "js-fundamentals",
  "sections": [
    {
      "title": "Coding Challenge",
      "type": "coding",
      "description": "Solve the following problem. You may use any approach.",
      "problemPool": ["64fa...0001"],
      "maxQuestion": 1,
      "maxTime": 30,
      "maxScore": 100
    }
  ]
}
```

#### Example B: Pure Quiz Assessment (one section)

```json
{
  "name": "JavaScript MCQ Round",
  "slug": "js-mcq",
  "sections": [
    {
      "title": "Multiple Choice Questions",
      "type": "quiz",
      "description": "Answer the following questions. Negative marking applies.",
      "questionPool": "64fa...0002",
      "maxQuestion": 10,
      "maxTime": 20,
      "maxScore": 50
    }
  ]
}
```

#### Example C: Full Assessment — Quiz + Coding (two sections)

```json
{
  "name": "Full Stack Developer Test",
  "slug": "fullstack-dev-test",
  "sections": [
    {
      "title": "Section 1 — Conceptual Quiz",
      "type": "quiz",
      "description": "10 questions. +5 for correct, -1 for incorrect.",
      "questionPool": "64fa...0002",
      "maxQuestion": 10,
      "maxTime": 20,
      "maxScore": 50
    },
    {
      "title": "Section 2 — Coding Problem",
      "type": "coding",
      "description": "Solve the assigned problem within 30 minutes.",
      "problemPool": ["64fa...0001"],
      "maxQuestion": 1,
      "maxTime": 30,
      "maxScore": 100
    }
  ]
}
```

#### Example D: Mixed Section (Quiz + Coding in one section)

```json
{
  "name": "Data Structures Challenge",
  "slug": "ds-challenge",
  "sections": [
    {
      "title": "DSA Round",
      "type": "mixed",
      "description": "Answer MCQs and solve coding problems.",
      "questionPool": "64fa...0002",
      "problemPool": ["64fa...0001", "64fa...0003"],
      "maxQuestion": 5,
      "maxTime": 45,
      "maxScore": 150
    }
  ]
}
```

---

## Assessment Types & Section Configurations

| Section `type` | `questionPool` | `problemPool` | Candidate Experience |
| :--- | :---: | :---: | :--- |
| `quiz` | ✅ Required | ❌ Not used | MCQ/MSQ/Text questions only |
| `coding` | ❌ Not used | ✅ Required | Code editor with problems |
| `mixed` | ✅ Required | ✅ Required | Both MCQs and coding problems |

### `maxQuestion` Behaviour

- The platform **randomly selects** `maxQuestion` items from the pool at assessment start.
- This means candidates in the same assessment may get **different subsets** of questions.
- If `maxQuestion` ≥ pool size, all items are presented (still shuffled).
- For `mixed` sections, `maxQuestion` applies to the quiz portion; all problems in `problemPool` are assigned.

### Scoring

- **Quiz**: Each correct answer adds `question.marks`; each wrong answer subtracts `question.negative`.
- **Coding**: Evaluated per test case pass rate; full `maxScore` if all hidden test cases pass.
- **Total score**: Sum of all section scores stored in `User.score` and `User.totalScore`.

---

## Seed Data Reference

The `seed.json` file provides ready-to-use documents for local development.

### Problems (4 documents)

| `_id` | Title | Language | Difficulty |
| :--- | :--- | :--- | :--- |
| `65db4a7b7a1e2c3d4e5f6101` | Reverse a String (JS) | `javascript` | Easy |
| `65db4a7b7a1e2c3d4e5f6201` | Factorial (Python) | `python` | Easy |
| `65db4a7b7a1e2c3d4e5f6601` | Max in Array (C++) | `cpp` | Easy |
| `65db4a7b7a1e2c3d4e5f6701` | Even or Odd (Java) | `java` | Easy |

### QuestionPools (1 document)

| `_id` | Name | Questions |
| :--- | :--- | :--- |
| `65db4a7b7a1e2c3d4e5f6301` | General Quiz | 1 MCQ (`"What is 1+1?"`, 5 marks) |

### Assessments (4 documents)

| `_id` | Name | Slug | Section Type | Problem/Pool Used |
| :--- | :--- | :--- | :--- | :--- |
| `65db4a7b7a1e2c3d4e5f6401` | JavaScript Fundamentals | `js-fundamentals` | `coding` | `6101` |
| `65db4a7b7a1e2c3d4e5f6501` | Python Mastery | `py-mastery` | `coding` | `6201` |
| `65db4a7b7a1e2c3d4e5f6602` | C++ Logic Challenge | `cpp-logic` | `coding` | `6601` |
| `65db4a7b7a1e2c3d4e5f6702` | Java Core Assessment | `java-core` | `coding` | `6701` |

To seed the database:
```bash
npm run seed
```

> This clears existing `problems`, `questionpools`, and `assesments` collections, then inserts the seed data.
