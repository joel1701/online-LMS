// Sample data. Seeds the MongoDB `assignments` collection (npm run seed).
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
  a('as-01', 'c-ml', 'Linear Regression from Scratch',
    'Implement linear regression in Python using only NumPy, trained with batch gradient descent. Plot the cost against iterations for three learning rates and compare your coefficients with scikit-learn. Include a short report (max 2 pages).',
    20, -6, 20, { name: 'ML_Assignment1_Brief.pdf', size: '210 KB' }, 'u-t2'),
  a('as-02', 'c-ml', 'Decision Tree Problem Set',
    'Solve the eight problems in the attached sheet. Problems 1–4 require hand computation of entropy and information gain; problems 5–8 require code. Submit a single PDF with explanations and a ZIP of your notebooks.',
    5, 4, 20, { name: 'ML_ProblemSet_DecisionTrees.pdf', size: '180 KB' }, 'u-t2'),

  a('as-03', 'c-flat', 'DFA Design Exercise',
    'Design DFAs for the eight languages listed in the brief. For each, give the transition diagram and the transition table, and trace the machine on two accepted and two rejected strings.',
    25, -12, 15, null, 'u-t8'),
  a('as-04', 'c-flat', 'NFA to DFA Conversion and Minimisation',
    'Convert each of the five NFAs in the brief to an equivalent DFA using the subset construction, then minimise the resulting DFA using the table-filling method. Show every step.',
    10, -1, 20, { name: 'NFA_Conversion_Exercise.pdf', size: '95 KB' }, 'u-t8'),
  a('as-05', 'c-flat', 'JFLAP Exercise – Regular Expressions to NFA',
    'Using JFLAP, build ε-NFAs for the 12 regular expressions in the exercise sheet and test each with the given strings. Submit the .jff files in one ZIP, named by question number.',
    2, 6, 25, { name: 'jflap_exercises.pdf', size: '64 KB' }, 'u-t8'),

  a('as-06', 'c-cn', 'Subnetting Worksheet',
    'Complete all subnetting and VLSM questions on the worksheet. Show the network address, broadcast address and usable host range for every subnet.',
    15, -3, 10, { name: 'Subnetting_Worksheet.pdf', size: '120 KB' }, 'u-t3'),
  a('as-07', 'c-cn', 'Socket Programming: Multi-client Chat Server',
    'Build a TCP chat server in C or Python that supports at least five concurrent clients using threads or select(). Include a README describing how to run the server and client.',
    3, 10, 30, null, 'u-t3'),

  a('as-08', 'c-os', 'CPU Scheduling Simulator',
    'Write a simulator for FCFS, SJF (non-preemptive), SRTF and Round Robin. For each algorithm output the Gantt chart, average waiting time and average turnaround time for the given process set.',
    18, -4, 25, null, 'u-t4'),
  a('as-09', 'c-os', 'Page Replacement Analysis',
    'For the three reference strings provided in class, compute page faults for FIFO, LRU and Optimal with 3, 4 and 5 frames. Comment on whether Belady’s anomaly occurs.',
    1, 2, 15, null, 'u-t4'),

  a('as-10', 'c-se', 'Software Requirements Specification (SRS)',
    'Prepare an SRS for your team project following the IEEE 830 template shared in Materials. Each team member submits the same document individually.',
    21, -7, 20, null, 'u-t1'),
  a('as-11', 'c-se', 'UML Use Case and Class Diagrams',
    'Draw the use case diagram and the class diagram for your team project. Include at least six use cases and show associations, multiplicities and inheritance where applicable.',
    4, 8, 20, null, 'u-t1'),

  a('as-14', 'c-spm', 'Project Plan and Work Breakdown Structure',
    'Prepare a project charter and a work breakdown structure for your team project. Identify at least 25 work packages and draw the activity network with the critical path.',
    16, -5, 20, null, 'u-t9'),
  a('as-15', 'c-spm', 'COCOMO II Effort Estimation',
    'Estimate the effort, duration and team size for the case study in the brief using the COCOMO II early design model. State every cost driver you assume and justify it.',
    3, 9, 15, { name: 'SPM_COCOMO_CaseStudy.pdf', size: '140 KB' }, 'u-t9'),

  a('as-16', 'c-se-lab', 'Lab Record – Experiments 1 to 4',
    'Submit the lab record for experiments 1 to 4: problem statement, SRS, use case diagram and use case descriptions for your team project.',
    14, -6, 10, null, 'u-t1'),
  a('as-17', 'c-se-lab', 'Experiment 5: Class and Sequence Diagrams',
    'Model the class diagram and two sequence diagrams for your team project in StarUML. Export the diagrams as images and add them to your lab record.',
    2, 5, 10, null, 'u-t1'),

  a('as-18', 'c-oscn-lab', 'Lab Record – Scheduling and Page Replacement Programs',
    'Submit the source code and output screenshots for the CPU scheduling and page replacement programs (experiments 1 to 5).',
    12, -3, 10, null, 'u-t4'),
  a('as-19', 'c-oscn-lab', 'Experiment 6: Packet Capture with Wireshark',
    'Capture traffic while loading a web page and answer the questions in the handout on DNS, TCP handshake and HTTP headers. Include annotated screenshots.',
    1, 7, 10, { name: 'Wireshark_Handout.pdf', size: '320 KB' }, 'u-t4'),

  a('as-20', 'c-ml-lab', 'Lab Record – Data Preprocessing and Linear Regression',
    'Submit the notebooks for experiments 1 to 4: data cleaning with pandas, feature scaling, simple and multiple linear regression.',
    13, -4, 10, null, 'u-t2'),
  a('as-21', 'c-ml-lab', 'Experiment 6: k-Means Clustering on the Iris Dataset',
    'Apply k-means to the Iris dataset for k = 2 to 6, plot the elbow curve and compare the clusters with the true species labels.',
    2, 3, 10, null, 'u-t2'),

  a('as-22', 'c-internship', 'Internship Completion Report and Certificate',
    'Upload your internship completion certificate and a report of 15–20 pages describing the organisation, the work you did each week and what you learnt. Presentations to the department committee follow in the week after the deadline.',
    30, 20, 50, { name: 'Internship_Report_Guidelines.pdf', size: '230 KB' }, 'u-t2'),

  a('as-12', 'c-ec303', 'FIR Filter Design using Windowing',
    'Design a low-pass FIR filter (N = 31, cutoff 0.3π) using the Hamming and Blackman windows. Plot the magnitude responses in MATLAB or Python and compare stop-band attenuation.',
    8, 3, 20, null, 'u-t5'),

  a('as-13', 'c-ma201', 'Probability Distributions Problem Set',
    'Solve problems 1–10 from Chapter 4. Show all working; final answers alone will not receive credit.',
    12, -2, 20, null, 'u-t6'),
];

module.exports = assignments;
