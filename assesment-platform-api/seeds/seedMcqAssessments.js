import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { QuestionPool } from "../models/QuestionPool.js";
import Assesment from "../models/Assesment.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mcq = (question, topic, options, correctIndex) => ({
  question,
  marks: 2,
  negative: 0,
  topic,
  category: "MCQ",
  answer: null,
  options: options.map((text, i) => ({ text, isCorrect: i === correctIndex })),
});

const msq = (question, topic, options, correctIndexes) => ({
  question,
  marks: 3,
  negative: 0,
  topic,
  category: "MSQ",
  answer: null,
  options: options.map((text, i) => ({ text, isCorrect: correctIndexes.includes(i) })),
});

const text = (question, topic, answer) => ({
  question,
  marks: 2,
  negative: 0,
  topic,
  category: "Text",
  options: [],
  answer,
});

// ═══════════════════════════════════════════════════════════════════════════════
//  BASH  (skillId: 212)
// ═══════════════════════════════════════════════════════════════════════════════

const bashPools = [
  // ── Pool 1: Core Commands ──
  {
    name: "Bash – Core Commands",
    questions: [
      mcq("Which command displays the current working directory?", "Navigation",
        ["pwd", "ls", "cd", "dir"], 0),
      mcq("Which flag with `ls` shows hidden files?", "Navigation",
        ["-l", "-a", "-h", "-r"], 1),
      mcq("What does `cp -r src/ dest/` do?", "File Operations",
        ["Moves src to dest", "Copies src recursively into dest", "Creates a symlink", "Renames src to dest"], 1),
      mcq("Which command removes an empty directory?", "File Operations",
        ["rm", "rmdir", "del", "unlink"], 1),
      mcq("What does `cat file.txt` do?", "File Viewing",
        ["Creates file.txt", "Deletes file.txt", "Prints contents of file.txt", "Edits file.txt"], 2),
      mcq("Which command counts lines, words, and characters in a file?", "File Viewing",
        ["count", "wc", "lc", "stat"], 1),
      mcq("What does `echo $HOME` print?", "Variables",
        ["The string '$HOME'", "The current directory", "The home directory path of the current user", "Nothing"], 2),
      msq("Which of the following are valid ways to create an empty file?", "File Operations",
        ["touch newfile.txt", "echo '' > newfile.txt", "mkdir newfile.txt", "> newfile.txt"], [0, 1, 3]),
      msq("Which commands can be used to display file content?", "File Viewing",
        ["cat", "less", "mkdir", "more"], [0, 1, 3]),
      text("What command shows the last 10 lines of a file by default?", "File Viewing", "tail"),
    ],
  },

  // ── Pool 2: Permissions & Ownership ──
  {
    name: "Bash – Permissions & Ownership",
    questions: [
      mcq("What does `chmod 755 file.sh` set?", "Permissions",
        ["Owner: rwx, Group: r-x, Others: r-x", "Owner: rw-, Group: rw-, Others: rw-", "Owner: rwx, Group: rwx, Others: rwx", "Owner: r-x, Group: r-x, Others: r-x"], 0),
      mcq("Which octal value gives read and write permissions to the owner only?", "Permissions",
        ["777", "600", "644", "755"], 1),
      mcq("What does the `chown` command do?", "Ownership",
        ["Changes file permissions", "Changes file owner and/or group", "Changes file timestamps", "Creates a file"], 1),
      mcq("Which symbol in `ls -l` output indicates a directory?", "File Types",
        ["-", "d", "l", "r"], 1),
      mcq("What does `chmod +x script.sh` do?", "Permissions",
        ["Removes execute permission", "Adds execute permission for all", "Sets permissions to 777", "Creates the file"], 1),
      mcq("What is the default umask value on most Linux systems?", "Permissions",
        ["000", "777", "022", "755"], 2),
      mcq("Which command changes the group ownership of a file?", "Ownership",
        ["chgrp", "chmod", "chown", "groupmod"], 0),
      msq("Which permissions does octal 644 grant?", "Permissions",
        ["Owner read", "Owner write", "Group write", "Others read"], [0, 1, 3]),
      msq("Which of the following are valid file types in `ls -l` output?", "File Types",
        ["- (regular file)", "d (directory)", "l (symlink)", "x (executable)"], [0, 1, 2]),
      text("What octal value represents rwxrwxrwx (full permissions for all)?", "Permissions", "777"),
    ],
  },

  // ── Pool 3: Scripting Basics ──
  {
    name: "Bash – Scripting Basics",
    questions: [
      mcq("What is the correct shebang line for a Bash script?", "Scripting",
        ["#/bin/bash", "#!/bin/bash", "//bin/bash", "@bash"], 1),
      mcq("How do you declare a variable in Bash?", "Variables",
        ["var name = 'John'", "let name = 'John'", "name='John'", "$name='John'"], 2),
      mcq("Which syntax correctly reads a variable named `name`?", "Variables",
        ["name", "$name", "#name", "@name"], 1),
      mcq("What does `$?` represent in Bash?", "Special Variables",
        ["Process ID of current shell", "Exit status of last command", "Number of arguments", "Current script name"], 1),
      mcq("Which loop iterates over a list of items?", "Control Flow",
        ["while item in list", "for item in list; do ... done", "loop item in list", "foreach item list"], 1),
      mcq("What is the correct `if` syntax in Bash?", "Control Flow",
        ["if condition then ... fi", "if [ condition ]; then ... fi", "if (condition) { }", "if condition: ..."], 1),
      mcq("How do you pass arguments to a Bash script?", "Arguments",
        ["Using $1, $2, $3...", "Using %1, %2, %3...", "Using arg[1], arg[2]...", "Using argv[1], argv[2]..."], 0),
      msq("Which are valid ways to compare integers in Bash `[ ]` tests?", "Conditionals",
        ["-eq", "-ne", "==", "-lt"], [0, 1, 3]),
      msq("Which special variables are available inside a Bash script?", "Special Variables",
        ["$0 (script name)", "$# (argument count)", "$@ (all arguments)", "$% (current user)"], [0, 1, 2]),
      text("What command makes a script executable?", "Scripting", "chmod +x"),
    ],
  },

  // ── Pool 4: Pipelines & Text Processing ──
  {
    name: "Bash – Pipelines & Text Processing",
    questions: [
      mcq("What does the `|` operator do in Bash?", "Pipelines",
        ["Redirects output to a file", "Pipes stdout of one command to stdin of the next", "Runs commands in parallel", "Concatenates strings"], 1),
      mcq("Which command searches for a pattern in files?", "Text Processing",
        ["find", "grep", "sed", "awk"], 1),
      mcq("What does `grep -i` do?", "Text Processing",
        ["Inverts the match", "Case-insensitive search", "Recursive search", "Shows line numbers"], 1),
      mcq("Which command replaces text in a file in-place?", "Text Processing",
        ["grep -r", "sed -i", "awk -f", "tr -d"], 1),
      mcq("What does `>` do when used with a command?", "Redirection",
        ["Appends stdout to a file", "Redirects stdout to a file (overwrite)", "Redirects stderr", "Reads from a file"], 1),
      mcq("What does `>>` do?", "Redirection",
        ["Redirects stdout to a file (overwrite)", "Appends stdout to a file", "Redirects stdin", "Runs command in background"], 1),
      mcq("Which command sorts lines of text alphabetically?", "Text Processing",
        ["order", "sort", "arrange", "grep -s"], 1),
      msq("Which options does `grep` support?", "Text Processing",
        ["-i (case insensitive)", "-r (recursive)", "-n (line numbers)", "-d (delete matches)"], [0, 1, 2]),
      msq("Which are valid redirection operators in Bash?", "Redirection",
        [">", ">>", "2>", "<"], [0, 1, 2, 3]),
      text("What command removes duplicate adjacent lines from sorted output?", "Text Processing", "uniq"),
    ],
  },

  // ── Pool 5: Process Management ──
  {
    name: "Bash – Process Management",
    questions: [
      mcq("Which command lists running processes?", "Processes",
        ["ls -p", "ps aux", "proc list", "jobs -a"], 1),
      mcq("What does `kill -9 PID` do?", "Processes",
        ["Pauses the process", "Sends SIGTERM to the process", "Forcefully terminates the process (SIGKILL)", "Restarts the process"], 2),
      mcq("How do you run a command in the background?", "Job Control",
        ["Prefix with &", "Append & at the end", "Use bg prefix", "Use nohup only"], 1),
      mcq("What command brings a background job to the foreground?", "Job Control",
        ["bg", "fg", "jobs", "resume"], 1),
      mcq("Which command shows real-time system resource usage?", "Monitoring",
        ["ps", "ls", "top", "stat"], 2),
      mcq("What does `nohup command &` achieve?", "Job Control",
        ["Runs command with highest priority", "Runs command immune to hangups, in background", "Runs command as root", "Pauses command"], 1),
      mcq("What does `$!` hold in Bash?", "Special Variables",
        ["PID of current shell", "PID of last background process", "Exit code of last command", "Number of jobs"], 1),
      msq("Which signals can be sent with the `kill` command?", "Processes",
        ["SIGTERM (15)", "SIGKILL (9)", "SIGHUP (1)", "SIGREAD (3)"], [0, 1, 2]),
      msq("Which commands provide information about running processes?", "Monitoring",
        ["ps", "top", "htop", "mkdir"], [0, 1, 2]),
      text("What command shows all currently running jobs in the current shell session?", "Job Control", "jobs"),
    ],
  },
];

