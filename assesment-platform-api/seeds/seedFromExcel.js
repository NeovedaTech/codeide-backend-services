import mongoose from "mongoose";
import XLSX from "xlsx";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

import Skill from "../models/Skill.js";
import Role from "../models/Role.js";
import RoleSkill from "../models/RoleSkills.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const FILE_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../Code-IDE Role skill mapping.xlsx");
const SKILLS_JSON_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "./skills.json");

const seed = async () => {
  await db();

  try {
    await Skill.deleteMany();
    await Role.deleteMany();
    await RoleSkill.deleteMany();

    const workbook = XLSX.readFile(FILE_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Build a lookup: skillId (string) -> name from skills.json
    const skillsJson = JSON.parse(readFileSync(SKILLS_JSON_PATH, "utf-8"));
    const skillNameById = new Map(skillsJson.map((s) => [String(s.id), s.name.trim()]));

    const skillMap = new Map();
    const roleMap = new Map();

    // =========================
    // 1️⃣ INSERT UNIQUE SKILLS
    // =========================
    for (const row of data) {
      const skillId = Number(row["Skill ID"]);

      if (!skillMap.has(skillId)) {
        const skillDoc = await Skill.create({
          skillId,
          name: skillNameById.get(String(skillId)) ?? row["Skill"],
        });

        skillMap.set(skillId, skillDoc._id);
      }
    }

    // =========================
    // 2️⃣ INSERT UNIQUE ROLES
    // =========================
    for (const row of data) {
      const roleId = Number(row["Role ID"]);

      if (!roleMap.has(roleId)) {
        const roleDoc = await Role.create({
          roleId,
          name: row["Role Name"],
        });

        roleMap.set(roleId, roleDoc._id);
      }
    }

    // =========================
    // 3️⃣ INSERT RELATIONS
    // =========================
    const relations = [];

    for (const row of data) {
      relations.push({
        role: roleMap.get(Number(row["Role ID"])),
        skill: skillMap.get(Number(row["Skill ID"])),
        level: row["Level"]?.toLowerCase(),
      });
    }

    await RoleSkill.insertMany(relations);

    console.log("✅ All data inserted (normalized)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
