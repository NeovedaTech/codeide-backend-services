import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import { QuestionPool } from "../models/QuestionPool.js";
import Assesment from "../models/Assesment.js";
import { db } from "../../config/config.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
//  COMPUTER SCIENCE FUNDAMENTALS
// ═══════════════════════════════════════════════════════════════════════════════

const csPools = [

  // ── Pool 1: Data Structures ──────────────────────────────────────────────────
  {
    name: "CS – Data Structures",
    questions: [
      mcq("What is the time complexity of accessing an element in an array by index?", "Arrays",
        ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2),
      mcq("Which data structure uses LIFO (Last In, First Out) order?", "Stack & Queue",
        ["Queue", "Stack", "Linked List", "Heap"], 1),
      mcq("Which data structure uses FIFO (First In, First Out) order?", "Stack & Queue",
        ["Stack", "Tree", "Queue", "Graph"], 2),
      mcq("What is the worst-case time complexity for searching in an unsorted array?", "Arrays",
        ["O(1)", "O(log n)", "O(n log n)", "O(n)"], 3),
      mcq("In a singly linked list, what does the last node's 'next' pointer contain?", "Linked Lists",
        ["The head node", "A reference to itself", "NULL / None", "The previous node"], 2),
      mcq("What is the height of a balanced binary tree with n nodes?", "Trees",
        ["O(n)", "O(n²)", "O(log n)", "O(1)"], 2),
      mcq("Which data structure is best for implementing a priority queue efficiently?", "Heap",
        ["Array", "Linked List", "Binary Heap", "Hash Table"], 2),
      mcq("What is the average-case time complexity of hash table lookup?", "Hash Tables",
        ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 3),
      mcq("In a binary search tree (BST), which traversal gives elements in sorted order?", "Trees",
        ["Pre-order", "Post-order", "In-order", "Level-order"], 2),
      mcq("What is the space complexity of a depth-first search (DFS) on a graph with V vertices and E edges?", "Graphs",
        ["O(V + E)", "O(V)", "O(E)", "O(1)"], 1),
      msq("Which operations does a stack support?", "Stack & Queue",
        ["push", "pop", "peek/top", "enqueue"], [0, 1, 2]),
      msq("Which of the following are self-balancing BST variants?", "Trees",
        ["AVL Tree", "Red-Black Tree", "Binary Search Tree (plain)", "B-Tree"], [0, 1, 3]),
      text("What is the term for the number of edges in the longest path from the root to a leaf in a tree?", "Trees", "height"),
    ],
  },

  // ── Pool 2: Algorithms & Complexity ─────────────────────────────────────────
  {
    name: "CS – Algorithms & Complexity",
    questions: [
      mcq("What is the time complexity of binary search on a sorted array of n elements?", "Searching",
        ["O(n)", "O(1)", "O(log n)", "O(n log n)"], 2),
      mcq("Which sorting algorithm has the best average-case time complexity?", "Sorting",
        ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], 2),
      mcq("What is the worst-case time complexity of Quick Sort?", "Sorting",
        ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], 1),
      mcq("Which algorithm paradigm divides the problem into subproblems, solves them independently, and combines results?", "Paradigms",
        ["Greedy", "Divide and Conquer", "Dynamic Programming", "Backtracking"], 1),
      mcq("Dynamic Programming is most appropriate when a problem has:", "Paradigms",
        ["No repeated subproblems", "Overlapping subproblems and optimal substructure", "Only one valid solution", "Exponential input size"], 1),
      mcq("What is the time complexity of Merge Sort?", "Sorting",
        ["O(n²)", "O(n)", "O(n log n)", "O(log n)"], 2),
      mcq("Which data structure is used in Breadth-First Search (BFS)?", "Graphs",
        ["Stack", "Priority Queue", "Queue", "Deque"], 2),
      mcq("What does Big-O notation describe?", "Complexity",
        ["Exact runtime of an algorithm", "Best-case runtime", "Upper bound on the growth rate of runtime", "Memory usage only"], 2),
      mcq("Dijkstra's algorithm finds:", "Graphs",
        ["Minimum spanning tree", "Shortest path from a source to all vertices (non-negative weights)", "All pairs shortest paths", "Topological ordering"], 1),
      mcq("Which technique stores results of expensive function calls and returns cached results?", "Optimization",
        ["Lazy evaluation", "Memoization", "Tail recursion", "Currying"], 1),
      msq("Which sorting algorithms are comparison-based?", "Sorting",
        ["Merge Sort", "Quick Sort", "Counting Sort", "Insertion Sort"], [0, 1, 3]),
      msq("Which of the following have O(n log n) worst-case time complexity?", "Sorting",
        ["Merge Sort", "Heap Sort", "Quick Sort", "Bubble Sort"], [0, 1]),
      text("What is the name of the algorithm that finds the minimum spanning tree using a greedy approach, starting from any vertex?", "Graphs", "Prim's algorithm"),
    ],
  },

  // ── Pool 3: Object-Oriented Programming ─────────────────────────────────────
  {
    name: "CS – Object-Oriented Programming",
    questions: [
      mcq("Which OOP principle hides the internal state of an object and only exposes necessary methods?", "OOP Principles",
        ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], 2),
      mcq("Which principle allows a subclass to inherit properties and methods from a superclass?", "OOP Principles",
        ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"], 3),
      mcq("What is polymorphism?", "OOP Principles",
        ["One class having multiple constructors", "The ability of different objects to respond to the same interface in different ways", "Hiding implementation details", "Sharing state between objects"], 1),
      mcq("What is an abstract class?", "Abstraction",
        ["A class that cannot have any methods", "A class that cannot be instantiated and may have abstract methods", "A class with only static methods", "A class with no fields"], 1),
      mcq("What is method overriding?", "Polymorphism",
        ["Defining multiple methods with the same name but different parameter lists", "Redefining a superclass method in a subclass with the same signature", "Calling a parent method from a child class", "Creating a new method at runtime"], 1),
      mcq("What is the difference between an interface and an abstract class?", "Abstraction",
        ["Interfaces can have constructors; abstract classes cannot", "A class can implement multiple interfaces but can only inherit one abstract class (in most languages)", "Abstract classes have no concrete methods", "There is no difference"], 1),
      mcq("What does the 'S' in SOLID principles stand for?", "SOLID",
        ["Substitution", "Single Responsibility", "Static Methods", "Superclass"], 1),
      mcq("Which design pattern ensures a class has only one instance?", "Design Patterns",
        ["Factory", "Observer", "Singleton", "Decorator"], 2),
      mcq("What is composition over inheritance?", "OOP Principles",
        ["Always using abstract classes", "Preferring to build complex behaviour by combining simpler objects rather than through a deep inheritance hierarchy", "Avoiding the use of interfaces", "Using multiple inheritance"], 1),
      mcq("What is a constructor?", "Classes",
        ["A method that destroys an object", "A special method called when an object is created to initialise it", "A static method that creates multiple instances", "A method that copies an object"], 1),
      msq("Which are the four core OOP principles?", "OOP Principles",
        ["Encapsulation", "Inheritance", "Polymorphism", "Compilation"], [0, 1, 2]),
      msq("Which are creational design patterns?", "Design Patterns",
        ["Singleton", "Factory Method", "Observer", "Builder"], [0, 1, 3]),
      text("What OOP concept allows a child class to provide a specific implementation of a method already defined in its parent class?", "Polymorphism", "method overriding"),
    ],
  },

  // ── Pool 4: Computer Networks ────────────────────────────────────────────────
  {
    name: "CS – Computer Networks",
    questions: [
      mcq("How many layers are in the OSI model?", "OSI Model",
        ["4", "5", "6", "7"], 3),
      mcq("Which OSI layer is responsible for routing packets between networks?", "OSI Model",
        ["Data Link", "Transport", "Network", "Session"], 2),
      mcq("Which protocol is connectionless and does not guarantee delivery?", "Transport Layer",
        ["TCP", "FTP", "UDP", "HTTP"], 2),
      mcq("What is the default port for HTTPS?", "Protocols",
        ["80", "21", "443", "8080"], 2),
      mcq("What does DNS stand for?", "Protocols",
        ["Data Network Service", "Domain Name System", "Dynamic Numbering Scheme", "Distributed Node Sync"], 1),
      mcq("Which HTTP method is used to submit data to be processed (e.g., form submission)?", "HTTP",
        ["GET", "PUT", "POST", "DELETE"], 2),
      mcq("What is the purpose of the TCP three-way handshake?", "TCP",
        ["To encrypt the connection", "To establish a reliable connection between client and server", "To authenticate the user", "To compress data"], 1),
      mcq("Which HTTP status code indicates a successful request?", "HTTP",
        ["404", "500", "301", "200"], 3),
      mcq("What does an IP address identify?", "IP",
        ["A specific user", "A device on a network", "A web page", "A DNS record"], 1),
      mcq("What is the difference between TCP and UDP?", "Transport Layer",
        ["TCP is faster; UDP is slower", "TCP is connectionless; UDP is connection-oriented", "TCP guarantees delivery and order; UDP does not", "They are identical"], 2),
      msq("Which are application-layer protocols?", "Protocols",
        ["HTTP", "FTP", "SMTP", "IP"], [0, 1, 2]),
      msq("Which HTTP methods are considered safe (read-only, no side effects)?", "HTTP",
        ["GET", "HEAD", "POST", "OPTIONS"], [0, 1, 3]),
      text("What protocol resolves IP addresses to MAC addresses on a local network?", "Protocols", "ARP"),
    ],
  },

  // ── Pool 5: Databases (Fundamentals) ────────────────────────────────────────
  {
    name: "CS – Database Fundamentals",
    questions: [
      mcq("What does ACID stand for in database transactions?", "Transactions",
        ["Access, Consistency, Isolation, Durability", "Atomicity, Consistency, Isolation, Durability", "Atomicity, Concurrency, Integrity, Durability", "Availability, Consistency, Isolation, Data"], 1),
      mcq("What is a primary key?", "Relational DB",
        ["Any column in a table", "A column that uniquely identifies each row", "A foreign key reference", "An indexed column"], 1),
      mcq("What is normalization?", "Relational DB",
        ["Speeding up queries with indexes", "The process of organizing data to reduce redundancy and improve integrity", "Backing up a database", "Converting data types"], 1),
      mcq("Which normal form eliminates partial dependencies?", "Normalization",
        ["1NF", "2NF", "3NF", "BCNF"], 1),
      mcq("What is a foreign key?", "Relational DB",
        ["A key that encrypts data", "A column that references the primary key of another table", "A duplicate primary key", "An auto-incremented integer"], 1),
      mcq("What is the CAP theorem?", "Distributed DB",
        ["A database can have Consistency, Availability, and Partition tolerance simultaneously", "A distributed system can guarantee at most two of: Consistency, Availability, Partition tolerance", "A theorem about SQL performance", "A normalization rule"], 1),
      mcq("What type of database stores data as key-value pairs, documents, or graphs instead of tables?", "NoSQL",
        ["Relational Database", "NoSQL Database", "In-memory Database", "Graph Database only"], 1),
      mcq("Which operation in SQL removes all rows from a table without logging individual row deletions?", "SQL",
        ["DELETE", "DROP", "TRUNCATE", "REMOVE"], 2),
      mcq("What is an index in a database?", "Performance",
        ["A backup copy of the table", "A data structure that speeds up data retrieval at the cost of storage and write speed", "A constraint on data values", "A type of join"], 1),
      mcq("What does an ORM (Object-Relational Mapper) do?", "ORM",
        ["Converts SQL to NoSQL", "Maps database tables to objects in application code", "Backs up a database", "Optimises query plans"], 1),
      msq("Which properties does an ACID transaction guarantee?", "Transactions",
        ["Atomicity", "Consistency", "Isolation", "Availability"], [0, 1, 2]),
      msq("Which are examples of NoSQL database types?", "NoSQL",
        ["Document store (MongoDB)", "Key-value store (Redis)", "Graph database (Neo4j)", "Relational (PostgreSQL)"], [0, 1, 2]),
      text("What is the name of the process of converting a database design into 2NF, 3NF, etc. to reduce redundancy?", "Normalization", "normalization"),
    ],
  },
];

