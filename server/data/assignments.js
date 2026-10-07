// TODO: Replace with the `assignments` collection.
const { daysFromNow } = require('../utils/dates');

const a = (id, courseId, title, description, issuedDaysAgo, dueInDays, maxMarks, attachment, createdBy) => ({
  id,
  courseId,
  title,
  description,
  issueDate: daysFromNow(-issuedDaysAgo, 9, 0),
  dueDate: daysFromNow(dueInDays, 23, 59),
  maxMarks,
  attachment,
  createdBy,
  createdAt: daysFromNow(-issuedDaysAgo, 9, 0),
});

const assignments = [
  a('as-01', 'c-cs301', 'Implement an AVL Tree',
    'Implement an AVL tree in C++ or Java supporting insert, delete and search. Print the tree in level order after every operation and include a short report (max 2 pages) analysing the time complexity of each operation with reference to your rotations.',
    20, -6, 20, { name: 'AVL_Assignment_Brief.pdf', size: '210 KB' }, 'u-t2'),
  a('as-02', 'c-cs301', 'Graph Traversal Problem Set',
    'Solve the eight problems in the attached sheet. Problems 1–4 require BFS/DFS reasoning; problems 5–8 require code. Submit a single PDF with explanations and a ZIP of your source files merged into one archive.',
    5, 4, 20, { name: 'CS301_ProblemSet_Graphs.pdf', size: '180 KB' }, 'u-t2'),

  a('as-03', 'c-cs305', 'ER Diagram for a Hospital Management System',
    'Design an ER diagram for a hospital that tracks patients, doctors, wards, appointments and billing. Clearly indicate cardinality, participation constraints and weak entities. Convert the ER diagram to a relational schema.',
    25, -12, 15, null, 'u-t1'),
  a('as-04', 'c-cs305', 'Normalization Exercise (1NF to BCNF)',
    'For each of the five relations in the brief, find the candidate keys, compute a canonical cover and decompose the relation into BCNF. State whether each decomposition is dependency preserving.',
    10, -1, 20, { name: 'Normalization_Exercise.pdf', size: '95 KB' }, 'u-t1'),
  a('as-05', 'c-cs305', 'SQL Lab – Joins and Subqueries',
    'Using the university schema shared in Materials, write SQL queries for the 12 questions in the lab sheet. Submit a .sql file with each query preceded by a comment containing the question number.',
    2, 6, 25, { name: 'lab5_questions.pdf', size: '64 KB' }, 'u-t1'),

  a('as-06', 'c-cs307', 'Subnetting Worksheet',
    'Complete all subnetting and VLSM questions on the worksheet. Show the network address, broadcast address and usable host range for every subnet.',
    15, -3, 10, { name: 'Subnetting_Worksheet.pdf', size: '120 KB' }, 'u-t3'),
  a('as-07', 'c-cs307', 'Socket Programming: Multi-client Chat Server',
    'Build a TCP chat server in C or Python that supports at least five concurrent clients using threads or select(). Include a README describing how to run the server and client.',
    3, 10, 30, null, 'u-t3'),

  a('as-08', 'c-cs309', 'CPU Scheduling Simulator',
    'Write a simulator for FCFS, SJF (non-preemptive), SRTF and Round Robin. For each algorithm output the Gantt chart, average waiting time and average turnaround time for the given process set.',
    18, -4, 25, null, 'u-t4'),
  a('as-09', 'c-cs309', 'Page Replacement Analysis',
    'For the three reference strings provided in class, compute page faults for FIFO, LRU and Optimal with 3, 4 and 5 frames. Comment on whether Belady’s anomaly occurs.',
    1, 2, 15, null, 'u-t4'),

  a('as-10', 'c-se311', 'Software Requirements Specification (SRS)',
    'Prepare an SRS for your team project following the IEEE 830 template shared in Materials. Each team member submits the same document individually.',
    21, -7, 20, null, 'u-t1'),
  a('as-11', 'c-se311', 'UML Use Case and Class Diagrams',
    'Draw the use case diagram and the class diagram for your team project. Include at least six use cases and show associations, multiplicities and inheritance where applicable.',
    4, 8, 20, null, 'u-t1'),

  a('as-12', 'c-ec303', 'FIR Filter Design using Windowing',
    'Design a low-pass FIR filter (N = 31, cutoff 0.3π) using the Hamming and Blackman windows. Plot the magnitude responses in MATLAB or Python and compare stop-band attenuation.',
    8, 3, 20, null, 'u-t5'),

  a('as-13', 'c-ma201', 'Probability Distributions Problem Set',
    'Solve problems 1–10 from Chapter 4. Show all working; final answers alone will not receive credit.',
    12, -2, 20, null, 'u-t6'),
];

module.exports = assignments;
