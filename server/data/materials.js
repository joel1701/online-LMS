// Sample data. Seeds the MongoDB `materials` collection (npm run seed).
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
  m('m-101', 'c-ml', 1, 'Introduction to Machine Learning', 'pdf', 'Unit 1 notes: types of learning, hypothesis space and the bias–variance trade-off.', 'ML_Unit1_Introduction.pdf', '1.8 MB', 60, 'u-t2'),
  m('m-102', 'c-ml', 2, 'Linear and Logistic Regression', 'slides', 'Slides used in class, including the derivation of gradient descent updates.', 'ML_Unit2_Regression.pptx', '3.2 MB', 40, 'u-t2'),
  m('m-103', 'c-ml', 5, 'Decision Trees – Worked Examples', 'pdf', 'Entropy, information gain and Gini index computed step by step.', 'ML_Decision_Trees_Examples.pdf', '640 KB', 12, 'u-t2'),
  m('m-104', 'c-ml', 5, 'scikit-learn User Guide – Decision Trees', 'link', 'Reference for the coding problems in the problem set.', 'https://scikit-learn.org/stable/modules/tree.html', null, 10, 'u-t2'),

  m('m-201', 'c-flat', 1, 'Finite Automata – DFA and NFA', 'pdf', 'Unit 1 notes covering DFA, NFA, ε-NFA and the subset construction.', 'FLAT_Unit1_Finite_Automata.pdf', '2.4 MB', 62, 'u-t8'),
  m('m-202', 'c-flat', 2, 'DFA Minimisation', 'slides', 'Table-filling method with two complete worked examples.', 'FLAT_DFA_Minimisation.pptx', '4.1 MB', 48, 'u-t8'),
  m('m-203', 'c-flat', 3, 'Regular Expressions and Arden’s Theorem', 'notes', 'Class notes on converting between regular expressions and finite automata.', 'FLAT_Regular_Expressions_Notes.docx', '380 KB', 30, 'u-t8'),
  m('m-204', 'c-flat', 4, 'Pumping Lemma for Regular Languages', 'pdf', 'Statement, proof idea and how to use it to show a language is not regular.', 'FLAT_Pumping_Lemma.pdf', '1.6 MB', 14, 'u-t8'),
  m('m-205', 'c-flat', 4, 'Pumping Lemma – Solved Problems', 'pdf', 'Six solved problems from previous semester-end examinations.', 'FLAT_Pumping_Lemma_Solved.pdf', '890 KB', 9, 'u-t8'),
  m('m-206', 'c-flat', 5, 'JFLAP – Download and Tutorials', 'link', 'Tool used for the JFLAP exercise. Requires Java.', 'https://www.jflap.org/', null, 3, 'u-t8'),

  m('m-301', 'c-cn', 1, 'Network Models and Layering', 'slides', 'OSI vs TCP/IP with protocol data units at each layer.', 'CN_Layering.pptx', '2.7 MB', 58, 'u-t3'),
  m('m-302', 'c-cn', 3, 'IPv4 Addressing and Subnetting', 'pdf', 'Notes with CIDR and VLSM examples.', 'CN_Subnetting.pdf', '1.1 MB', 25, 'u-t3'),
  m('m-303', 'c-cn', 5, 'Beej’s Guide to Network Programming', 'link', 'Reference for the socket programming assignment.', 'https://beej.us/guide/bgnet/', null, 4, 'u-t3'),

  m('m-401', 'c-os', 1, 'Processes and Threads', 'pdf', 'Unit 1 lecture notes.', 'OS_Unit1_Processes.pdf', '1.9 MB', 61, 'u-t4'),
  m('m-402', 'c-os', 2, 'CPU Scheduling Algorithms', 'slides', 'Gantt chart examples for FCFS, SJF, SRTF and RR.', 'OS_CPU_Scheduling.pptx', '2.2 MB', 35, 'u-t4'),
  m('m-403', 'c-os', 4, 'Page Replacement – FIFO, LRU, Optimal', 'notes', 'Class notes with reference strings used in the lecture.', 'OS_Page_Replacement_Notes.docx', '310 KB', 6, 'u-t4'),

  m('m-501', 'c-se', 1, 'Software Process Models', 'slides', 'Waterfall, spiral, incremental and agile models compared.', 'SE_Process_Models.pptx', '3.5 MB', 59, 'u-t1'),
  m('m-502', 'c-se', 2, 'SRS Template (IEEE 830)', 'notes', 'Template to be used for the SRS assignment.', 'SE_SRS_Template.docx', '120 KB', 28, 'u-t1'),
  m('m-503', 'c-se', 3, 'UML Diagrams – Quick Reference', 'pdf', 'Notation summary for use case, class and sequence diagrams.', 'SE_UML_Reference.pdf', '760 KB', 7, 'u-t1'),

  m('m-801', 'c-spm', 2, 'Work Breakdown Structures', 'slides', 'Deliverable-oriented and activity-oriented WBS with examples.', 'SPM_Unit2_WBS.pptx', '2.1 MB', 20, 'u-t9'),
  m('m-802', 'c-spm', 3, 'COCOMO II Model Reference', 'pdf', 'Scale factors, effort multipliers and worked estimation examples.', 'SPM_COCOMO_II_Reference.pdf', '1.2 MB', 5, 'u-t9'),
  m('m-901', 'c-se-lab', 1, 'Lab Manual – Software Engineering Lab', 'pdf', 'List of experiments, record format and evaluation scheme.', 'SE_Lab_Manual.pdf', '1.4 MB', 50, 'u-t1'),
  m('m-902', 'c-oscn-lab', 1, 'Lab Manual – OS & CN Lab', 'pdf', 'List of experiments with sample input and expected output.', 'OS_CN_Lab_Manual.pdf', '1.9 MB', 50, 'u-t4'),
  m('m-903', 'c-ml-lab', 1, 'Lab Manual – Machine Learning Lab', 'pdf', 'Experiments, datasets used and notebook submission format.', 'ML_Lab_Manual.pdf', '1.1 MB', 50, 'u-t2'),
  m('m-904', 'c-ml-lab', 4, 'Datasets for Lab Experiments', 'notes', 'CSV files for the regression and clustering experiments.', 'ml_lab_datasets.zip', '4.6 MB', 15, 'u-t2'),
  m('m-951', 'c-internship', 1, 'Internship Guidelines and Report Format', 'pdf', 'Eligibility, approved organisations, report structure and evaluation rubric.', 'Internship_II_Guidelines.pdf', '780 KB', 40, 'u-t2'),

  m('m-601', 'c-ec303', 1, 'Discrete-time Signals and Systems', 'pdf', 'Unit 1 notes.', 'EC303_Unit1_Signals.pdf', '2.0 MB', 55, 'u-t5'),
  m('m-602', 'c-ec303', 4, 'FIR Filter Design using Windows', 'slides', 'Rectangular, Hamming, Hanning and Blackman windows.', 'EC303_FIR_Windowing.pptx', '2.9 MB', 9, 'u-t5'),

  m('m-701', 'c-ma201', 2, 'Random Variables', 'pdf', 'Discrete and continuous random variables with solved examples.', 'MA201_Random_Variables.pdf', '1.3 MB', 30, 'u-t6'),
];

module.exports = materials;