const csAssessments = [
  { name: "CS – Data Structures",             slug: "cs-data-structures",          poolIndex: 0, time: 25 },
  { name: "CS – Algorithms & Complexity",     slug: "cs-algorithms-complexity",     poolIndex: 1, time: 25 },
  { name: "CS – Object-Oriented Programming", slug: "cs-oop",                       poolIndex: 2, time: 20 },
  { name: "CS – Computer Networks",           slug: "cs-computer-networks",         poolIndex: 3, time: 20 },
  { name: "CS – Database Fundamentals",       slug: "cs-database-fundamentals",     poolIndex: 4, time: 20 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  OPERATING SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════════

const osPools = [

  // ── Pool 1: Processes & Threads ──────────────────────────────────────────────
  {
    name: "OS – Processes & Threads",
    questions: [
      mcq("What is a process?", "Processes",
        ["A running program — an instance of a program in execution", "A compiled binary file", "A hardware component", "A system call"], 0),
      mcq("What is the difference between a process and a thread?", "Threads",
        ["They are the same thing", "A process has its own memory space; threads within a process share memory", "Threads have their own memory; processes share memory", "A thread can contain multiple processes"], 1),
      mcq("Which process state means the process is waiting for a resource or event?", "Process States",
        ["Running", "Ready", "Blocked/Waiting", "Terminated"], 2),
      mcq("What is a context switch?", "Scheduling",
        ["Switching the CPU from user mode to kernel mode", "Saving the state of one process and restoring the state of another", "Creating a new process", "Allocating memory to a process"], 1),
      mcq("What is the purpose of the Process Control Block (PCB)?", "Processes",
        ["To store the program's source code", "To store all information about a process (state, PC, registers, etc.)", "To manage file I/O", "To handle network connections"], 1),
      mcq("What is a zombie process?", "Processes",
        ["A process that has crashed", "A process that has finished but whose exit status has not been collected by the parent", "A process consuming 100% CPU", "A process with no parent"], 1),
      mcq("What system call creates a new process in Unix/Linux?", "System Calls",
        ["exec()", "spawn()", "fork()", "create()"], 2),
      mcq("Which of the following is an advantage of threads over processes?", "Threads",
        ["Better isolation", "Lower overhead for creation and communication due to shared memory", "Simpler to program", "Separate address spaces"], 1),
      mcq("What is the 'critical section' problem?", "Synchronization",
        ["A section of code that runs in kernel mode only", "The part of code where a shared resource is accessed and must not be executed by more than one thread simultaneously", "A method to speed up context switches", "A way to terminate threads safely"], 1),
      mcq("What does IPC stand for?", "IPC",
        ["Internal Process Control", "Inter-Process Communication", "Integrated Program Compilation", "Interrupt Processing Call"], 1),
      msq("Which are valid inter-process communication (IPC) mechanisms?", "IPC",
        ["Pipes", "Message Queues", "Shared Memory", "CPU Registers"], [0, 1, 2]),
      msq("Which are valid process states in a typical OS?", "Process States",
        ["New", "Ready", "Running", "Compiling"], [0, 1, 2]),
      text("What is the name of the initial process started by the kernel in Unix/Linux (PID 1)?", "Processes", "init"),
    ],
  },

  // ── Pool 2: CPU Scheduling ───────────────────────────────────────────────────
  {
    name: "OS – CPU Scheduling",
    questions: [
      mcq("Which scheduling algorithm gives the CPU to the process with the shortest next CPU burst?", "Scheduling Algorithms",
        ["FCFS", "Round Robin", "SJF (Shortest Job First)", "Priority Scheduling"], 2),
      mcq("What is the main disadvantage of FCFS (First Come First Served) scheduling?", "Scheduling Algorithms",
        ["High overhead", "Convoy effect — short processes wait behind long ones", "Starvation of long processes", "Requires knowing burst time in advance"], 1),
      mcq("In Round Robin scheduling, what is the 'time quantum'?", "Scheduling Algorithms",
        ["The total execution time of all processes", "The fixed time slice each process gets before being preempted", "The time a process spends waiting", "The number of context switches"], 1),
      mcq("What is starvation in the context of scheduling?", "Scheduling Algorithms",
        ["A process consuming 100% CPU", "A process that is perpetually denied CPU time because higher-priority processes keep arriving", "A process running out of memory", "The OS running out of processes to schedule"], 1),
      mcq("What is the difference between preemptive and non-preemptive scheduling?", "Scheduling",
        ["Preemptive scheduling allows the OS to forcibly take the CPU from a running process; non-preemptive does not", "Non-preemptive scheduling uses time slices; preemptive does not", "They are the same", "Preemptive means the process voluntarily gives up the CPU"], 0),
      mcq("Which metric measures the time from process submission to completion?", "Metrics",
        ["CPU Utilization", "Throughput", "Turnaround Time", "Response Time"], 2),
      mcq("Which scheduling algorithm can lead to starvation but offers good average waiting time?", "Scheduling Algorithms",
        ["FCFS", "Round Robin", "Priority Scheduling (without aging)", "Multilevel Queue"], 2),
      mcq("What is 'aging' in scheduling?", "Scheduling Algorithms",
        ["Terminating old processes automatically", "Gradually increasing the priority of waiting processes to prevent starvation", "Reducing CPU time of long-running processes", "Tracking process age for billing"], 1),
      mcq("In which scheduling algorithm does each process get an equal share of CPU time in a circular manner?", "Scheduling Algorithms",
        ["FCFS", "Round Robin", "SJF", "Priority"], 1),
      mcq("What does CPU utilization measure?", "Metrics",
        ["Percentage of time the CPU is busy", "Number of processes completed per second", "Average waiting time", "Memory usage"], 0),
      msq("Which are preemptive scheduling algorithms?", "Scheduling Algorithms",
        ["Round Robin", "Preemptive SJF (SRTF)", "FCFS", "Preemptive Priority"], [0, 1, 3]),
      msq("Which of the following are valid CPU scheduling metrics?", "Metrics",
        ["Throughput", "Turnaround Time", "Waiting Time", "Cache Hit Rate"], [0, 1, 2]),
      text("What is the scheduling algorithm that selects the process with the shortest remaining time next? (abbreviation)", "Scheduling Algorithms", "SRTF"),
    ],
  },

  // ── Pool 3: Memory Management ────────────────────────────────────────────────
  {
    name: "OS – Memory Management",
    questions: [
      mcq("What is virtual memory?", "Virtual Memory",
        ["RAM installed in the system", "A technique that allows processes to use more memory than physically available by using disk space as an extension", "The CPU's cache memory", "Memory dedicated to the kernel"], 1),
      mcq("What is paging in OS memory management?", "Paging",
        ["Dividing memory into variable-size segments", "Dividing memory into fixed-size blocks (pages/frames) to eliminate external fragmentation", "Swapping entire processes to disk", "Allocating memory at compile time"], 1),
      mcq("What is a page fault?", "Virtual Memory",
        ["A hardware failure in RAM", "An error in page table", "An event when a process accesses a page not currently in physical memory", "A segmentation fault in user space"], 2),
      mcq("What is external fragmentation?", "Fragmentation",
        ["Wasted space within allocated memory blocks", "Free memory that is split into small non-contiguous chunks that cannot satisfy a large request", "Memory used by the OS kernel", "Memory that cannot be addressed"], 1),
      mcq("Which page replacement algorithm replaces the page that will not be used for the longest time in the future?", "Page Replacement",
        ["LRU", "FIFO", "Optimal (OPT)", "Clock"], 2),
      mcq("What does TLB stand for?", "Paging",
        ["Thread Local Block", "Translation Lookaside Buffer", "Table Layout Buffer", "Task Load Balancer"], 1),
      mcq("What is thrashing?", "Virtual Memory",
        ["Excessive CPU usage by a single process", "A condition where the system spends more time paging than executing processes", "Rapid context switching", "Overwriting the page table"], 1),
      mcq("What is the difference between paging and segmentation?", "Memory Management",
        ["Paging uses variable-size units; segmentation uses fixed-size units", "Paging divides memory into fixed-size pages; segmentation divides it into logical variable-size segments", "They are identical", "Segmentation is only used in virtual memory"], 1),
      mcq("Which page replacement policy replaces the oldest page in memory (first loaded)?", "Page Replacement",
        ["LRU", "FIFO", "Optimal", "LFU"], 1),
      mcq("What is the purpose of the page table?", "Paging",
        ["To store process code", "To map virtual page numbers to physical frame numbers", "To manage CPU scheduling", "To handle I/O requests"], 1),
      msq("Which are valid page replacement algorithms?", "Page Replacement",
        ["FIFO", "LRU (Least Recently Used)", "Optimal (OPT)", "FIFO with aging (Clock)"], [0, 1, 2, 3]),
      msq("Which techniques does an OS use to manage memory?", "Memory Management",
        ["Paging", "Segmentation", "Virtual Memory", "Defragmentation"], [0, 1, 2]),
      text("What is the name of the fixed-size block of physical memory that corresponds to a page in paging?", "Paging", "frame"),
    ],
  },

  // ── Pool 4: Synchronization & Deadlocks ──────────────────────────────────────
  {
    name: "OS – Synchronization & Deadlocks",
    questions: [
      mcq("What is a race condition?", "Synchronization",
        ["A bug where two threads run at different speeds", "A situation where the outcome depends on the non-deterministic ordering of concurrent operations on shared data", "Two processes competing for CPU time", "An algorithm for process scheduling"], 1),
      mcq("What is a mutex (mutual exclusion lock)?", "Synchronization",
        ["A read-only lock", "A synchronisation primitive that ensures only one thread can access a critical section at a time", "A message-passing mechanism", "A type of semaphore with no counter"], 1),
      mcq("What is a semaphore?", "Synchronization",
        ["A type of process", "A synchronization variable with a counter, supporting wait (P) and signal (V) operations", "A memory management unit", "An IPC mechanism based on shared memory"], 1),
      mcq("Which of the four Coffman conditions must ALL be present for a deadlock to occur?", "Deadlocks",
        ["Mutual Exclusion, Starvation, Preemption, Circular Wait", "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", "Starvation, Hold & Wait, Preemption, Circular Wait", "Mutual Exclusion, Hold & Wait, Preemption, No Circular Wait"], 1),
      mcq("What is deadlock prevention?", "Deadlocks",
        ["Detecting a deadlock after it occurs and recovering", "Ensuring at least one of the four Coffman conditions can never hold", "Ignoring the possibility of deadlock", "Allocating all resources upfront"], 1),
      mcq("What is the Banker's Algorithm used for?", "Deadlocks",
        ["CPU scheduling", "Deadlock avoidance — determining safe resource allocation states", "Memory management", "Page replacement"], 1),
      mcq("What is a binary semaphore?", "Synchronization",
        ["A semaphore with a count between 0 and any N", "A semaphore that can only take values 0 or 1 (equivalent to a mutex)", "A semaphore shared between two processes only", "A read-write lock"], 1),
      mcq("What is a monitor in concurrent programming?", "Synchronization",
        ["A hardware device", "A high-level synchronization construct that encapsulates shared data, procedures, and condition variables", "A type of deadlock detection algorithm", "An interrupt handler"], 1),
      mcq("What is livelock?", "Deadlocks",
        ["A process that is blocked forever", "Processes are not blocked but keep changing state in response to each other without making progress", "Two processes sharing the same lock", "A form of starvation"], 1),
      mcq("Which condition for deadlock states that a resource held by a process can only be released voluntarily?", "Deadlocks",
        ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"], 2),
      msq("Which are the four Coffman conditions for deadlock?", "Deadlocks",
        ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"], [0, 1, 2, 3]),
      msq("Which are valid deadlock handling strategies?", "Deadlocks",
        ["Prevention", "Avoidance", "Detection & Recovery", "Ignoring (Ostrich Algorithm)"], [0, 1, 2, 3]),
      text("What is the name of the synchronization problem where a producer generates data and a consumer processes it, and they must not read/write simultaneously?", "Synchronization", "producer-consumer problem"),
    ],
  },

  // ── Pool 5: File Systems & I/O ───────────────────────────────────────────────
  {
    name: "OS – File Systems & I/O",
    questions: [
      mcq("What is a file system?", "File Systems",
        ["The physical storage medium", "The method and data structures the OS uses to manage and store files on disk", "A type of RAM", "The kernel's scheduler"], 1),
      mcq("What is an inode in Unix/Linux file systems?", "File Systems",
        ["A directory entry containing the file name", "A data structure storing metadata about a file (permissions, size, timestamps, data block pointers) — not the file name", "A type of hard disk", "A kernel process for I/O"], 1),
      mcq("What is the difference between a hard link and a soft (symbolic) link?", "File Systems",
        ["Hard links point to the inode; soft links point to the file path/name", "Soft links point to the inode; hard links point to the path", "They are identical", "Hard links work across file systems; soft links do not"], 0),
      mcq("Which disk scheduling algorithm services requests in the order they arrive?", "Disk Scheduling",
        ["SSTF", "SCAN", "FCFS", "C-SCAN"], 2),
      mcq("What is disk fragmentation?", "File Systems",
        ["Dividing a disk into partitions", "Files stored in non-contiguous blocks, reducing read efficiency", "Encrypting files on disk", "Allocating memory in pages"], 1),
      mcq("What is buffering in I/O?", "I/O Management",
        ["Compressing data before writing", "Temporarily storing data in memory while it is being transferred between devices or between a device and an application", "Encrypting I/O data", "Scheduling disk access"], 1),
      mcq("Which file allocation method offers the fastest direct access?", "File Allocation",
        ["Linked Allocation", "Indexed Allocation", "Contiguous Allocation", "FAT"], 2),
      mcq("What does DMA (Direct Memory Access) allow?", "I/O Management",
        ["The CPU to read disk data faster", "Devices to transfer data to/from memory without CPU intervention", "Memory to be shared between processes", "Faster context switches"], 1),
      mcq("What is a device driver?", "I/O Management",
        ["A software that manages user authentication", "Software that allows the OS to communicate with a hardware device", "A file system type", "A type of process scheduler"], 1),
      mcq("In the UNIX/Linux permission model, what does `rwxr-xr--` mean?", "File Systems",
        ["Owner: rwx, Group: r-x, Others: r--", "Owner: r--, Group: r-x, Others: rwx", "Owner: rwx, Group: rwx, Others: r--", "Owner: r-x, Group: rwx, Others: r--"], 0),
      msq("Which are valid disk scheduling algorithms?", "Disk Scheduling",
        ["FCFS", "SSTF (Shortest Seek Time First)", "SCAN (Elevator)", "LRU"], [0, 1, 2]),
      msq("Which are common Unix/Linux file system types?", "File Systems",
        ["ext4", "NTFS", "FAT32", "XFS"], [0, 1, 2, 3]),
      text("What is the name of the special file in Unix/Linux that discards all data written to it?", "File Systems", "/dev/null"),
    ],
  },
];

const osAssessments = [
  { name: "OS – Processes & Threads",          slug: "os-processes-threads",         poolIndex: 0, time: 20 },
  { name: "OS – CPU Scheduling",               slug: "os-cpu-scheduling",            poolIndex: 1, time: 20 },
  { name: "OS – Memory Management",            slug: "os-memory-management",         poolIndex: 2, time: 25 },
  { name: "OS – Synchronization & Deadlocks",  slug: "os-sync-deadlocks",            poolIndex: 3, time: 25 },
  { name: "OS – File Systems & I/O",           slug: "os-file-systems-io",           poolIndex: 4, time: 20 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════════════════════════════

const seedSkill = async ({ skillId, skillName, poolDefs, assessmentDefs }) => {
  await Assesment.deleteMany({ slug: { $in: assessmentDefs.map((a) => a.slug) } });
  await QuestionPool.deleteMany({ name: { $in: poolDefs.map((p) => p.name) } });
  console.log(`🗑  Cleared existing data for ${skillName}`);

  for (const def of assessmentDefs) {
    const pool = await QuestionPool.create(poolDefs[def.poolIndex]);
    const assessment = await Assesment.create({
      name: def.name,
      slug: def.slug,
      skillId,
      sections: [{
        title: "Quiz",
        type: "quiz",
        maxQuestion: 10,
        maxTime: def.time,
        maxScore: 100,
        description: `Multiple choice questions on ${def.name.split("–")[1]?.trim() ?? skillName}.`,
        questionPool: pool._id,
        problemPool: [],
      }],
    });
    console.log(`  ✅ ${assessment.name}`);
  }
  console.log(`✅ ${skillName}: ${assessmentDefs.length} assessments inserted\n`);
};

const seed = async () => {
  await db();
  try {
    await seedSkill({ skillId: 300, skillName: "CS",          poolDefs: csPools, assessmentDefs: csAssessments });
    await seedSkill({ skillId: 301, skillName: "OS",          poolDefs: osPools, assessmentDefs: osAssessments });
    console.log("🎉 CS & OS question banks seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