const bashAssessments = [
  { name: "Bash – Core Commands",            slug: "bash-core-commands",        poolIndex: 0, time: 20 },
  { name: "Bash – Permissions & Ownership",  slug: "bash-permissions-ownership", poolIndex: 1, time: 20 },
  { name: "Bash – Scripting Basics",         slug: "bash-scripting-basics",      poolIndex: 2, time: 20 },
  { name: "Bash – Pipelines & Text",         slug: "bash-pipelines-text",        poolIndex: 3, time: 20 },
  { name: "Bash – Process Management",       slug: "bash-process-management",    poolIndex: 4, time: 20 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SQL  (skillId: 980)
// ═══════════════════════════════════════════════════════════════════════════════

const sqlPools = [
  // ── Pool 1: SELECT Fundamentals ──
  {
    name: "SQL – SELECT Fundamentals",
    questions: [
      mcq("Which clause filters rows in a SELECT query?", "Filtering",
        ["HAVING", "WHERE", "FILTER", "LIMIT"], 1),
      mcq("What does `SELECT DISTINCT` do?", "SELECT",
        ["Selects all rows including duplicates", "Returns only unique rows", "Selects the first row", "Counts rows"], 1),
      mcq("Which clause sorts query results?", "Sorting",
        ["GROUP BY", "SORT BY", "ORDER BY", "ARRANGE BY"], 2),
      mcq("What does `LIMIT 5` do in a query?", "Pagination",
        ["Skips the first 5 rows", "Returns only the first 5 rows", "Limits column count to 5", "Runs 5 queries"], 1),
      mcq("Which SQL keyword retrieves all columns?", "SELECT",
        ["%", "ALL", "*", "#"], 2),
      mcq("What does `IS NULL` check for?", "Filtering",
        ["Empty string", "Zero value", "Missing/null value", "False boolean"], 2),
      mcq("Which operator checks if a value is in a list?", "Filtering",
        ["BETWEEN", "LIKE", "IN", "EXISTS"], 2),
      msq("Which clauses are part of a standard SELECT statement?", "SELECT",
        ["SELECT", "WHERE", "FROM", "EXECUTE"], [0, 1, 2]),
      msq("Which operators can be used in a WHERE clause?", "Filtering",
        ["=", "!=", ">", "APPEND"], [0, 1, 2]),
      text("What keyword is used to filter results after aggregation?", "Aggregation", "HAVING"),
    ],
  },

  // ── Pool 2: JOINs ──
  {
    name: "SQL – JOINs",
    questions: [
      mcq("Which JOIN returns only rows with matching values in both tables?", "JOINs",
        ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], 2),
      mcq("Which JOIN returns all rows from the left table, and matched rows from the right?", "JOINs",
        ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], 1),
      mcq("Which JOIN returns all rows from both tables, with NULLs where there's no match?", "JOINs",
        ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "SELF JOIN"], 2),
      mcq("What is a CROSS JOIN?", "JOINs",
        ["Returns rows where keys match", "Returns the Cartesian product of two tables", "Joins a table to itself", "Returns unmatched rows only"], 1),
      mcq("What keyword is used to specify the join condition?", "JOINs",
        ["WHERE", "ON", "USING only", "MATCH"], 1),
      mcq("A SELF JOIN joins:", "JOINs",
        ["Two different tables", "A table with a view", "A table with itself", "Three or more tables"], 2),
      mcq("What does a RIGHT JOIN return when there's no match in the left table?", "JOINs",
        ["It excludes that row", "NULL for left table columns", "An error", "Zero for numeric columns"], 1),
      msq("Which JOIN types return rows even when there is no match in the other table?", "JOINs",
        ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], [0, 1, 3]),
      msq("Which of the following are valid SQL JOIN types?", "JOINs",
        ["INNER JOIN", "LEFT JOIN", "DIAGONAL JOIN", "CROSS JOIN"], [0, 1, 3]),
      text("What keyword can be used instead of ON when the join column has the same name in both tables?", "JOINs", "USING"),
    ],
  },

  // ── Pool 3: Aggregate Functions ──
  {
    name: "SQL – Aggregate Functions",
    questions: [
      mcq("Which function counts the number of rows?", "Aggregates",
        ["SUM()", "AVG()", "COUNT()", "TOTAL()"], 2),
      mcq("Which function returns the highest value in a column?", "Aggregates",
        ["TOP()", "HIGHEST()", "MAX()", "UPPER()"], 2),
      mcq("Which clause groups rows sharing a value in a column?", "Grouping",
        ["ORDER BY", "GROUP BY", "PARTITION BY", "CLUSTER BY"], 1),
      mcq("What does `AVG(salary)` return?", "Aggregates",
        ["The highest salary", "The lowest salary", "The arithmetic mean of salary", "The total salary"], 2),
      mcq("Which clause filters groups (not individual rows)?", "Filtering",
        ["WHERE", "FILTER", "HAVING", "GROUP FILTER"], 2),
      mcq("What does `COUNT(*)` vs `COUNT(column)` differ in?", "Aggregates",
        ["COUNT(*) is faster always", "COUNT(*) counts all rows; COUNT(col) ignores NULLs", "They are identical", "COUNT(col) counts all rows; COUNT(*) ignores NULLs"], 1),
      mcq("Which aggregate function concatenates strings in most SQL dialects?", "Aggregates",
        ["CONCAT_AGG()", "STRING_AGG() or GROUP_CONCAT()", "JOIN_AGG()", "MERGE()"], 1),
      msq("Which are standard SQL aggregate functions?", "Aggregates",
        ["SUM()", "MIN()", "MAX()", "PUSH()"], [0, 1, 2]),
      msq("Which statements about GROUP BY are correct?", "Grouping",
        ["Every non-aggregated column in SELECT must appear in GROUP BY", "You can GROUP BY multiple columns", "GROUP BY can be used without aggregate functions", "GROUP BY sorts results ascending by default"], [0, 1, 2]),
      text("Which keyword is placed after GROUP BY to filter grouped results?", "Filtering", "HAVING"),
    ],
  },

  // ── Pool 4: Subqueries & CTEs ──
  {
    name: "SQL – Subqueries & CTEs",
    questions: [
      mcq("A subquery placed in a WHERE clause is called a:", "Subqueries",
        ["Correlated subquery always", "Nested subquery", "Inline view", "Derived table"], 1),
      mcq("What is a correlated subquery?", "Subqueries",
        ["A subquery that runs once", "A subquery that references columns from the outer query", "A subquery in the FROM clause", "A subquery with GROUP BY"], 1),
      mcq("What does `WITH cte AS (...)` define?", "CTEs",
        ["A temporary table stored on disk", "A Common Table Expression (CTE) usable in the same query", "A stored procedure", "A view"], 1),
      mcq("Which keyword introduces a CTE?", "CTEs",
        ["DEFINE", "WITH", "USING", "CREATE TEMP"], 1),
      mcq("What does `EXISTS (subquery)` return?", "Subqueries",
        ["The rows from the subquery", "TRUE if the subquery returns at least one row", "The count of rows", "The first row"], 1),
      mcq("Where can a subquery be placed?", "Subqueries",
        ["Only in WHERE", "Only in FROM", "In WHERE, FROM, SELECT, or HAVING", "Only in HAVING"], 2),
      mcq("What is a recursive CTE used for?", "CTEs",
        ["Joining three tables", "Querying hierarchical or tree-structured data", "Replacing GROUP BY", "Caching results"], 1),
      msq("Which are advantages of CTEs over subqueries?", "CTEs",
        ["Better readability", "Can be referenced multiple times", "Always faster", "Support recursion"], [0, 1, 3]),
      msq("Which clauses can contain a subquery?", "Subqueries",
        ["WHERE", "FROM", "SELECT", "DECLARE"], [0, 1, 2]),
      text("What keyword is used to start a recursive CTE after the initial query inside the CTE?", "CTEs", "UNION ALL"),
    ],
  },

  // ── Pool 5: DDL, Constraints & Indexes ──
  {
    name: "SQL – DDL, Constraints & Indexes",
    questions: [
      mcq("Which statement creates a new table?", "DDL",
        ["INSERT TABLE", "CREATE TABLE", "MAKE TABLE", "ADD TABLE"], 1),
      mcq("Which constraint ensures a column cannot have NULL values?", "Constraints",
        ["UNIQUE", "PRIMARY KEY", "NOT NULL", "CHECK"], 2),
      mcq("Which constraint ensures all values in a column are different?", "Constraints",
        ["NOT NULL", "UNIQUE", "FOREIGN KEY", "DEFAULT"], 1),
      mcq("What does a FOREIGN KEY constraint do?", "Constraints",
        ["Ensures unique values", "Links a column to the primary key of another table", "Prevents NULL values", "Creates an index"], 1),
      mcq("Which command removes a table and all its data permanently?", "DDL",
        ["DELETE TABLE", "REMOVE TABLE", "DROP TABLE", "TRUNCATE TABLE"], 2),
      mcq("What is the difference between DELETE and TRUNCATE?", "DDL",
        ["They are identical", "DELETE removes all rows; TRUNCATE removes specific rows", "TRUNCATE removes all rows fast without logging each row; DELETE can use WHERE", "TRUNCATE supports WHERE; DELETE does not"], 2),
      mcq("What does an index do?", "Indexes",
        ["Enforces data uniqueness", "Speeds up data retrieval at the cost of storage/write speed", "Prevents NULL values", "Joins two tables"], 1),
      msq("Which are valid SQL constraints?", "Constraints",
        ["PRIMARY KEY", "FOREIGN KEY", "NOT NULL", "SORT KEY"], [0, 1, 2]),
      msq("Which SQL commands belong to DDL (Data Definition Language)?", "DDL",
        ["CREATE", "ALTER", "DROP", "INSERT"], [0, 1, 2]),
      text("Which SQL command modifies the structure of an existing table?", "DDL", "ALTER TABLE"),
    ],
  },
];

