/**
 * seedFromJson.js
 *
 * Reads an LLM-generated assessment JSON file (produced via generate.md prompt)
 * and inserts it into MongoDB.
 *
 * Usage:
 *   npm run seed:json -- --file ./assesment-platform-api/seeds/git-assessments.json
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import Problem from "../models/Problem.js";
import { QuestionPool } from "../models/QuestionPool.js";
import Assesment from "../models/Assesment.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

// ── Parse --file argument ─────────────────────────────────────────────────────
const fileArgIndex = process.argv.indexOf("--file");
if (fileArgIndex === -1 || !process.argv[fileArgIndex + 1]) {
  console.error("❌ Usage: node seedFromJson.js --file <path-to-json>");
  process.exit(1);
}
const filePath = resolve(process.argv[fileArgIndex + 1]);
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// ── Validate top-level shape ──────────────────────────────────────────────────
if (!payload.assessments || !Array.isArray(payload.assessments)) {
  console.error('❌ JSON must have a top-level "assessments" array.');
  process.exit(1);
}

const seed = async () => {
  await db();
  console.log(`📄 File   : ${filePath}`);
  console.log(`🔧 Skill  : ${payload.skillName} (id: ${payload.skillId})`);
  console.log(`📐 Type   : ${payload.type}`);
  console.log(`📦 Count  : ${payload.assessments.length} assessments\n`);

  // Remove existing assessments for this skill so the seed is idempotent
  const deleted = await Assesment.deleteMany({ skillId: payload.skillId });
  if (deleted.deletedCount) console.log(`🗑  Removed ${deleted.deletedCount} existing assessments for skillId ${payload.skillId}`);

  let insertedAssessments = 0;

  for (const assessment of payload.assessments) {
    const resolvedSections = [];

    for (const section of assessment.sections) {
      const resolvedSection = {
        title:       section.title,
        type:        section.type,
        maxQuestion: section.maxQuestion,
        maxTime:     section.maxTime,
        maxScore:    section.maxScore,
        description: section.description ?? "",
      };

      // ── Coding section: insert problems, replace with ObjectIds ──────────
      if (section.type === "coding" && Array.isArray(section.problemPool)) {
        const problemIds = [];
        for (const problemData of section.problemPool) {
          const problem = await Problem.create(problemData);
          problemIds.push(problem._id);
          console.log(`  ✅ Problem inserted: "${problem.title}"`);
        }
        resolvedSection.problemPool = problemIds;
        resolvedSection.questionPool = null;
      }

      // ── Quiz section: insert question pool, replace with ObjectId ────────
      if (section.type === "quiz" && section.questionPool) {
        const qp = await QuestionPool.create(section.questionPool);
        resolvedSection.questionPool = qp._id;
        resolvedSection.problemPool  = [];
        console.log(`  ✅ QuestionPool inserted: "${qp.name}" (${qp.questions.length} questions)`);
      }

      resolvedSections.push(resolvedSection);
    }

    await Assesment.create({
      name:     assessment.name,
      slug:     assessment.slug,
      skillId:  assessment.skillId ?? payload.skillId,
      sections: resolvedSections,
    });

    console.log(`✅ Assessment: "${assessment.name}"`);
    insertedAssessments++;
  }

  console.log(`\n🎉 Done — inserted ${insertedAssessments} assessments for "${payload.skillName}"`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
