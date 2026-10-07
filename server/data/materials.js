// TODO: Replace with the `materials` collection. Files are not stored yet;
// `fileName`/`fileSize` describe a mock upload. Use GridFS or object storage later.
const { daysFromNow } = require('../utils/dates');

// source is a file name for uploads, or a URL when type is 'link'
const m = (id, courseId, week, title, type, description, source, size, uploadedDaysAgo, uploadedBy) => ({
  id,
  courseId,
  week,
  title,
  type,
  description,
  fileName: type === 'link' ? null : source,
  fileSize: type === 'link' ? null : size,
  url: type === 'link' ? source : null,
  uploadedAt: daysFromNow(-uploadedDaysAgo, 10, 30),
  uploadedBy,
});

const materials = [
  m('m-101', 'c-cs301', 1, 'Asymptotic Notation and Recurrences', 'pdf', 'Lecture notes for weeks 1–2 including solved recurrence examples.', 'CS301_Unit1_Asymptotic_Analysis.pdf', '1.8 MB', 60, 'u-t2'),
  m('m-102', 'c-cs301', 3, 'AVL Tree Rotations', 'slides', 'Slides used in class with step-by-step rotation diagrams.', 'CS301_AVL_Rotations.pptx', '3.2 MB', 40, 'u-t2'),
  m('m-103', 'c-cs301', 5, 'Graph Algorithms – Reference Sheet', 'pdf', 'Pseudocode for BFS, DFS, Dijkstra, Prim and Kruskal.', 'CS301_Graph_Reference.pdf', '640 KB', 12, 'u-t2'),
  m('m-104', 'c-cs301', 5, 'VisuAlgo – Graph Traversal Visualiser', 'link', 'Interactive visualisation recommended for revision.', 'https://visualgo.net/en/dfsbfs', null, 10, 'u-t2'),

  m('m-201', 'c-cs305', 1, 'Introduction to DBMS and the ER Model', 'pdf', 'Unit 1 notes covering data models, schemas and ER notation.', 'CS305_Unit1_ER_Model.pdf', '2.4 MB', 62, 'u-t1'),
  m('m-202', 'c-cs305', 2, 'Relational Algebra', 'slides', 'Selection, projection, joins and division with worked examples.', 'CS305_Relational_Algebra.pptx', '4.1 MB', 48, 'u-t1'),
  m('m-203', 'c-cs305', 3, 'SQL Practice Schema (University DB)', 'notes', 'Schema and sample data for lab exercises. Load into MySQL or PostgreSQL.', 'university_schema.sql', '38 KB', 30, 'u-t1'),
  m('m-204', 'c-cs305', 4, 'Functional Dependencies and Normal Forms', 'pdf', 'Closure, canonical cover and decomposition into BCNF/3NF.', 'CS305_Unit4_Normalization.pdf', '1.6 MB', 14, 'u-t1'),
  m('m-205', 'c-cs305', 4, 'Normalization – Worked Problems', 'pdf', 'Six solved problems from previous end-semester papers.', 'CS305_Normalization_Solved.pdf', '890 KB', 9, 'u-t1'),
  m('m-206', 'c-cs305', 5, 'PostgreSQL Documentation – Transactions', 'link', 'Official reference for transaction isolation levels.', 'https://www.postgresql.org/docs/current/transaction-iso.html', null, 3, 'u-t1'),

  m('m-301', 'c-cs307', 1, 'Network Models and Layering', 'slides', 'OSI vs TCP/IP with protocol data units at each layer.', 'CS307_Layering.pptx', '2.7 MB', 58, 'u-t3'),
  m('m-302', 'c-cs307', 3, 'IPv4 Addressing and Subnetting', 'pdf', 'Notes with CIDR and VLSM examples.', 'CS307_Subnetting.pdf', '1.1 MB', 25, 'u-t3'),
  m('m-303', 'c-cs307', 5, 'Beej’s Guide to Network Programming', 'link', 'Reference for the socket programming assignment.', 'https://beej.us/guide/bgnet/', null, 4, 'u-t3'),

  m('m-401', 'c-cs309', 1, 'Processes and Threads', 'pdf', 'Unit 1 lecture notes.', 'CS309_Unit1_Processes.pdf', '1.9 MB', 61, 'u-t4'),
  m('m-402', 'c-cs309', 2, 'CPU Scheduling Algorithms', 'slides', 'Gantt chart examples for FCFS, SJF, SRTF and RR.', 'CS309_CPU_Scheduling.pptx', '2.2 MB', 35, 'u-t4'),
  m('m-403', 'c-cs309', 4, 'Page Replacement – FIFO, LRU, Optimal', 'notes', 'Class notes with reference strings used in the lecture.', 'CS309_Page_Replacement_Notes.docx', '310 KB', 6, 'u-t4'),

  m('m-501', 'c-se311', 1, 'Software Process Models', 'slides', 'Waterfall, spiral, incremental and agile models compared.', 'SE311_Process_Models.pptx', '3.5 MB', 59, 'u-t1'),
  m('m-502', 'c-se311', 2, 'SRS Template (IEEE 830)', 'notes', 'Template to be used for the SRS assignment.', 'SE311_SRS_Template.docx', '120 KB', 28, 'u-t1'),
  m('m-503', 'c-se311', 3, 'UML Diagrams – Quick Reference', 'pdf', 'Notation summary for use case, class and sequence diagrams.', 'SE311_UML_Reference.pdf', '760 KB', 7, 'u-t1'),

  m('m-601', 'c-ec303', 1, 'Discrete-time Signals and Systems', 'pdf', 'Unit 1 notes.', 'EC303_Unit1_Signals.pdf', '2.0 MB', 55, 'u-t5'),
  m('m-602', 'c-ec303', 4, 'FIR Filter Design using Windows', 'slides', 'Rectangular, Hamming, Hanning and Blackman windows.', 'EC303_FIR_Windowing.pptx', '2.9 MB', 9, 'u-t5'),

  m('m-701', 'c-ma201', 2, 'Random Variables', 'pdf', 'Discrete and continuous random variables with solved examples.', 'MA201_Random_Variables.pdf', '1.3 MB', 30, 'u-t6'),
];

module.exports = materials;