const sqlAssessments = [
  { name: "SQL – SELECT Fundamentals",      slug: "sql-select-fundamentals",   poolIndex: 0, time: 20 },
  { name: "SQL – JOINs",                    slug: "sql-joins",                  poolIndex: 1, time: 20 },
  { name: "SQL – Aggregate Functions",      slug: "sql-aggregate-functions",    poolIndex: 2, time: 20 },
  { name: "SQL – Subqueries & CTEs",        slug: "sql-subqueries-ctes",        poolIndex: 3, time: 25 },
  { name: "SQL – DDL, Constraints & Indexes", slug: "sql-ddl-constraints",      poolIndex: 4, time: 20 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════════════════════════════

const seedSkill = async ({ skillId, skillName, poolDefs, assessmentDefs }) => {
  await Assesment.deleteMany({ skillId });
  await QuestionPool.deleteMany({ name: { $regex: new RegExp(`^${skillName} –`, "i") } });
  console.log(`🗑  Cleared existing data for ${skillName}`);

  for (const def of assessmentDefs) {
    const pool = await QuestionPool.create(poolDefs[def.poolIndex]);
    const assessment = await Assesment.create({
      name:    def.name,
      slug:    def.slug,
      skillId,
      sections: [{
        title:       "Quiz",
        type:        "quiz",
        maxQuestion: 10,
        maxTime:     def.time,
        maxScore:    100,
        description: `Multiple choice questions on ${def.name.split("–")[1]?.trim() ?? skillName}.`,
        questionPool: pool._id,
        problemPool:  [],
      }],
    });
    console.log(`  ✅ ${assessment.name}`);
  }
  console.log(`✅ ${skillName}: ${assessmentDefs.length} assessments inserted\n`);
};

const seed = async () => {
  await db();
  try {
    await seedSkill({ skillId: 212, skillName: "Bash", poolDefs: bashPools, assessmentDefs: bashAssessments });
    await seedSkill({ skillId: 980, skillName: "SQL",  poolDefs: sqlPools,  assessmentDefs: sqlAssessments });
    console.log("🎉 All MCQ assessments seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
