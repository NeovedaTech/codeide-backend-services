# Assessment Generation Guide

Use this file to generate assessment content via any LLM (Claude, GPT-4, Gemini, etc.)
and insert it into MongoDB using the `seed:json` script.

---

## Step 1 — Determine skill type

| Skill category | Examples | Assessment type |
|---|---|---|
| **Programming language** | JavaScript, TypeScript, Python, Java, C++, Go, Rust | `coding` — uses `problemPool` |
| **Tool / concept / workflow** | Git, Docker, Linux, SQL, Bash, Redis, Kubernetes, CI/CD | `quiz` — uses `questionPool` |

---

## Step 2 — Choose the right prompt

### Prompt A — For LANGUAGE skills (coding problems)

```
You are a technical assessment designer for a developer evaluation platform.

Generate a JSON payload for 5 assessments for the skill "SKILL_NAME" with skillId SKILL_ID.

Each assessment has ONE section of type "coding" with ONE problem.
The problem must only support the language: LANGUAGE_ID
(language IDs: javascript, python, java, cpp, c)

Difficulty spread across the 5 assessments: Easy, Easy, Medium, Medium, Hard.

For each problem include:
- title
- difficulty: "Easy", "Medium", or "Hard"
- description: clear markdown problem statement
- constraints: array of strings
- inputFormat: array of strings describing input
- outputFormat: array of strings describing output
- examples: array of { input, output, explanation } — 2 examples
- testCases: array of { input, output, hidden } — exactly 2 with hidden:false then 3 with hidden:true
- functionSignature: [{ language: "LANGUAGE_ID", signature: "starter code string" }]
- hints: array of 2 hint strings
- timeLimit: 2000
- memoryLimit: 256000
- languagesSupported: ["LANGUAGE_ID"]  ← only the one language, no others

For each assessment include:
- name: human readable title e.g. "JavaScript – Two Sum"
- slug: lowercase hyphenated, prefixed with skill abbreviation e.g. "js-two-sum"
- skillId: SKILL_ID
- sections: array with exactly 1 section object

For each section include:
- title: e.g. "Coding Challenge"
- type: "coding"
- maxQuestion: 1
- maxTime: 20 for Easy, 30 for Medium, 45 for Hard
- maxScore: 100
- description: one sentence about the section
- problemPool: array with exactly 1 inline problem object (no _id field)
- questionPool: null

Return ONLY a single JSON object in this exact shape, no explanation:

{
  "skillId": SKILL_ID,
  "skillName": "SKILL_NAME",
  "type": "language",
  "assessments": [ ...5 assessment objects... ]
}

Important rules:
- No _id fields anywhere
- No trailing commas
- No comments inside the JSON
- languagesSupported must contain ONLY ["LANGUAGE_ID"]
- All 5 slugs must be unique
- testCases: first 2 have "hidden": false, next 3+ have "hidden": true
```

---

### Prompt B — For TOOL / CONCEPT skills (quiz questions)

```
You are a technical assessment designer for a developer evaluation platform.

Generate a JSON payload for 5 assessments for the skill "SKILL_NAME" with skillId SKILL_ID.

Each assessment has ONE section of type "quiz" with ONE question pool of 10 questions.

Question pool composition per assessment:
- 7 MCQ questions (exactly 4 options, exactly 1 correct)
- 2 MSQ questions (exactly 4 options, 2 or more correct)
- 1 Text question (no options, answer is a short expected string)

Each MCQ/MSQ question:
{
  "question": "question text",
  "marks": 2,
  "negative": 0,
  "topic": "sub-topic name e.g. Branching, Merging, Rebasing",
  "category": "MCQ" or "MSQ",
  "options": [
    { "text": "option A", "isCorrect": false },
    { "text": "option B", "isCorrect": true },
    { "text": "option C", "isCorrect": false },
    { "text": "option D", "isCorrect": false }
  ],
  "answer": null
}

Each Text question:
{
  "question": "question text expecting a short typed answer",
  "marks": 2,
  "negative": 0,
  "topic": "sub-topic name",
  "category": "Text",
  "options": [],
  "answer": "expected answer string"
}

For each assessment include:
- name: human readable e.g. "Git – Branching & Merging"
- slug: lowercase hyphenated prefix e.g. "git-branching-merging"
- skillId: SKILL_ID
- sections: array with exactly 1 section

For each section include:
- title: e.g. "Core Concepts Quiz"
- type: "quiz"
- maxQuestion: 10
- maxTime: 20
- maxScore: 100
- description: one sentence about what the quiz covers
- questionPool: { "name": "pool name", "questions": [ ...10 questions... ] }
- problemPool: []

Cover different sub-topics across the 5 assessments so questions don't repeat.
(Example for Git: assessment 1 = Branching+Merging, 2 = Rebasing+History,
3 = Remotes+Push/Pull, 4 = Stash+Tags, 5 = Hooks+Config+Internals)

Return ONLY a single JSON object in this exact shape, no explanation:

{
  "skillId": SKILL_ID,
  "skillName": "SKILL_NAME",
  "type": "tool",
  "assessments": [ ...5 assessment objects... ]
}

Important rules:
- No _id fields anywhere
- No trailing commas
- No comments inside the JSON
- All 5 slugs must be unique
- MCQ must have exactly 1 isCorrect:true option
- MSQ must have at least 2 isCorrect:true options
- Text questions must have "options": [] and a non-empty "answer" string
- "answer" must be null for MCQ and MSQ
```

---

## Step 3 — Save and seed

1. Copy the LLM output JSON into a file, e.g.:
   ```
   assesment-platform-api/seeds/git-assessments.json
   assesment-platform-api/seeds/js-assessments.json
   ```

2. Run:
   ```bash
   npm run seed:json -- --file ./assesment-platform-api/seeds/git-assessments.json
   ```

The script will:
- Delete existing assessments for that `skillId` (idempotent)
- Insert each `Problem` into the `problems` collection
- Insert each `QuestionPool` into the `questionpools` collection
- Wire up the `_id` references automatically
- Insert all 5 assessments into the `assesments` collection

---

## Quick reference — common skillIds

Run this to look up a skill's ID:
```bash
# In mongo shell or Compass
db.skills.findOne({ name: /javascript/i })
db.skills.findOne({ name: /git/i })
```

Or via the API:
```
GET /api/v1/role-skill/skills?search=javascript
GET /api/v1/role-skill/skills?search=git
```

---

## Pre-flight checklist before seeding

- [ ] JSON is valid (paste into [jsonlint.com](https://jsonlint.com) to verify)
- [ ] Exactly 5 objects in `assessments`
- [ ] Each assessment has exactly 1 section
- [ ] All slugs are unique and lowercase-hyphenated
- [ ] `skillId` matches the actual skill in the database
- [ ] No `_id` fields anywhere in the JSON
- [ ] **Language skills**: `languagesSupported` has only 1 language
- [ ] **Language skills**: each problem has 5+ test cases (2 visible, 3+ hidden)
- [ ] **Tool skills**: each pool has exactly 10 questions
- [ ] **Tool skills**: MCQ has exactly 1 correct option, MSQ has 2+, Text has no options
