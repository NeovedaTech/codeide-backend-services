import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { QuestionPool } from "../models/QuestionPool.js";
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
//  1. PYTHON  (skillId: 852)
// ═══════════════════════════════════════════════════════════════════════════════
const pythonPool = {
  name: "Python – Core Concepts",
  questions: [
    mcq("What is the output of `type([])` in Python?", "Types",
      ["<class 'tuple'>", "<class 'array'>", "<class 'list'>", "<class 'dict'>"], 2),
    mcq("Which keyword is used to define a generator function in Python?", "Generators",
      ["return", "yield", "async", "generate"], 1),
    mcq("What does `*args` allow in a function definition?", "Functions",
      ["Keyword-only arguments", "A variable number of positional arguments", "Default argument values", "Only one argument"], 1),
    mcq("What is the result of `3 // 2` in Python?", "Operators",
      ["1.5", "1", "2", "0"], 1),
    mcq("Which of the following creates an empty set?", "Data Types",
      ["{}","set()","[]","()"], 1),
    mcq("What does the `with` statement ensure in Python?", "Context Managers",
      ["The block runs in a thread", "Resources like files are properly acquired and released (e.g., files are closed)", "The code runs asynchronously", "Variables are scoped locally"], 1),
    mcq("What is a list comprehension?", "Comprehensions",
      ["A way to sort lists", "A concise syntax to create lists: `[expr for item in iterable if cond]`", "A built-in list method", "A way to flatten nested lists"], 1),
    mcq("What is the difference between `is` and `==` in Python?", "Operators",
      ["They are identical", "`is` checks identity (same object in memory); `==` checks equality of value", "`==` checks identity; `is` checks value", "`is` only works for integers"], 1),
    mcq("What does `__init__` do in a Python class?", "OOP",
      ["Destroys the object", "Initialises a new instance of the class", "Defines a class method", "Makes the class abstract"], 1),
    mcq("What is a Python decorator?", "Functions",
      ["A comment style", "A function that wraps another function to modify its behaviour", "A class that inherits from another", "A type annotation"], 1),
    msq("Which are immutable data types in Python?", "Data Types",
      ["int", "str", "list", "tuple"], [0, 1, 3]),
    msq("Which of the following are valid ways to handle exceptions in Python?", "Exceptions",
      ["try/except", "try/except/else", "try/except/finally", "catch/throw"], [0, 1, 2]),
    text("What built-in function returns the number of items in an object?", "Built-ins", "len"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  2. JAVASCRIPT  (skillId: 571)
// ═══════════════════════════════════════════════════════════════════════════════
const javascriptPool = {
  name: "JavaScript – Core Concepts",
  questions: [
    mcq("What does `typeof null` return in JavaScript?", "Types",
      ['"null"', '"undefined"', '"object"', '"boolean"'], 2),
    mcq("What is the difference between `let` and `var`?", "Variables",
      ["No difference", "`let` is block-scoped; `var` is function-scoped and hoisted", "`var` is block-scoped; `let` is function-scoped", "`let` is hoisted; `var` is not"], 1),
    mcq("What does the `===` operator check?", "Operators",
      ["Value only", "Type only", "Both value and type (strict equality)", "Reference equality"], 2),
    mcq("What is a Promise in JavaScript?", "Async",
      ["A synchronous function", "An object representing the eventual completion or failure of an async operation", "A way to define classes", "A type of loop"], 1),
    mcq("What does `Array.prototype.map()` return?", "Arrays",
      ["The original array modified in place", "A new array with each element transformed by the callback", "undefined", "A boolean"], 1),
    mcq("What is event bubbling?", "DOM / Events",
      ["Events that only fire once", "When an event on a child element propagates up through parent elements", "A way to clone DOM nodes", "Attaching multiple listeners to one element"], 1),
    mcq("What does `async/await` do?", "Async",
      ["Makes code run in parallel threads", "Provides syntactic sugar over Promises for writing asynchronous code that looks synchronous", "Converts callbacks to Promises", "Blocks the event loop"], 1),
    mcq("What is the output of `[1,2,3].reduce((acc, v) => acc + v, 0)`?", "Arrays",
      ["[1,2,3]", "6", "0", "undefined"], 1),
    mcq("What is closure in JavaScript?", "Functions",
      ["A way to close a browser window", "A function that retains access to variables from its outer lexical scope even after the outer function has returned", "A design pattern for OOP", "An immediately invoked function"], 1),
    mcq("What does the spread operator `...` do in `[...arr1, ...arr2]`?", "ES6+",
      ["Creates a deep copy", "Concatenates/spreads the elements of both arrays into a new array", "Merges objects", "Destructures the arrays"], 1),
    msq("Which are falsy values in JavaScript?", "Types",
      ["0", '""', "null", "[]"], [0, 1, 2]),
    msq("Which are valid ways to create a function in JavaScript?", "Functions",
      ["function declaration", "function expression", "arrow function", "lambda function"], [0, 1, 2]),
    text("Which method removes the last element from an array and returns it?", "Arrays", "pop"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  3. TYPESCRIPT  (skillId: 1068)
// ═══════════════════════════════════════════════════════════════════════════════
const typescriptPool = {
  name: "TypeScript – Core Concepts",
  questions: [
    mcq("What is TypeScript?", "Basics",
      ["A runtime environment for JavaScript", "A statically typed superset of JavaScript that compiles to plain JavaScript", "A JavaScript framework", "A CSS preprocessor"], 1),
    mcq("What does the `?` after a property name mean in a TypeScript interface?", "Types",
      ["The property is required", "The property is optional", "The property is readonly", "The property is private"], 1),
    mcq("What is the `any` type in TypeScript?", "Types",
      ["A type that only accepts strings", "A type that disables type checking for a variable, accepting any value", "A union of all primitive types", "The type of undefined"], 1),
    mcq("What is a TypeScript interface?", "Interfaces",
      ["A class with no methods", "A contract that defines the shape of an object — its properties and their types", "An abstract class", "A type alias for functions only"], 1),
    mcq("What is the difference between `type` and `interface` in TypeScript?", "Types",
      ["They are completely identical", "`interface` can be merged (declaration merging); `type` can represent union/intersection types more flexibly", "`type` supports declaration merging; `interface` does not", "`interface` is only for functions"], 1),
    mcq("What does `readonly` do in TypeScript?", "Types",
      ["Marks a property as private", "Prevents a property from being reassigned after initialisation", "Makes a class abstract", "Freezes the entire object"], 1),
    mcq("What is a union type?", "Types",
      ["A type that must match all listed types", "A type that can be one of several listed types: `string | number`", "A type imported from another file", "A generic type"], 1),
    mcq("What is a generic in TypeScript?", "Generics",
      ["A non-typed variable", "A way to write reusable, type-safe code that works with different types: `function identity<T>(arg: T): T`", "A default export", "A utility type"], 1),
    mcq("What does the `as` keyword do in TypeScript?", "Types",
      ["Assigns a value", "Performs a type assertion — tells the compiler to treat a value as a specific type", "Imports a module", "Creates a type alias"], 1),
    mcq("What is the `never` type used for?", "Types",
      ["A variable that is always undefined", "Values that should never occur — e.g., return type of a function that always throws or never returns", "An optional type", "The same as void"], 1),
    msq("Which are TypeScript utility types?", "Utility Types",
      ["Partial<T>", "Readonly<T>", "Required<T>", "Stringify<T>"], [0, 1, 2]),
    msq("Which TypeScript features help with type narrowing?", "Type Narrowing",
      ["typeof checks", "instanceof checks", "Discriminated unions", "The any type"], [0, 1, 2]),
    text("What TypeScript keyword is used to define a named type alias?", "Types", "type"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  4. REACT  (skillId: 875)
// ═══════════════════════════════════════════════════════════════════════════════
const reactPool = {
  name: "React – Core Concepts",
  questions: [
    mcq("What is JSX?", "JSX",
      ["A JavaScript runtime", "A syntax extension for JavaScript that looks like HTML and is used to describe React UI", "A state management library", "A CSS framework"], 1),
    mcq("What does `useState` return?", "Hooks",
      ["Just the state value", "An array with the current state value and a setter function", "A ref object", "The previous state only"], 1),
    mcq("When does `useEffect` with an empty dependency array `[]` run?", "Hooks",
      ["On every render", "Only once after the initial render (componentDidMount equivalent)", "Only when props change", "Never"], 1),
    mcq("What is the virtual DOM?", "Internals",
      ["A copy of the DOM stored on the server", "An in-memory JavaScript representation of the real DOM that React uses to compute minimal updates", "A browser API", "The DOM inside an iframe"], 1),
    mcq("What is the purpose of a `key` prop when rendering a list?", "Lists",
      ["To style each item", "To help React identify which items changed, added, or removed for efficient reconciliation", "To number the items", "To prevent re-renders"], 1),
    mcq("What is prop drilling?", "State Management",
      ["Passing props through multiple intermediary components that don't use them, just to reach a deeply nested child", "Mutating props inside a component", "A performance optimisation technique", "A React hook"], 0),
    mcq("What does `useContext` solve?", "Hooks",
      ["Async state updates", "Avoids prop drilling by allowing components to consume a context value without passing props through every level", "Side effects in components", "Memoization"], 1),
    mcq("What is React.memo used for?", "Performance",
      ["To memoize hook values", "To prevent a functional component from re-rendering if its props haven't changed", "To cache API responses", "To lazy-load components"], 1),
    mcq("What is the difference between controlled and uncontrolled components in React?", "Forms",
      ["Controlled components use refs; uncontrolled use state", "Controlled components have their form data managed by React state; uncontrolled components use the DOM directly", "They are identical", "Uncontrolled components are class-based"], 1),
    mcq("What does `useCallback` do?", "Hooks",
      ["Runs a side effect", "Returns a memoized version of a callback function that only changes if its dependencies change", "Fetches data", "Creates a context"], 1),
    msq("Which are React hooks introduced in React 16.8?", "Hooks",
      ["useState", "useEffect", "useRef", "componentDidMount"], [0, 1, 2]),
    msq("Which are valid ways to manage global state in React?", "State Management",
      ["Context API", "Redux", "Zustand", "useLocalState"], [0, 1, 2]),
    text("Which lifecycle hook is used in class components to fetch data after the component mounts?", "Lifecycle", "componentDidMount"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  5. NODE.JS  (skillId: 736)
// ═══════════════════════════════════════════════════════════════════════════════
const nodejsPool = {
  name: "Node.js – Core Concepts",
  questions: [
    mcq("What is Node.js?", "Basics",
      ["A browser-based JavaScript engine", "A server-side JavaScript runtime built on Chrome's V8 engine", "A JavaScript framework for building UIs", "A package manager"], 1),
    mcq("What is the event loop in Node.js?", "Architecture",
      ["A loop that processes all synchronous code first, then handles async callbacks from the callback queue", "A way to create infinite loops", "A feature for multi-threading", "The Node.js REPL"], 0),
    mcq("What does `require()` do in Node.js (CommonJS)?", "Modules",
      ["Runs an async task", "Loads and caches a module, returning its exports", "Creates a new module", "Installs a package"], 1),
    mcq("What is `npm`?", "Tooling",
      ["Node Performance Monitor", "Node Package Manager — used to install and manage dependencies", "Node Process Manager", "A Node.js testing library"], 1),
    mcq("Which module provides file system operations in Node.js?", "Core Modules",
      ["path", "os", "fs", "http"], 2),
    mcq("What is middleware in Express.js?", "Express",
      ["A database connector", "A function that has access to the request, response, and next function in the request-response cycle", "A template engine", "A routing table"], 1),
    mcq("What does `process.env` provide?", "Node.js",
      ["CPU usage metrics", "An object containing the user's environment variables", "The current process ID", "A list of loaded modules"], 1),
    mcq("What is a stream in Node.js?", "Streams",
      ["A network socket", "An abstract interface for working with streaming data (reading/writing in chunks) rather than loading everything into memory", "A Promise chain", "A type of Buffer"], 1),
    mcq("What does `Promise.all()` do?", "Async",
      ["Runs promises sequentially", "Runs multiple promises concurrently and resolves when all resolve (or rejects if any reject)", "Returns the first resolved promise", "Ignores errors"], 1),
    mcq("What is the purpose of `package.json`?", "Tooling",
      ["To configure the OS", "To define project metadata, dependencies, scripts, and entry point", "To store environment variables", "To define database schemas"], 1),
    msq("Which are core Node.js modules?", "Core Modules",
      ["fs", "path", "http", "express"], [0, 1, 2]),
    msq("Which are valid HTTP methods supported by Express.js?", "Express",
      ["app.get()", "app.post()", "app.delete()", "app.fetch()"], [0, 1, 2]),
    text("What is the file that lists all installed package versions exactly, ensuring reproducible installs?", "Tooling", "package-lock.json"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  6. JAVA  (skillId: 570)
// ═══════════════════════════════════════════════════════════════════════════════
const javaPool = {
  name: "Java – Core Concepts",
  questions: [
    mcq("What is the JVM?", "Platform",
      ["A text editor for Java", "The Java Virtual Machine — an engine that executes Java bytecode and provides platform independence", "A Java framework", "A build tool"], 1),
    mcq("What is the difference between `==` and `.equals()` in Java?", "Comparison",
      ["They are the same", "`==` compares object references; `.equals()` compares object content/value", "`.equals()` compares references; `==` compares values", "`==` is for primitives only in all cases"], 1),
    mcq("What is autoboxing in Java?", "Types",
      ["Converting an array to a List", "Automatic conversion between primitive types and their wrapper classes (e.g., int ↔ Integer)", "Casting a subclass to a superclass", "A garbage collection technique"], 1),
    mcq("What does the `final` keyword do when applied to a variable?", "Keywords",
      ["Makes it thread-safe", "Makes the variable a constant — it cannot be reassigned after initialisation", "Makes it static", "Makes it visible only in the current class"], 1),
    mcq("What is the purpose of the `interface` keyword in Java?", "OOP",
      ["To create abstract classes", "To define a contract (set of abstract methods) that implementing classes must fulfil", "To define enumerations", "To import packages"], 1),
    mcq("What is the difference between `ArrayList` and `LinkedList` in Java?", "Collections",
      ["No difference", "ArrayList uses a dynamic array (fast random access); LinkedList uses a doubly linked list (fast insert/delete)", "LinkedList uses an array; ArrayList uses a linked list", "ArrayList is thread-safe; LinkedList is not"], 1),
    mcq("What does `try-with-resources` do in Java?", "Exceptions",
      ["Retries a failed operation", "Automatically closes resources (implementing AutoCloseable) when the try block exits", "Catches all exceptions silently", "Creates a new thread"], 1),
    mcq("What is method overloading in Java?", "OOP",
      ["Redefining a superclass method in a subclass", "Defining multiple methods with the same name but different parameter lists in the same class", "Making a method abstract", "Calling super class methods"], 1),
    mcq("What is a Java Stream (java.util.stream)?", "Streams",
      ["A network connection", "A sequence of elements supporting aggregate operations (filter, map, reduce, etc.) on collections", "An I/O byte stream", "A multi-threading construct"], 1),
    mcq("What does `synchronized` do in Java?", "Concurrency",
      ["Speeds up execution", "Ensures only one thread can execute the synchronized block/method at a time, preventing race conditions", "Makes a method return immediately", "Marks a method as deprecated"], 1),
    msq("Which are valid access modifiers in Java?", "Modifiers",
      ["public", "private", "protected", "global"], [0, 1, 2]),
    msq("Which Java collections implement the List interface?", "Collections",
      ["ArrayList", "LinkedList", "HashSet", "Vector"], [0, 1, 3]),
    text("What Java keyword prevents a class from being subclassed?", "OOP", "final"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  7. GIT  (skillId: 448)
// ═══════════════════════════════════════════════════════════════════════════════
const gitPool = {
  name: "Git – Version Control",
  questions: [
    mcq("What does `git init` do?", "Basics",
      ["Clones a remote repository", "Initialises a new empty Git repository in the current directory", "Creates a new branch", "Stages all files"], 1),
    mcq("What is the difference between `git fetch` and `git pull`?", "Remote",
      ["They are identical", "`git fetch` downloads remote changes without merging; `git pull` downloads and merges", "`git pull` only downloads; `git fetch` also merges", "`git fetch` deletes remote branches"], 1),
    mcq("What does `git rebase` do?", "Branching",
      ["Merges two branches keeping all merge commits", "Moves or replays commits from one branch on top of another, creating a linear history", "Deletes a branch", "Reverts the last commit"], 1),
    mcq("What is a detached HEAD state?", "Internals",
      ["A corrupted repository", "When HEAD points directly to a commit instead of a branch, so new commits won't belong to any branch", "When the HEAD file is missing", "When you have uncommitted changes"], 1),
    mcq("What does `git stash` do?", "Workflow",
      ["Permanently deletes uncommitted changes", "Temporarily saves uncommitted changes so you can switch branches with a clean working directory", "Commits changes with a message 'stash'", "Creates a backup branch"], 1),
    mcq("What is the purpose of `.gitignore`?", "Configuration",
      ["To list contributors", "To specify files and patterns that Git should not track or commit", "To configure the remote URL", "To define branch protection rules"], 1),
    mcq("What does `git cherry-pick <hash>` do?", "Branching",
      ["Deletes a specific commit", "Applies the changes introduced by a specific commit onto the current branch", "Creates a new branch from that commit", "Reverts a commit"], 1),
    mcq("What is a merge conflict?", "Merging",
      ["When two branches have different names", "When Git cannot automatically reconcile differences between two commits (same lines edited differently)", "When a remote repository is unreachable", "When a branch has no commits"], 1),
    mcq("What does `git reset --hard HEAD~1` do?", "History",
      ["Stages the previous commit's changes", "Discards the last commit AND all working directory changes, moving HEAD one commit back", "Undoes the last commit but keeps changes staged", "Deletes the branch"], 1),
    mcq("What is a Git tag?", "Releases",
      ["A branch that cannot be deleted", "A named reference to a specific commit, typically used to mark release versions", "A label on a file", "A type of merge commit"], 1),
    msq("Which commands show the commit history?", "History",
      ["git log", "git log --oneline", "git show", "git status"], [0, 1, 2]),
    msq("Which are valid ways to undo changes in Git?", "History",
      ["git revert", "git reset", "git restore", "git delete"], [0, 1, 2]),
    text("What git command creates a new branch and switches to it in one step?", "Branching", "git checkout -b"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  8. DOCKER  (skillId: 345)
// ═══════════════════════════════════════════════════════════════════════════════
const dockerPool = {
  name: "Docker – Containers",
  questions: [
    mcq("What is a Docker container?", "Basics",
      ["A virtual machine", "A lightweight, portable, isolated process that runs an application and its dependencies, sharing the host OS kernel", "A Docker image", "A network namespace"], 1),
    mcq("What is a Docker image?", "Basics",
      ["A running container", "A read-only template with instructions for creating a Docker container", "A Docker volume", "A Dockerfile"], 1),
    mcq("What is the purpose of a Dockerfile?", "Basics",
      ["To configure the Docker daemon", "A text file with instructions to build a Docker image layer by layer", "To define multi-container applications", "To manage container networking"], 1),
    mcq("Which Dockerfile instruction sets the base image?", "Dockerfile",
      ["RUN", "CMD", "FROM", "COPY"], 2),
    mcq("What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?", "Dockerfile",
      ["They are identical", "`ENTRYPOINT` sets the main command; `CMD` provides default arguments that can be overridden at runtime", "`CMD` sets the main command; `ENTRYPOINT` provides overridable defaults", "`RUN` and `CMD` are the same"], 1),
    mcq("What does `docker-compose` do?", "Compose",
      ["Builds a single Docker image", "Defines and runs multi-container Docker applications using a YAML file", "Pushes images to Docker Hub", "Monitors container health"], 1),
    mcq("What is a Docker volume?", "Storage",
      ["A read-only file system layer", "A persistent storage mechanism that exists outside the container lifecycle", "A network interface", "A temporary file in the container"], 1),
    mcq("Which flag maps a host port to a container port when running `docker run`?", "Networking",
      ["-v", "-e", "-p", "--net"], 2),
    mcq("What does `docker ps` show?", "CLI",
      ["All images on the host", "All currently running containers", "All stopped containers only", "Docker daemon logs"], 1),
    mcq("What is the purpose of `.dockerignore`?", "Best Practices",
      ["To stop Docker from running", "To exclude files and directories from the Docker build context, reducing image size", "To ignore Dockerfiles", "To configure the Docker daemon"], 1),
    msq("Which Dockerfile instructions add files into the image?", "Dockerfile",
      ["COPY", "ADD", "RUN", "ENV"], [0, 1]),
    msq("Which `docker run` flags are commonly used?", "CLI",
      ["-d (detached)", "-p (port mapping)", "-v (volume mount)", "-b (background)"], [0, 1, 2]),
    text("What command removes all stopped containers, unused networks, dangling images, and build cache?", "CLI", "docker system prune"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  9. REST APIs  (skillId: 891)
// ═══════════════════════════════════════════════════════════════════════════════
const restPool = {
  name: "REST APIs – Design & Concepts",
  questions: [
    mcq("What does REST stand for?", "Basics",
      ["Remote Execution State Transfer", "Representational State Transfer", "Reliable Endpoint Service Technology", "Resource Encoding Standard Transfer"], 1),
    mcq("Which HTTP method is idempotent and used to fully replace a resource?", "HTTP Methods",
      ["POST", "PATCH", "PUT", "GET"], 2),
    mcq("What is the difference between PUT and PATCH?", "HTTP Methods",
      ["They are identical", "PUT replaces the entire resource; PATCH applies a partial update", "PATCH replaces the entire resource; PUT does a partial update", "PUT is not idempotent; PATCH is"], 1),
    mcq("Which HTTP status code should be returned when a resource is created successfully?", "Status Codes",
      ["200 OK", "204 No Content", "201 Created", "202 Accepted"], 2),
    mcq("What does a 401 Unauthorized status code mean?", "Status Codes",
      ["The resource was not found", "The server understood the request but refuses to fulfil it (permission denied)", "Authentication is required or has failed", "The request was malformed"], 2),
    mcq("What is the difference between 401 and 403?", "Status Codes",
      ["They mean the same thing", "401 means authentication is missing/invalid; 403 means authenticated but not authorised", "403 means authentication failed; 401 means authorised but rate-limited", "401 is server error; 403 is client error"], 1),
    mcq("What is HATEOAS?", "REST Constraints",
      ["A caching strategy", "Hypermedia As The Engine Of Application State — the API response includes links to related actions/resources", "An authentication method", "An HTTP compression standard"], 1),
    mcq("What is the purpose of an API rate limit?", "Best Practices",
      ["To improve data compression", "To limit the number of requests a client can make in a given time window, preventing abuse and ensuring availability", "To block unauthenticated users", "To cache responses"], 1),
    mcq("Which HTTP header is used to specify the format of the request body?", "Headers",
      ["Accept", "Authorization", "Content-Type", "Cache-Control"], 2),
    mcq("What does `Accept: application/json` in a request header indicate?", "Headers",
      ["The client is sending JSON", "The client wants the response in JSON format", "The server will only accept JSON", "The request body is JSON"], 1),
    msq("Which HTTP methods are considered safe (no side effects)?", "HTTP Methods",
      ["GET", "HEAD", "OPTIONS", "DELETE"], [0, 1, 2]),
    msq("Which HTTP status codes indicate a client error (4xx)?", "Status Codes",
      ["400 Bad Request", "401 Unauthorized", "404 Not Found", "500 Internal Server Error"], [0, 1, 2]),
    text("Which HTTP method is used to retrieve resource metadata without the response body?", "HTTP Methods", "HEAD"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  10. LINUX  (skillId: 639)
// ═══════════════════════════════════════════════════════════════════════════════
const linuxPool = {
  name: "Linux – System Administration",
  questions: [
    mcq("What does `chmod 644 file.txt` set?", "Permissions",
      ["Owner: rwx, Group: r--, Others: r--", "Owner: rw-, Group: r--, Others: r--", "Owner: rw-, Group: rw-, Others: rw-", "Owner: rwx, Group: rw-, Others: r--"], 1),
    mcq("Which command shows disk usage of files and directories?", "Disk",
      ["df", "ls -s", "du", "stat"], 2),
    mcq("What does `df -h` display?", "Disk",
      ["Directory contents", "Disk free space of mounted file systems in human-readable format", "Detailed file metadata", "Running processes"], 1),
    mcq("What is a symbolic (soft) link?", "File System",
      ["A direct reference to inode data", "A file that points to the path of another file — breaking the target breaks the link", "A hard copy of a file", "A compressed archive"], 1),
    mcq("What does `cron` do in Linux?", "Scheduling",
      ["Compresses files on a schedule", "A time-based job scheduler that runs commands at specified intervals", "Monitors CPU usage", "Manages system updates"], 1),
    mcq("Which command shows the last N lines of a file and follows new output in real time?", "File Viewing",
      ["head -f", "cat -n", "tail -f", "less +F"], 2),
    mcq("What does `netstat -tuln` show?", "Networking",
      ["All running processes", "Active TCP/UDP listening ports and their sockets", "DNS resolution results", "Network interface configuration"], 1),
    mcq("What is `sudo`?", "Permissions",
      ["A package manager", "A command that allows a permitted user to run a command as root (or another user)", "A text editor", "A shell type"], 1),
    mcq("Which command searches for a string recursively in all files in a directory?", "Text Processing",
      ["find . -name 'string'", "locate string", "grep -r 'string' .", "awk 'string'"], 2),
    mcq("What does `ps aux` display?", "Processes",
      ["Disk partitions", "All running processes with user, CPU, and memory usage", "System log files", "Open network ports"], 1),
    msq("Which commands can monitor real-time system resource usage?", "Monitoring",
      ["top", "htop", "vmstat", "mkdir"], [0, 1, 2]),
    msq("Which are valid package managers in Linux distributions?", "Package Management",
      ["apt (Debian/Ubuntu)", "yum/dnf (RHEL/CentOS)", "pacman (Arch)", "brew (macOS only)"], [0, 1, 2]),
    text("What command displays the manual page for a command?", "Help", "man"),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SKILL DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const skills = [
  { skillId: 852,  skillName: "Python",      pool: pythonPool,     slug: "python-core",      name: "Python – Core Concepts",          time: 25 },
  { skillId: 571,  skillName: "JavaScript",  pool: javascriptPool, slug: "js-core-concepts", name: "JavaScript – Core Concepts",      time: 25 },
  { skillId: 1068, skillName: "TypeScript",  pool: typescriptPool, slug: "typescript-core",  name: "TypeScript – Core Concepts",      time: 20 },
  { skillId: 875,  skillName: "React",       pool: reactPool,      slug: "react-core",       name: "React – Core Concepts",           time: 25 },
  { skillId: 736,  skillName: "Node.js",     pool: nodejsPool,     slug: "nodejs-core",      name: "Node.js – Core Concepts",         time: 20 },
  { skillId: 570,  skillName: "Java",        pool: javaPool,       slug: "java-core",        name: "Java – Core Concepts",            time: 25 },
  { skillId: 448,  skillName: "Git",         pool: gitPool,        slug: "git-version-control", name: "Git – Version Control",        time: 20 },
  { skillId: 345,  skillName: "Docker",      pool: dockerPool,     slug: "docker-containers", name: "Docker – Containers",            time: 20 },
  { skillId: 891,  skillName: "REST APIs",   pool: restPool,       slug: "rest-api-design",  name: "REST APIs – Design & Concepts",   time: 20 },
  { skillId: 639,  skillName: "Linux",       pool: linuxPool,      slug: "linux-sysadmin",   name: "Linux – System Administration",   time: 20 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════════════════════════════

const seed = async () => {
  await db();
  try {
    for (const s of skills) {
      // Idempotent — remove old data for this slug/pool name
      await Assesment.deleteMany({ slug: s.slug });
      await QuestionPool.deleteMany({ name: s.pool.name });

      const pool = await QuestionPool.create(s.pool);
      await Assesment.create({
        name:    s.name,
        slug:    s.slug,
        skillId: s.skillId,
        sections: [{
          title:        "Quiz",
          type:         "quiz",
          maxQuestion:  10,
          maxTime:      s.time,
          maxScore:     100,
          description:  `Multiple choice questions on ${s.skillName}.`,
          questionPool: pool._id,
          problemPool:  [],
        }],
      });
      console.log(`  ✅ ${s.name} (${s.pool.questions.length} questions)`);
    }

    console.log(`\n🎉 ${skills.length} skill assessments seeded successfully`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
