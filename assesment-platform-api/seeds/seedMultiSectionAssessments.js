import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { QuestionPool } from "../models/QuestionPool.js";
import Problem from "../models/Problem.js";
import Assesment from "../models/Assesment.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const mcq = (question, topic, options, correctIndex) => ({
  question, marks: 2, negative: 0, topic, category: "MCQ", answer: null,
  options: options.map((text, i) => ({ text, isCorrect: i === correctIndex })),
});
const msq = (question, topic, options, correctIndexes) => ({
  question, marks: 3, negative: 0, topic, category: "MSQ", answer: null,
  options: options.map((text, i) => ({ text, isCorrect: correctIndexes.includes(i) })),
});
const text = (question, topic, answer) => ({
  question, marks: 2, negative: 0, topic, category: "Text", options: [], answer,
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ASSESSMENT 1: Full-Stack JavaScript Developer
//  Section 1 → JS Quiz  |  Section 2 → Node.js Quiz  |  Section 3 → Coding
// ═══════════════════════════════════════════════════════════════════════════════

const fullstackJsQuiz1 = {
  name: "Full-Stack JS – JavaScript Fundamentals",
  questions: [
    mcq("What does `typeof null` return?", "Types", ['"null"','"undefined"','"object"','"boolean"'], 2),
    mcq("What is a closure?", "Functions", ["A function with no parameters","A function that retains access to its outer lexical scope","A class with private fields","An IIFE"], 1),
    mcq("What does `Promise.all()` resolve to?", "Async", ["The first resolved value","An array of all resolved values","The last resolved value","A single merged value"], 1),
    mcq("What is event delegation?", "DOM", ["Attaching an event to every element","Attaching a single listener on a parent to handle events from children via bubbling","Preventing event bubbling","Cloning event handlers"], 1),
    mcq("Which method creates a new array with filtered elements?", "Arrays", ["map","reduce","filter","find"], 2),
    mcq("What is the difference between `null` and `undefined`?", "Types", ["They are the same","`undefined` means a variable was declared but not assigned; `null` is an explicit empty value","null is used for numbers, undefined for strings","Both are objects"], 1),
    mcq("What does the spread operator do in `{...obj1, ...obj2}`?", "ES6+", ["Mutates obj1","Creates a shallow merged copy of both objects","Deep clones both objects","Compares two objects"], 1),
    mcq("What is optional chaining (`?.`)?", "ES6+", ["A way to check if a variable is null","A syntax to safely access nested object properties, returning undefined if any part is null/undefined","A type assertion","A destructuring pattern"], 1),
    mcq("What does `Array.prototype.reduce()` do?", "Arrays", ["Filters an array","Transforms an array into a single accumulated value","Sorts an array","Flattens a nested array"], 1),
    mcq("What is the event loop?", "Runtime", ["A loop inside a for statement","The mechanism that allows JavaScript to perform non-blocking operations by offloading operations to the browser and processing callbacks from the queue","A thread pool manager","A way to iterate over events"], 1),
    msq("Which are falsy values in JavaScript?", "Types", ["0","''","null","[]"], [0,1,2]),
    msq("Which are Promise methods for handling multiple promises?", "Async", ["Promise.all","Promise.race","Promise.allSettled","Promise.sync"], [0,1,2]),
    text("What method returns a new array with each element transformed by a callback?", "Arrays", "map"),
  ],
};

const fullstackJsQuiz2 = {
  name: "Full-Stack JS – Node.js & Backend",
  questions: [
    mcq("What is the Node.js event loop responsible for?", "Architecture", ["Running multiple threads","Processing asynchronous callbacks in a non-blocking manner","Compiling JavaScript","Managing memory"], 1),
    mcq("What does `res.json()` do in Express?", "Express", ["Sends a file","Sends a JSON response and sets Content-Type to application/json","Parses an incoming JSON body","Reads a JSON config file"], 1),
    mcq("What is middleware in Express?", "Express", ["A database layer","A function that processes the request and response in the request-response pipeline","A template engine","A router module"], 1),
    mcq("Which HTTP status code should POST return on successful resource creation?", "REST", ["200","204","201","302"], 2),
    mcq("What does `process.env.NODE_ENV` typically contain?", "Configuration", ["The Node.js version","The environment name: development, test, or production","The current user","The app port"], 1),
    mcq("What is JWT used for?", "Auth", ["Encrypting passwords","Stateless authentication — a signed token containing claims, verified without a database lookup","Storing session data server-side","Hashing data"], 1),
    mcq("What does `app.use(express.json())` do?", "Express", ["Enables CORS","Parses incoming request bodies with a JSON payload and exposes it on req.body","Sends JSON responses","Logs JSON requests"], 1),
    mcq("What is the purpose of environment variables?", "Configuration", ["To document the code","To store configuration values (secrets, URLs, flags) outside of source code","To define function parameters","To set JavaScript globals"], 1),
    mcq("Which Node.js module handles file system operations?", "Core Modules", ["path","http","fs","os"], 2),
    mcq("What does `async/await` compile to under the hood?", "Async", ["Callbacks","Promises","Synchronous code","Web Workers"], 1),
    msq("Which are common Node.js web frameworks?", "Frameworks", ["Express","Fastify","Koa","Angular"], [0,1,2]),
    msq("Which are valid ways to read environment variables in Node.js?", "Configuration", ["process.env.VAR","dotenv package","config npm package","window.env.VAR"], [0,1,2]),
    text("What package is commonly used to load `.env` files into `process.env` in Node.js?", "Configuration", "dotenv"),
  ],
};

// ─── Coding problems for section 3 ────────────────────────────────────────────
// Use titles from existing seeded problems
const FULLSTACK_JS_CODING_TITLES = ["Two Sum", "Longest Substring Without Repeating Characters"];

// ═══════════════════════════════════════════════════════════════════════════════
//  ASSESSMENT 2: Python Data Engineering
//  Section 1 → Python Quiz  |  Section 2 → SQL Quiz  |  Section 3 → Coding
// ═══════════════════════════════════════════════════════════════════════════════

const pythonDataQuiz1 = {
  name: "Python Data Eng – Python Core",
  questions: [
    mcq("What does `zip(list1, list2)` return?", "Itertools", ["A compressed file","An iterator of tuples pairing elements from each iterable","A merged list","A dictionary"], 1),
    mcq("What is a Python dictionary?", "Data Structures", ["An ordered sequence","An unordered (3.6+ ordered by insertion) collection of key-value pairs","A set of unique values","A list of tuples"], 1),
    mcq("What does `enumerate()` do?", "Built-ins", ["Counts elements","Returns an enumerate object yielding (index, value) pairs","Sorts elements","Groups elements"], 1),
    mcq("What is the difference between `append()` and `extend()`?", "Lists", ["`append` adds an iterable's items; `extend` adds one item","`append` adds one item; `extend` adds all items of an iterable","They are identical","`extend` adds a nested list"], 1),
    mcq("What is a Python lambda?", "Functions", ["An anonymous, single-expression function","A class without a constructor","A generator function","A module import alias"], 0),
    mcq("What does `sorted(iterable, key=fn)` do?", "Built-ins", ["Mutates the list in place","Returns a new sorted list using fn as the sort key","Filters the list","Groups the list"], 1),
    mcq("What is `defaultdict` from `collections`?", "Collections", ["A dict that raises KeyError on missing key","A dict that returns a default value for missing keys (defined by a factory function)","An ordered dict","A frozen dict"], 1),
    mcq("What does `*` in `a, *b = [1,2,3,4]` do?", "Unpacking", ["Raises a SyntaxError","Assigns remaining elements to b as a list: b = [2,3,4]","Creates a generator","Multiplies the values"], 1),
    mcq("What is the purpose of `__str__` vs `__repr__`?", "OOP", ["They are identical","__str__ is for a human-readable string; __repr__ is for an unambiguous developer-facing representation","__repr__ is for printing; __str__ is for debugging","Neither is called automatically"], 1),
    mcq("What is `@property` used for?", "OOP", ["To mark a method as static","To define a getter that lets you access a method like an attribute","To make a class abstract","To create a class-level variable"], 1),
    msq("Which are valid Python data structures?", "Data Structures", ["list","dict","set","array (built-in)"], [0,1,2]),
    msq("Which are Python built-in higher-order functions?", "Functional", ["map","filter","reduce (functools)","apply"], [0,1,2]),
    text("What Python keyword is used to create a generator expression?", "Generators", "yield"),
  ],
};

const pythonDataQuiz2 = {
  name: "Python Data Eng – SQL & Databases",
  questions: [
    mcq("Which SQL clause filters records before grouping?", "Filtering", ["HAVING","WHERE","FILTER","LIMIT"], 1),
    mcq("What does `INNER JOIN` return?", "JOINs", ["All rows from both tables","Only rows with matching values in both tables","All rows from the left table","All rows from the right table"], 1),
    mcq("What is the difference between `DELETE` and `TRUNCATE`?", "DDL", ["Identical","TRUNCATE removes all rows without logging each; DELETE can use WHERE","DELETE is faster","TRUNCATE supports WHERE"], 1),
    mcq("What does `COUNT(DISTINCT column)` do?", "Aggregates", ["Counts all rows","Counts only non-NULL values","Counts the number of unique non-NULL values in the column","Counts NULL values"], 2),
    mcq("What is a window function in SQL?", "Advanced SQL", ["A function applied to each row individually","A function that computes values across a set of rows related to the current row, without collapsing them","A subquery in the WHERE clause","A type of JOIN"], 1),
    mcq("What does `ROW_NUMBER()` do?", "Window Functions", ["Returns the rank with gaps","Assigns a sequential integer to rows within a partition","Returns the first value in a partition","Counts rows in each group"], 1),
    mcq("Which clause defines the window for a window function?", "Window Functions", ["GROUP BY","PARTITION BY ... ORDER BY","HAVING","WHERE"], 1),
    mcq("What is the purpose of an index?", "Performance", ["To enforce uniqueness","To speed up data retrieval at the cost of storage and write speed","To store computed values","To compress the table"], 1),
    mcq("What does `COALESCE(a, b, c)` return?", "Functions", ["The sum of a, b, c","The first non-NULL value from the list","The last non-NULL value","NULL if all are NULL"], 1),
    mcq("What is a CTE (`WITH` clause)?", "Advanced SQL", ["A permanent table","A temporary named result set scoped to the query","A stored procedure","A materialized view"], 1),
    msq("Which are aggregate functions in SQL?", "Aggregates", ["SUM","AVG","COUNT","CONCAT"], [0,1,2]),
    msq("Which JOIN types return rows even when there is no match in one table?", "JOINs", ["LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN","INNER JOIN"], [0,1,2]),
    text("What SQL keyword is used to remove duplicate rows from a result set?", "SELECT", "DISTINCT"),
  ],
};

const PYTHON_DATA_CODING_TITLES = ["Maximum Subarray Sum", "Group Anagrams"];

// ═══════════════════════════════════════════════════════════════════════════════
//  ASSESSMENT 3: Software Engineering Foundations
//  Section 1 → CS Fundamentals Quiz  |  Section 2 → OOP/Design Quiz  |  Section 3 → Coding
// ═══════════════════════════════════════════════════════════════════════════════

const sweFoundationsQuiz1 = {
  name: "SWE Foundations – CS Fundamentals",
  questions: [
    mcq("What is the time complexity of binary search?", "Algorithms", ["O(n)","O(n²)","O(log n)","O(1)"], 2),
    mcq("Which data structure gives O(1) average lookup?", "Data Structures", ["Array","Linked List","Hash Table","Binary Tree"], 2),
    mcq("What is the worst-case time complexity of Quick Sort?", "Algorithms", ["O(n log n)","O(n²)","O(n)","O(log n)"], 1),
    mcq("Which traversal visits nodes level by level?", "Trees", ["Pre-order","In-order","Post-order","Breadth-First (Level-order)"], 3),
    mcq("What does Big-O notation describe?", "Complexity", ["Exact runtime","Best-case runtime","Upper bound on the growth rate","Average-case runtime"], 2),
    mcq("What is dynamic programming?", "Algorithms", ["Recursion without base cases","An optimization technique that stores results of overlapping subproblems (memoization/tabulation) to avoid recomputation","Sorting data dynamically","A type of graph traversal"], 1),
    mcq("Which sorting algorithm is stable and has O(n log n) worst-case complexity?", "Algorithms", ["Quick Sort","Heap Sort","Merge Sort","Selection Sort"], 2),
    mcq("What data structure is used internally by BFS?", "Graphs", ["Stack","Queue","Heap","Array"], 1),
    mcq("What is the space complexity of DFS on a graph with V vertices?", "Graphs", ["O(1)","O(V)","O(V²)","O(E)"], 1),
    mcq("What is a greedy algorithm?", "Algorithms", ["An algorithm that explores all paths","An algorithm that makes the locally optimal choice at each step, hoping for a global optimum","An algorithm with guaranteed optimal results always","An algorithm based on memoization"], 1),
    msq("Which are O(n log n) sorting algorithms?", "Algorithms", ["Merge Sort","Heap Sort","Quick Sort (average)","Bubble Sort"], [0,1,2]),
    msq("Which are self-balancing binary search trees?", "Data Structures", ["AVL Tree","Red-Black Tree","B-Tree","Plain BST"], [0,1,2]),
    text("What algorithm finds the shortest path in a weighted graph with non-negative edges?", "Graphs", "Dijkstra's algorithm"),
  ],
};

const sweFoundationsQuiz2 = {
  name: "SWE Foundations – OOP & System Design",
  questions: [
    mcq("What is the Single Responsibility Principle?", "SOLID", ["A class should have many responsibilities","A class should have only one reason to change (one responsibility)","A method should only call one other method","A module should only export one function"], 1),
    mcq("What is the Open/Closed Principle?", "SOLID", ["Code should be open source","Software entities should be open for extension but closed for modification","Functions should be open to all parameters","Classes should be closed after instantiation"], 1),
    mcq("What design pattern defines a one-to-many dependency so when one object changes state, all dependents are notified?", "Design Patterns", ["Factory","Singleton","Observer","Strategy"], 2),
    mcq("What is the Factory Pattern?", "Design Patterns", ["A pattern for one instance only","A pattern that provides an interface for creating objects without specifying the exact class","A pattern that adds behaviour to objects dynamically","A pattern for composing objects"], 1),
    mcq("What is the purpose of dependency injection?", "Architecture", ["To hardcode dependencies","To pass dependencies into a component from outside, improving testability and flexibility","To prevent all coupling","To eliminate constructors"], 1),
    mcq("What does REST stand for?", "APIs", ["Remote Execution System Transfer","Representational State Transfer","Reliable Endpoint Standard Technology","Resource Encoding Service Transfer"], 1),
    mcq("What is a microservice?", "Architecture", ["A tiny program with no dependencies","An architectural style where an application is composed of small independent services that communicate over APIs","A single function deployed to the cloud","A type of Docker container"], 1),
    mcq("What is vertical scaling?", "Scalability", ["Adding more servers","Increasing the resources (CPU, RAM) of an existing server","Partitioning data across servers","Replicating data across regions"], 1),
    mcq("What is a load balancer?", "Scalability", ["A database sharding strategy","A component that distributes incoming traffic across multiple servers to ensure availability and performance","A caching layer","A type of message queue"], 1),
    mcq("What is the CAP theorem?", "Distributed Systems", ["A SQL optimization rule","A theorem stating a distributed system can guarantee at most two of: Consistency, Availability, Partition Tolerance","A caching strategy","A sorting theorem"], 1),
    msq("Which are SOLID principles?", "SOLID", ["Single Responsibility","Open/Closed","Liskov Substitution","Dependency Exclusion"], [0,1,2]),
    msq("Which are common architectural patterns?", "Architecture", ["MVC","Microservices","Event-Driven","Waterfall"], [0,1,2]),
    text("What design pattern ensures that a class has only one instance and provides a global access point to it?", "Design Patterns", "Singleton"),
  ],
};

const SWE_FOUNDATIONS_CODING_TITLES = ["Valid Parentheses", "Longest Palindromic Substring"];

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════════════════════════════

const assessmentDefs = [
  {
    name: "Full-Stack JavaScript Developer Assessment",
    slug: "fullstack-js-developer",
    skillId: 571,
    sections: [
      { title: "JavaScript Fundamentals", pool: fullstackJsQuiz1,  type: "quiz",   maxQ: 10, time: 20, score: 30 },
      { title: "Node.js & Backend",        pool: fullstackJsQuiz2,  type: "quiz",   maxQ: 10, time: 20, score: 30 },
      { title: "Coding Challenge",         codingTitles: FULLSTACK_JS_CODING_TITLES, type: "coding", time: 45, score: 40 },
    ],
  },
  {
    name: "Python Data Engineering Assessment",
    slug: "python-data-engineering",
    skillId: 852,
    sections: [
      { title: "Python Core",    pool: pythonDataQuiz1,  type: "quiz",   maxQ: 10, time: 20, score: 30 },
      { title: "SQL & Databases", pool: pythonDataQuiz2, type: "quiz",   maxQ: 10, time: 20, score: 30 },
      { title: "Coding Challenge", codingTitles: PYTHON_DATA_CODING_TITLES, type: "coding", time: 45, score: 40 },
    ],
  },
  {
    name: "Software Engineering Foundations Assessment",
    slug: "swe-foundations",
    skillId: 300,
    sections: [
      { title: "CS Fundamentals",   pool: sweFoundationsQuiz1, type: "quiz",   maxQ: 10, time: 20, score: 30 },
      { title: "OOP & System Design", pool: sweFoundationsQuiz2, type: "quiz", maxQ: 10, time: 20, score: 30 },
      { title: "Coding Challenge",  codingTitles: SWE_FOUNDATIONS_CODING_TITLES, type: "coding", time: 45, score: 40 },
    ],
  },
];

const seed = async () => {
  await db();
  try {
    for (const def of assessmentDefs) {
      // Idempotent cleanup
      await Assesment.deleteMany({ slug: def.slug });
      for (const sec of def.sections) {
        if (sec.pool) await QuestionPool.deleteMany({ name: sec.pool.name });
      }

      const builtSections = [];

      for (const sec of def.sections) {
        if (sec.type === "coding") {
          // Look up problems by title
          const problems = await Problem.find({ title: { $in: sec.codingTitles } }).select("_id title");
          const ids = sec.codingTitles.map((t) => {
            const found = problems.find((p) => p.title === t);
            if (!found) console.warn(`    ⚠ Problem not found: "${t}" — skipping`);
            return found?._id;
          }).filter(Boolean);

          builtSections.push({
            title:       sec.title,
            type:        "coding",
            problemPool: ids,
            maxQuestion: ids.length,
            maxTime:     sec.time,
            maxScore:    sec.score,
            description: `Solve ${ids.length} coding problem${ids.length !== 1 ? "s" : ""}.`,
          });
        } else {
          const pool = await QuestionPool.create(sec.pool);
          builtSections.push({
            title:        sec.title,
            type:         "quiz",
            questionPool: pool._id,
            problemPool:  [],
            maxQuestion:  sec.maxQ,
            maxTime:      sec.time,
            maxScore:     sec.score,
            description:  `${sec.maxQ} multiple-choice questions on ${sec.title}.`,
          });
        }
      }

      const assessment = await Assesment.create({
        name:     def.name,
        slug:     def.slug,
        skillId:  def.skillId,
        sections: builtSections,
      });

      console.log(`✅ ${assessment.name}`);
      builtSections.forEach((s) =>
        console.log(`     • [${s.type}] ${s.title} — ${s.maxTime} min, ${s.maxScore} pts`),
      );
    }

    console.log(`\n🎉 ${assessmentDefs.length} multi-section assessments seeded`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
