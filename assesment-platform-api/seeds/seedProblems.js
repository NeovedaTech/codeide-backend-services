import mongoose from "mongoose";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Problem from "../models/Problem.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const problems = [
  // ── EASY ───────────────────────────────────────────────────────────────────
  {
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists",
    ],
    inputFormat: [
      "First line: space-separated integers (the array nums)",
      "Second line: the integer target",
    ],
    outputFormat: ["Two space-separated integers (0-based indices)"],
    examples: [
      { input: "2 7 11 15\n9",  output: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "3 2 4\n6",      output: "1 2", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
      { input: "3 3\n6",        output: "0 1", explanation: "nums[0] + nums[1] = 3 + 3 = 6" },
    ],
    testCases: [
      { input: "2 7 11 15\n9",    output: "0 1",  hidden: false },
      { input: "3 2 4\n6",        output: "1 2",  hidden: false },
      { input: "3 3\n6",          output: "0 1",  hidden: true  },
      { input: "1 2 3 4 5\n9",    output: "3 4",  hidden: true  },
      { input: "-1 -2 -3 -4\n-7", output: "2 3",  hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function twoSum(nums, target) {\n  // your code here\n  return [];\n}" },
      { language: "python",     signature: "def two_sum(nums: list[int], target: int) -> list[int]:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use a hash map to store each number's index as you iterate.",
      "For each element check if target − element exists in the map.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Palindrome Check",
    difficulty: "Easy",
    description: `Given a string \`s\`, return \`true\` if it is a palindrome, otherwise return \`false\`.

A palindrome reads the same forward and backward. Consider only alphanumeric characters and ignore case.`,
    constraints: [
      "1 ≤ s.length ≤ 2 × 10⁵",
      "s consists of printable ASCII characters",
    ],
    inputFormat: ["A single string s"],
    outputFormat: ["true or false"],
    examples: [
      { input: "A man a plan a canal Panama", output: "true",  explanation: "After filtering: amanaplanacanalpanama" },
      { input: "race a car",                  output: "false", explanation: "After filtering: raceacar" },
      { input: " ",                           output: "true",  explanation: "Empty after filtering → palindrome" },
    ],
    testCases: [
      { input: "A man a plan a canal Panama", output: "true",  hidden: false },
      { input: "race a car",                  output: "false", hidden: false },
      { input: " ",                           output: "true",  hidden: true  },
      { input: "0P",                          output: "false", hidden: true  },
      { input: "Was it a car or a cat I saw", output: "true",  hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function isPalindrome(s) {\n  // your code here\n  return false;\n}" },
      { language: "python",     signature: "def is_palindrome(s: str) -> bool:\n    # your code here\n    pass" },
    ],
    hints: [
      "Strip non-alphanumeric characters and convert to lowercase first.",
      "Compare the string with its reverse, or use two pointers.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "FizzBuzz",
    difficulty: "Easy",
    description: `Write a function that returns an array of strings from \`1\` to \`n\` where:
- Multiples of **3** → \`"Fizz"\`
- Multiples of **5** → \`"Buzz"\`
- Multiples of both 3 and 5 → \`"FizzBuzz"\`
- All other numbers → the number as a string`,
    constraints: ["1 ≤ n ≤ 10⁴"],
    inputFormat: ["A single integer n"],
    outputFormat: ["A JSON array of strings, e.g. [\"1\",\"2\",\"Fizz\"]"],
    examples: [
      { input: "5",  output: '["1","2","Fizz","4","Buzz"]',           explanation: "3→Fizz, 5→Buzz" },
      { input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', explanation: "15 is divisible by both" },
    ],
    testCases: [
      { input: "5",  output: '["1","2","Fizz","4","Buzz"]', hidden: false },
      { input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', hidden: false },
      { input: "1",  output: '["1"]',                       hidden: true  },
      { input: "3",  output: '["1","2","Fizz"]',             hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function fizzBuzz(n) {\n  // your code here\n  return [];\n}" },
      { language: "python",     signature: "def fizz_buzz(n: int) -> list[str]:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use the modulo (%) operator.",
      "Check divisibility by 15 (both 3 and 5) before checking 3 or 5 alone.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Reverse a String",
    difficulty: "Easy",
    description: "Write a function that takes a string and returns it reversed.",
    constraints: [
      "1 ≤ s.length ≤ 10⁵",
      "s consists of printable ASCII characters",
    ],
    inputFormat: ["A single string s"],
    outputFormat: ["The reversed string"],
    examples: [
      { input: "hello",      output: "olleh",      explanation: "Characters reversed" },
      { input: "abcde",      output: "edcba",      explanation: "Characters reversed" },
      { input: "racecar",    output: "racecar",    explanation: "Palindrome — same when reversed" },
    ],
    testCases: [
      { input: "hello",      output: "olleh",      hidden: false },
      { input: "abcde",      output: "edcba",      hidden: false },
      { input: "racecar",    output: "racecar",    hidden: true  },
      { input: "a",          output: "a",          hidden: true  },
      { input: "JavaScript", output: "tpircSavaJ", hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function reverseString(s) {\n  // your code here\n  return '';\n}" },
      { language: "python",     signature: "def reverse_string(s: str) -> str:\n    # your code here\n    pass" },
    ],
    hints: ["In JS: split('').reverse().join('')", "In Python: s[::-1]"],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Maximum Subarray Sum",
    difficulty: "Easy",
    description: `Given an integer array \`nums\`, find the **contiguous subarray** (containing at least one number) which has the **largest sum** and return its sum.

This is the classic Kadane's algorithm problem.`,
    constraints: [
      "1 ≤ nums.length ≤ 10⁵",
      "-10⁴ ≤ nums[i] ≤ 10⁴",
    ],
    inputFormat: ["Space-separated integers"],
    outputFormat: ["A single integer — the maximum subarray sum"],
    examples: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6",  explanation: "[4,-1,2,1] has the largest sum = 6" },
      { input: "1",                      output: "1",  explanation: "Single element" },
      { input: "5 4 -1 7 8",             output: "23", explanation: "Entire array" },
    ],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6",   hidden: false },
      { input: "1",                      output: "1",   hidden: false },
      { input: "5 4 -1 7 8",             output: "23",  hidden: true  },
      { input: "-1 -2 -3",               output: "-1",  hidden: true  },
      { input: "0 -3 1 1 1 -1 0",        output: "3",   hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function maxSubArray(nums) {\n  // your code here\n  return 0;\n}" },
      { language: "python",     signature: "def max_sub_array(nums: list[int]) -> int:\n    # your code here\n    pass" },
    ],
    hints: [
      "Kadane's algorithm: track current sum and global max.",
      "At each step: currentSum = max(num, currentSum + num).",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  // ── MEDIUM ─────────────────────────────────────────────────────────────────
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: `Given a string \`s\`, find the **length** of the longest substring without repeating characters.`,
    constraints: [
      "0 ≤ s.length ≤ 5 × 10⁴",
      "s consists of English letters, digits, symbols and spaces",
    ],
    inputFormat: ["A single string s"],
    outputFormat: ["A single integer — the length of the longest substring"],
    examples: [
      { input: "abcabcbb", output: "3", explanation: "\"abc\" has length 3" },
      { input: "bbbbb",    output: "1", explanation: "\"b\" has length 1" },
      { input: "pwwkew",   output: "3", explanation: "\"wke\" has length 3" },
    ],
    testCases: [
      { input: "abcabcbb", output: "3", hidden: false },
      { input: "bbbbb",    output: "1", hidden: false },
      { input: "pwwkew",   output: "3", hidden: true  },
      { input: "",         output: "0", hidden: true  },
      { input: "dvdf",     output: "3", hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function lengthOfLongestSubstring(s) {\n  // your code here\n  return 0;\n}" },
      { language: "python",     signature: "def length_of_longest_substring(s: str) -> int:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use a sliding window with two pointers.",
      "Use a Set or Map to track characters in the current window.",
      "When a repeat is found, shrink the window from the left.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Valid Parentheses",
    difficulty: "Medium",
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is **valid**.

A string is valid if:
1. Open brackets are closed by the same type of bracket.
2. Open brackets are closed in the correct order.
3. Every close bracket has a corresponding open bracket.`,
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses characters only",
    ],
    inputFormat: ["A single string s"],
    outputFormat: ["true or false"],
    examples: [
      { input: "()",     output: "true",  explanation: "Matching parentheses" },
      { input: "()[]{}", output: "true",  explanation: "All matched" },
      { input: "(]",     output: "false", explanation: "Wrong closing bracket" },
    ],
    testCases: [
      { input: "()",       output: "true",  hidden: false },
      { input: "()[]{}" ,  output: "true",  hidden: false },
      { input: "(]",       output: "false", hidden: true  },
      { input: "([)]",     output: "false", hidden: true  },
      { input: "{[]}",     output: "true",  hidden: true  },
      { input: "]",        output: "false", hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function isValid(s) {\n  // your code here\n  return false;\n}" },
      { language: "python",     signature: "def is_valid(s: str) -> bool:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use a stack data structure.",
      "Push open brackets onto the stack; when you see a close bracket pop the top and check it matches.",
      "At the end the stack should be empty.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Merge Sorted Arrays",
    difficulty: "Medium",
    description: `You are given two **sorted** integer arrays \`nums1\` and \`nums2\`.

Merge \`nums2\` into \`nums1\` as one **sorted** array and return it. Assume you have enough space.`,
    constraints: [
      "0 ≤ nums1.length, nums2.length ≤ 200",
      "-10⁹ ≤ nums1[i], nums2[j] ≤ 10⁹",
      "Both arrays are sorted in non-decreasing order",
    ],
    inputFormat: [
      "First line: space-separated integers of nums1 (may be empty)",
      "Second line: space-separated integers of nums2 (may be empty)",
    ],
    outputFormat: ["Space-separated integers — the merged sorted array"],
    examples: [
      { input: "1 2 3\n2 5 6",  output: "1 2 2 3 5 6", explanation: "Standard merge" },
      { input: "1\n",           output: "1",            explanation: "nums2 is empty" },
      { input: "\n1",           output: "1",            explanation: "nums1 is empty" },
    ],
    testCases: [
      { input: "1 2 3\n2 5 6",    output: "1 2 2 3 5 6", hidden: false },
      { input: "1\n",             output: "1",            hidden: false },
      { input: "\n1",             output: "1",            hidden: true  },
      { input: "0\n1 2 3",        output: "0 1 2 3",      hidden: true  },
      { input: "4 5 6\n1 2 3",    output: "1 2 3 4 5 6",  hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function mergeSortedArrays(nums1, nums2) {\n  // your code here\n  return [];\n}" },
      { language: "python",     signature: "def merge_sorted_arrays(nums1: list[int], nums2: list[int]) -> list[int]:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use two pointers, one for each array, and compare elements.",
      "Alternatively concat and sort — though O(n log n) vs O(n).",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Flatten Nested Array",
    difficulty: "Medium",
    description: `Write a function that takes a **nested array** of any depth and returns a **flat** array containing all elements in order.

**Example:**
- Input: \`[1, [2, [3, [4]], 5]]\`
- Output: \`[1, 2, 3, 4, 5]\``,
    constraints: [
      "0 ≤ total elements ≤ 10⁴",
      "Values are integers between -10⁵ and 10⁵",
      "Nesting depth ≤ 100",
    ],
    inputFormat: ["A JSON string representing the nested array"],
    outputFormat: ["A JSON string representing the flat array"],
    examples: [
      { input: "[1,[2,[3,[4]],5]]",   output: "[1,2,3,4,5]", explanation: "All nested elements flattened" },
      { input: "[[1,2],[3,[4,5]]]",   output: "[1,2,3,4,5]", explanation: "Two levels deep" },
    ],
    testCases: [
      { input: "[1,[2,[3,[4]],5]]",   output: "[1,2,3,4,5]", hidden: false },
      { input: "[[1,2],[3,[4,5]]]",   output: "[1,2,3,4,5]", hidden: false },
      { input: "[]",                  output: "[]",           hidden: true  },
      { input: "[1,2,3]",             output: "[1,2,3]",      hidden: true  },
      { input: "[[[[1]]]]",           output: "[1]",          hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function flatten(arr) {\n  // your code here\n  return [];\n}" },
      { language: "python",     signature: "def flatten(arr) -> list:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use recursion: if an element is an array, recurse into it.",
      "In JS you can also use arr.flat(Infinity).",
      "A stack-based iterative approach also works.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Group Anagrams",
    difficulty: "Medium",
    description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in any order.

Two strings are anagrams if one is a rearrangement of the other (same characters, same frequencies).`,
    constraints: [
      "1 ≤ strs.length ≤ 10⁴",
      "0 ≤ strs[i].length ≤ 100",
      "strs[i] consists of lowercase English letters",
    ],
    inputFormat: ["Space-separated strings"],
    outputFormat: ["JSON: array of arrays, each inner array sorted alphabetically, outer array sorted by first element"],
    examples: [
      { input: "eat tea tan ate nat bat", output: '[["ate","eat","tea"],["bat"],["ant","nat","tan"]]', explanation: "eat/tea/ate are anagrams; nat/tan are anagrams; bat is alone" },
      { input: "a",                       output: '[["a"]]',                                           explanation: "Single string" },
    ],
    testCases: [
      { input: "eat tea tan ate nat bat", output: '[["ate","eat","tea"],["bat"],["ant","nat","tan"]]', hidden: false },
      { input: "a",                       output: '[["a"]]',                                           hidden: false },
      { input: "",                        output: '[[""]]',                                            hidden: true  },
      { input: "abc cba bac xyz",         output: '[["abc","bac","cba"],["xyz"]]',                    hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function groupAnagrams(strs) {\n  // your code here\n  return [];\n}" },
      { language: "python",     signature: "def group_anagrams(strs: list[str]) -> list[list[str]]:\n    # your code here\n    pass" },
    ],
    hints: [
      "Sort each string's characters — anagrams will produce the same sorted key.",
      "Use a hash map from sorted-key → list of original strings.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  {
    title: "Debounce Function",
    difficulty: "Medium",
    description: `Implement a \`debounce(fn, delay)\` function. A debounced function delays invoking \`fn\` until after \`delay\` milliseconds have elapsed since the **last** call.

**Behaviour:**
- Each new call resets the timer.
- \`fn\` is called with the arguments of the most recent invocation.`,
    constraints: ["0 ≤ delay ≤ 10⁴", "fn is a valid function"],
    inputFormat: ["A function fn and a delay in milliseconds"],
    outputFormat: ["A debounced version of fn"],
    examples: [
      { input: "fn=(x)=>x*2, delay=100", output: "Calls fn once after 100 ms of inactivity", explanation: "Classic debounce" },
    ],
    testCases: [
      { input: "single call",  output: "called once after delay",      hidden: false },
      { input: "rapid calls",  output: "only last call executes",       hidden: true  },
      { input: "no calls",     output: "fn never invoked",              hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function debounce(fn, delay) {\n  // your code here\n}" },
    ],
    hints: [
      "Use setTimeout and clearTimeout.",
      "Store the timer ID between calls and cancel it on each new call.",
      "Call fn.apply(this, args) to preserve context and arguments.",
    ],
    languagesSupported: ["javascript"],
    timeLimit: 2000,
    memoryLimit: 256000,
  },

  // ── HARD ───────────────────────────────────────────────────────────────────
  {
    title: "Longest Palindromic Substring",
    difficulty: "Hard",
    description: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

If multiple answers exist with the same length, return the one that starts earliest.`,
    constraints: [
      "1 ≤ s.length ≤ 1000",
      "s consists of only digits and English letters",
    ],
    inputFormat: ["A single string s"],
    outputFormat: ["The longest palindromic substring"],
    examples: [
      { input: "babad",  output: "bab",   explanation: "\"bab\" and \"aba\" are both valid; return \"bab\" (starts first)" },
      { input: "cbbd",   output: "bb",    explanation: "\"bb\" is the longest palindrome" },
      { input: "a",      output: "a",     explanation: "Single character is always a palindrome" },
      { input: "racecar", output: "racecar", explanation: "Entire string is a palindrome" },
    ],
    testCases: [
      { input: "babad",   output: "bab",     hidden: false },
      { input: "cbbd",    output: "bb",      hidden: false },
      { input: "a",       output: "a",       hidden: true  },
      { input: "racecar", output: "racecar", hidden: true  },
      { input: "abacaba", output: "abacaba", hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function longestPalindrome(s) {\n  // your code here\n  return '';\n}" },
      { language: "python",     signature: "def longest_palindrome(s: str) -> str:\n    # your code here\n    pass" },
    ],
    hints: [
      "Expand around center: for each character (and each pair of adjacent characters), expand outward while characters match.",
      "Track the longest span found so far.",
      "Manacher's algorithm solves this in O(n) but expand-around-center O(n²) is acceptable.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 3000,
    memoryLimit: 256000,
  },

  {
    title: "LRU Cache",
    difficulty: "Hard",
    description: `Design a data structure that follows the **Least Recently Used (LRU)** cache eviction policy.

Implement the \`LRUCache\` class:
- \`LRUCache(capacity)\` — initialise the cache with **positive** size capacity.
- \`get(key)\` — return the value of the key if it exists, otherwise return \`-1\`.
- \`put(key, value)\` — update or insert the key. If the number of keys exceeds \`capacity\`, evict the **least recently used** key.

Both \`get\` and \`put\` must run in **O(1)** average time.`,
    constraints: [
      "1 ≤ capacity ≤ 3000",
      "0 ≤ key ≤ 10⁴",
      "0 ≤ value ≤ 10⁵",
      "At most 2 × 10⁵ calls to get and put",
    ],
    inputFormat: [
      "First line: capacity",
      "Subsequent lines: 'get key' or 'put key value'",
    ],
    outputFormat: ["One output line per 'get' call: the value or -1"],
    examples: [
      {
        input:  "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4",
        output: "1\n-1\n1\n3\n4",
        explanation: "After put(3,3) key 2 is evicted (LRU). After put(4,4) key 3 was MRU so key 1... see trace.",
      },
    ],
    testCases: [
      {
        input:  "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4",
        output: "1\n-1\n1\n3\n4",
        hidden: false,
      },
      { input: "1\nput 1 1\nput 2 2\nget 1",    output: "-1",  hidden: true },
      { input: "2\nput 1 1\nget 1\nget 2",       output: "1\n-1", hidden: true },
    ],
    functionSignature: [
      {
        language: "javascript",
        signature:
          "class LRUCache {\n  constructor(capacity) {\n    // your code here\n  }\n  get(key) {\n    // your code here\n  }\n  put(key, value) {\n    // your code here\n  }\n}",
      },
      {
        language: "python",
        signature:
          "class LRUCache:\n    def __init__(self, capacity: int):\n        # your code here\n        pass\n    def get(self, key: int) -> int:\n        # your code here\n        pass\n    def put(self, key: int, value: int) -> None:\n        # your code here\n        pass",
      },
    ],
    hints: [
      "Combine a hash map (O(1) lookup) with a doubly-linked list (O(1) move-to-front and eviction).",
      "In Python, collections.OrderedDict gives you this for free.",
      "In JS, insertion-ordered Map works similarly.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 3000,
    memoryLimit: 256000,
  },

  {
    title: "Word Search in Grid",
    difficulty: "Hard",
    description: `Given an \`m × n\` grid of characters \`board\` and a string \`word\`, return \`true\` if \`word\` exists in the grid.

The word must be constructed from letters of sequentially **adjacent** cells (horizontally or vertically). The **same cell may not be used more than once**.`,
    constraints: [
      "m == board.length",
      "n == board[i].length",
      "1 ≤ m, n ≤ 6",
      "1 ≤ word.length ≤ 15",
      "board and word consist of only lowercase and uppercase English letters",
    ],
    inputFormat: [
      "First line: m n (dimensions)",
      "Next m lines: n characters separated by spaces (the grid)",
      "Last line: the target word",
    ],
    outputFormat: ["true or false"],
    examples: [
      {
        input:  "3 4\nA B C E\nS F C S\nA D E E\nABCCED",
        output: "true",
        explanation: "A→B→C→C→E→D path exists",
      },
      {
        input:  "3 4\nA B C E\nS F C S\nA D E E\nSEE",
        output: "true",
        explanation: "S→E→E path exists",
      },
      {
        input:  "3 4\nA B C E\nS F C S\nA D E E\nABCB",
        output: "false",
        explanation: "B cannot be reused",
      },
    ],
    testCases: [
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCCED", output: "true",  hidden: false },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nSEE",    output: "true",  hidden: false },
      { input: "3 4\nA B C E\nS F C S\nA D E E\nABCB",   output: "false", hidden: true  },
      { input: "1 1\nA\nA",                               output: "true",  hidden: true  },
      { input: "2 2\nA B\nC D\nABDC",                     output: "true",  hidden: true  },
    ],
    functionSignature: [
      { language: "javascript", signature: "function exist(board, word) {\n  // your code here\n  return false;\n}" },
      { language: "python",     signature: "def exist(board: list[list[str]], word: str) -> bool:\n    # your code here\n    pass" },
    ],
    hints: [
      "Use DFS with backtracking.",
      "Mark visited cells (e.g. replace with '#') before recursing and restore after.",
      "Try every cell as a starting point.",
    ],
    languagesSupported: ["javascript", "python"],
    timeLimit: 3000,
    memoryLimit: 256000,
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  await db();
  try {
    // Upsert by title so the seed is idempotent
    let inserted = 0;
    let updated  = 0;

    for (const p of problems) {
      const exists = await Problem.findOne({ title: p.title });
      if (exists) {
        await Problem.updateOne({ _id: exists._id }, { $set: p });
        updated++;
      } else {
        await Problem.create(p);
        inserted++;
      }
    }

    console.log(`✅ ${inserted} problems inserted, ${updated} updated.`);
    console.log(`📦 Total: ${problems.length} problems seeded.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
