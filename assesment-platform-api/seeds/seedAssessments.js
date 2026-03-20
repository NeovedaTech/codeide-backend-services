import mongoose from "mongoose";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import Skill from "../models/Skill.js";
import Problem from "../models/Problem.js";
import Assesment from "../models/Assesment.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

// ─── JS Problems ─────────────────────────────────────────────────────────────

const jsProblems = [
  {
    title: "Reverse a String",
    difficulty: "Easy",
    description: "Write a function `reverseString(s)` that takes a string and returns it reversed.\n\n**Example:**\n- Input: `\"hello\"`\n- Output: `\"olleh\"`",
    constraints: ["1 ≤ s.length ≤ 10⁵", "s contains only printable ASCII characters"],
    inputFormat: ["A single string s"],
    outputFormat: ["The reversed string"],
    examples: [
      { input: "hello", output: "olleh", explanation: "Reverse each character" },
      { input: "abcde", output: "edcba", explanation: "Reverse each character" },
    ],
    testCases: [
      { input: "hello", output: "olleh", hidden: false },
      { input: "abcde", output: "edcba", hidden: false },
      { input: "racecar", output: "racecar", hidden: true },
      { input: "a", output: "a", hidden: true },
      { input: "JavaScript", output: "tpircSavaJ", hidden: true },
    ],
    functionSignature: [{ language: "javascript", signature: "function reverseString(s) {\n  // your code here\n}" }],
    hints: ["You can use the built-in split, reverse, join methods", "Or use a simple for loop"],
    languagesSupported: ["javascript"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },
  {
    title: "FizzBuzz",
    difficulty: "Easy",
    description: "Write a function `fizzBuzz(n)` that returns an array of strings from 1 to n where:\n- Multiples of 3 → `\"Fizz\"`\n- Multiples of 5 → `\"Buzz\"`\n- Multiples of both → `\"FizzBuzz\"`\n- Otherwise → the number as a string",
    constraints: ["1 ≤ n ≤ 10⁴"],
    inputFormat: ["A single integer n"],
    outputFormat: ["An array of strings"],
    examples: [
      { input: "5", output: '["1","2","Fizz","4","Buzz"]', explanation: "3 maps to Fizz, 5 maps to Buzz" },
    ],
    testCases: [
      { input: "5", output: '["1","2","Fizz","4","Buzz"]', hidden: false },
      { input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', hidden: false },
      { input: "1", output: '["1"]', hidden: true },
      { input: "3", output: '["1","2","Fizz"]', hidden: true },
    ],
    functionSignature: [{ language: "javascript", signature: "function fizzBuzz(n) {\n  // your code here\n}" }],
    hints: ["Use modulo operator %", "Check FizzBuzz before Fizz and Buzz"],
    languagesSupported: ["javascript"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and a target integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.",
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists"],
    inputFormat: ["First line: space-separated integers (the array)", "Second line: the target integer"],
    outputFormat: ["Two space-separated integers (indices, 0-based)"],
    examples: [
      { input: "2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "3 2 4\n6", output: "1 2", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
    ],
    testCases: [
      { input: "2 7 11 15\n9", output: "0 1", hidden: false },
      { input: "3 2 4\n6", output: "1 2", hidden: false },
      { input: "3 3\n6", output: "0 1", hidden: true },
      { input: "1 2 3 4 5\n9", output: "3 4", hidden: true },
    ],
    functionSignature: [{ language: "javascript", signature: "function twoSum(nums, target) {\n  // your code here\n}" }],
    hints: ["Use a hash map to store seen numbers and their indices", "For each number check if target - number exists in the map"],
    languagesSupported: ["javascript"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },
  {
    title: "Flatten Nested Array",
    difficulty: "Medium",
    description: "Write a function `flatten(arr)` that takes a nested array of any depth and returns a flat array.\n\n**Example:**\n- Input: `[1, [2, [3, [4]], 5]]`\n- Output: `[1, 2, 3, 4, 5]`",
    constraints: ["0 ≤ arr.length ≤ 10⁴", "Values are integers between -10⁵ and 10⁵", "Nesting depth ≤ 100"],
    inputFormat: ["A JSON string representing the nested array"],
    outputFormat: ["A JSON string representing the flat array"],
    examples: [
      { input: "[1,[2,[3,[4]],5]]", output: "[1,2,3,4,5]", explanation: "All nested elements flattened" },
      { input: "[[1,2],[3,[4,5]]]", output: "[1,2,3,4,5]", explanation: "Two levels deep" },
    ],
    testCases: [
      { input: "[1,[2,[3,[4]],5]]", output: "[1,2,3,4,5]", hidden: false },
      { input: "[[1,2],[3,[4,5]]]", output: "[1,2,3,4,5]", hidden: false },
      { input: "[]", output: "[]", hidden: true },
      { input: "[1,2,3]", output: "[1,2,3]", hidden: true },
      { input: "[[[[1]]]]", output: "[1]", hidden: true },
    ],
    functionSignature: [{ language: "javascript", signature: "function flatten(arr) {\n  // your code here\n}" }],
    hints: ["Use recursion", "Or use Array.prototype.flat(Infinity)", "Or use a stack-based iterative approach"],
    languagesSupported: ["javascript"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },
  {
    title: "Debounce Function",
    difficulty: "Medium",
    description: "Implement a `debounce(fn, delay)` function. A debounced function delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was called.\n\nReturn a function that:\n- Cancels any pending invocation if called again before the delay\n- Calls `fn` with the latest arguments after the delay",
    constraints: ["0 ≤ delay ≤ 10⁴", "fn is a valid function"],
    inputFormat: ["A function fn and a delay in milliseconds"],
    outputFormat: ["A debounced version of fn"],
    examples: [
      { input: "fn = (x) => x * 2, delay = 100", output: "Debounced function that calls fn after 100ms of inactivity", explanation: "Classic debounce implementation" },
    ],
    testCases: [
      { input: "basic", output: "called once after delay", hidden: false },
      { input: "rapid calls", output: "only last call executes", hidden: true },
      { input: "no calls after creation", output: "fn never called", hidden: true },
    ],
    functionSignature: [{ language: "javascript", signature: "function debounce(fn, delay) {\n  // your code here\n}" }],
    hints: ["Use setTimeout and clearTimeout", "Store the timer ID between calls", "Call fn.apply(this, args) to preserve context and arguments"],
    languagesSupported: ["javascript"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },
];

// ─── Assessment definitions ───────────────────────────────────────────────────
// Each maps to one problem above by index

const assessmentDefs = [
  { name: "JS Basics – String Manipulation", slug: "js-string-manipulation", problemIndex: 0, maxTime: 20 },
  { name: "JS Basics – FizzBuzz",            slug: "js-fizzbuzz",            problemIndex: 1, maxTime: 20 },
  { name: "JS Algorithms – Two Sum",         slug: "js-two-sum",             problemIndex: 2, maxTime: 30 },
  { name: "JS Arrays – Flatten",             slug: "js-flatten-array",       problemIndex: 3, maxTime: 30 },
  { name: "JS Concepts – Debounce",          slug: "js-debounce",            problemIndex: 4, maxTime: 40 },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  await db();

  try {
    // Find the JavaScript skill
    const jsSkill = await Skill.findOne({ name: { $regex: /^javascript$/i } });
    if (!jsSkill) {
      console.error("❌ JavaScript skill not found. Run seed:excel first.");
      process.exit(1);
    }
    console.log(`✅ Found skill: ${jsSkill.name} (id: ${jsSkill.skillId})`);

    // Remove existing JS assessments (by slug prefix) so the seed is idempotent
    await Assesment.deleteMany({ slug: { $regex: /^js-/ } });
    await Problem.deleteMany({ languagesSupported: ["javascript"] });
    console.log("🗑  Cleared existing JS assessments & problems");

    // Insert problems
    const insertedProblems = await Problem.insertMany(jsProblems);
    console.log(`✅ Inserted ${insertedProblems.length} problems`);

    // Insert assessments
    const assessments = assessmentDefs.map((def) => ({
      name: def.name,
      slug: def.slug,
      skillId: jsSkill.skillId,
      sections: [
        {
          title: "Coding Challenge",
          type: "coding",
          problemPool: [insertedProblems[def.problemIndex]._id],
          maxQuestion: 1,
          maxTime: def.maxTime,
          maxScore: 100,
          description: `Solve the coding problem within ${def.maxTime} minutes.`,
        },
      ],
    }));

    await Assesment.insertMany(assessments);
    console.log(`✅ Inserted ${assessments.length} JavaScript assessments`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
