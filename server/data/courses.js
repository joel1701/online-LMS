// Sample data. Seeds the MongoDB `courses` collection (npm run seed).
// become ObjectId references to `users`.
const CSE_SEM5 = ['u-s1', 'u-s2', 'u-s3', 'u-s4', 'u-s5', 'u-s6', 'u-s7', 'u-s8', 'u-s9', 'u-s10'];
const ECE_SEM3 = ['u-s11', 'u-s12', 'u-s13', 'u-s14'];

const TERM = 'V Semester 2026–27';

// Semester V scheme (R-22A, Department of Information Technology).
// `type` separates theory courses from practicals; `order` follows the S.No in the scheme.
const course = (fields) => ({
  department: 'CSE',
  semester: 5,
  term: TERM,
  status: 'active',
  studentIds: [...CSE_SEM5],
  schedule: [],
  syllabus: [],
  ...fields,
});

const courses = [
  // ---------- Theory ----------
  course({
    id: 'c-se',
    code: '22CSC21N',
    title: 'Software Engineering',
    type: 'theory',
    order: 1,
    credits: 3,
    teacherId: 'u-t1',
    weights: { assignments: 50, tests: 50 },
    description:
      'Systematic approaches to developing software. Software process models, requirements engineering, UML-based design, testing strategies, project management and maintenance. Students work in teams on a semester-long project.',
    schedule: [
      { day: 'Monday', time: '14:00 – 15:00', room: 'N-110' },
      { day: 'Wednesday', time: '10:00 – 11:00', room: 'N-110' },
      { day: 'Friday', time: '11:00 – 12:00', room: 'N-110' },
    ],
    syllabus: [
      { unit: 1, title: 'Process Models', topics: 'Waterfall, incremental, spiral, agile and Scrum' },
      { unit: 2, title: 'Requirements', topics: 'Elicitation, SRS (IEEE 830), use cases' },
      { unit: 3, title: 'Design', topics: 'UML class, sequence and activity diagrams; design principles' },
      { unit: 4, title: 'Testing', topics: 'Unit, integration, system testing; black-box and white-box' },
      { unit: 5, title: 'Maintenance and Quality', topics: 'Software maintenance, reengineering, quality standards' },
    ],
  }),
  course({
    id: 'c-ml',
    code: '22CAC21N',
    title: 'Machine Learning',
    type: 'theory',
    order: 2,
    credits: 3,
    teacherId: 'u-t2',
    weights: { assignments: 40, tests: 60 },
    description:
      'Foundations of supervised and unsupervised learning. Covers regression, classification, decision trees, support vector machines, ensemble methods, clustering, dimensionality reduction and model evaluation.',
    schedule: [
      { day: 'Monday', time: '09:00 – 10:00', room: 'N-204' },
      { day: 'Wednesday', time: '09:00 – 10:00', room: 'N-204' },
      { day: 'Thursday', time: '11:00 – 12:00', room: 'N-204' },
    ],
    syllabus: [
      { unit: 1, title: 'Introduction', topics: 'Types of learning, hypothesis space, bias–variance trade-off' },
      { unit: 2, title: 'Regression', topics: 'Linear and logistic regression, gradient descent, regularization' },
      { unit: 3, title: 'Classification', topics: 'Decision trees, k-NN, naive Bayes, support vector machines' },
      { unit: 4, title: 'Ensembles and Evaluation', topics: 'Bagging, random forests, boosting; cross-validation, metrics' },
      { unit: 5, title: 'Unsupervised Learning', topics: 'k-means, hierarchical clustering, PCA' },
    ],
  }),
  course({
    id: 'c-cn',
    code: '22ITC10N',
    title: 'Computer Networks',
    type: 'theory',
    order: 3,
    credits: 3,
    teacherId: 'u-t3',
    weights: { assignments: 40, tests: 60 },
    description:
      'Layered network architecture with a focus on the Internet protocol suite. Topics include data link protocols, IP addressing and subnetting, routing, TCP and UDP, congestion control and application-layer protocols.',
    schedule: [
      { day: 'Monday', time: '11:00 – 12:00', room: 'N-206' },
      { day: 'Wednesday', time: '11:00 – 12:00', room: 'N-206' },
      { day: 'Friday', time: '10:00 – 11:00', room: 'N-206' },
    ],
    syllabus: [
      { unit: 1, title: 'Network Models', topics: 'OSI and TCP/IP models, switching, performance metrics' },
      { unit: 2, title: 'Data Link Layer', topics: 'Framing, error detection, ARQ protocols, Ethernet' },
      { unit: 3, title: 'Network Layer', topics: 'IPv4, subnetting, CIDR, routing algorithms' },
      { unit: 4, title: 'Transport Layer', topics: 'UDP, TCP, flow and congestion control' },
      { unit: 5, title: 'Application Layer', topics: 'DNS, HTTP, SMTP, socket programming' },
    ],
  }),
  course({
    id: 'c-flat',
    code: '22ITC12N',
    title: 'Formal Languages and Automata Theory',
    type: 'theory',
    order: 4,
    credits: 3,
    teacherId: 'u-t1',
    weights: { assignments: 40, tests: 60 },
    description:
      'Mathematical models of computation. Finite automata, regular expressions and regular languages, context-free grammars and pushdown automata, Turing machines and an introduction to decidability.',
    schedule: [
      { day: 'Tuesday', time: '10:00 – 11:00', room: 'N-108' },
      { day: 'Thursday', time: '10:00 – 11:00', room: 'N-108' },
      { day: 'Friday', time: '09:00 – 10:00', room: 'N-108' },
    ],
    syllabus: [
      { unit: 1, title: 'Finite Automata', topics: 'DFA, NFA, ε-NFA, subset construction, minimisation' },
      { unit: 2, title: 'Regular Languages', topics: 'Regular expressions, Arden’s theorem, pumping lemma, closure properties' },
      { unit: 3, title: 'Context-free Grammars', topics: 'Derivations, parse trees, ambiguity, CNF and GNF' },
      { unit: 4, title: 'Pushdown Automata', topics: 'PDA, equivalence of PDA and CFG, pumping lemma for CFLs' },
      { unit: 5, title: 'Turing Machines', topics: 'TM design, variants, decidability, halting problem' },
    ],
  }),
  course({
    id: 'c-os',
    code: '22CSC15N',
    title: 'Operating Systems',
    type: 'theory',
    order: 5,
    credits: 3,
    teacherId: 'u-t4',
    weights: { assignments: 40, tests: 60 },
    description:
      'Structure and functions of modern operating systems: processes and threads, CPU scheduling, synchronization, deadlocks, memory management, virtual memory, file systems and I/O.',
    schedule: [
      { day: 'Tuesday', time: '09:00 – 10:00', room: 'N-204' },
      { day: 'Thursday', time: '09:00 – 10:00', room: 'N-204' },
      { day: 'Saturday', time: '10:00 – 11:00', room: 'N-204' },
    ],
    syllabus: [
      { unit: 1, title: 'Processes and Threads', topics: 'Process states, PCB, context switch, threads' },
      { unit: 2, title: 'CPU Scheduling', topics: 'FCFS, SJF, priority, round robin, multilevel queues' },
      { unit: 3, title: 'Synchronization', topics: 'Critical section, semaphores, monitors, classic problems' },
      { unit: 4, title: 'Memory Management', topics: 'Paging, segmentation, virtual memory, page replacement' },
      { unit: 5, title: 'Storage', topics: 'File systems, disk scheduling, I/O systems' },
    ],
  }),
  course({
    id: 'c-spm',
    code: 'PE-2',
    title: 'Software Project Management',
    type: 'theory',
    order: 6,
    credits: 3,
    teacherId: 'u-t3',
    weights: { assignments: 50, tests: 50 },
    description:
      'Professional Elective – 2. Planning, estimating and controlling software projects: project life cycles, work breakdown structures, effort and cost estimation, scheduling, risk management, and agile project management.',
    schedule: [
      { day: 'Tuesday', time: '14:00 – 15:00', room: 'N-112' },
      { day: 'Thursday', time: '14:00 – 15:00', room: 'N-112' },
      { day: 'Saturday', time: '11:00 – 12:00', room: 'N-112' },
    ],
    syllabus: [
      { unit: 1, title: 'Project Management Basics', topics: 'Project life cycle, stakeholders, project charter' },
      { unit: 2, title: 'Planning', topics: 'Work breakdown structure, activity planning, network diagrams' },
      { unit: 3, title: 'Estimation', topics: 'Function points, COCOMO II, cost estimation' },
      { unit: 4, title: 'Scheduling and Risk', topics: 'Critical path, PERT, resource allocation, risk management' },
      { unit: 5, title: 'Monitoring and Agile', topics: 'Earned value analysis, Scrum, Kanban, team management' },
    ],
  }),

  // ---------- Practicals ----------
  course({
    id: 'c-se-lab',
    code: '22CSC49',
    title: 'Software Engineering Lab',
    type: 'practical',
    order: 7,
    credits: 1,
    teacherId: 'u-t1',
    weights: { assignments: 100, tests: 0 },
    description:
      'Laboratory companion to Software Engineering. Students model their team project using UML tools, prepare requirement and design documents, and write test cases.',
    schedule: [{ day: 'Monday', time: '15:00 – 17:00', room: 'IT Lab 3' }],
    syllabus: [
      { unit: 1, title: 'Requirements', topics: 'Problem statement, SRS, use case diagrams' },
      { unit: 2, title: 'Design', topics: 'Class, sequence, activity and state chart diagrams in StarUML' },
      { unit: 3, title: 'Testing', topics: 'Test plan and test cases for the team project' },
    ],
  }),
  course({
    id: 'c-oscn-lab',
    code: '22ITC04N',
    title: 'Operating Systems & Computer Networks Lab',
    type: 'practical',
    order: 8,
    credits: 1.5,
    teacherId: 'u-t4',
    weights: { assignments: 100, tests: 0 },
    description:
      'Programs for CPU scheduling, synchronization, deadlock avoidance and page replacement, followed by socket programming and network analysis with Wireshark.',
    schedule: [{ day: 'Wednesday', time: '14:00 – 17:00', room: 'IT Lab 1' }],
    syllabus: [
      { unit: 1, title: 'OS Programs', topics: 'Scheduling algorithms, producer–consumer, Banker’s algorithm, page replacement' },
      { unit: 2, title: 'Network Programs', topics: 'TCP/UDP sockets, CRC, sliding window, routing simulation' },
      { unit: 3, title: 'Network Tools', topics: 'Wireshark packet capture, ping, traceroute, netstat' },
    ],
  }),
  course({
    id: 'c-ml-lab',
    code: '22CAC22N',
    title: 'Machine Learning Lab',
    type: 'practical',
    order: 9,
    credits: 1.5,
    teacherId: 'u-t2',
    weights: { assignments: 100, tests: 0 },
    description:
      'Python implementations of the algorithms covered in Machine Learning using NumPy, pandas and scikit-learn, with emphasis on data preparation and model evaluation.',
    schedule: [{ day: 'Friday', time: '14:00 – 17:00', room: 'IT Lab 2' }],
    syllabus: [
      { unit: 1, title: 'Data Preparation', topics: 'pandas, missing values, encoding, feature scaling' },
      { unit: 2, title: 'Supervised Models', topics: 'Linear and logistic regression, decision trees, SVM' },
      { unit: 3, title: 'Unsupervised Models', topics: 'k-means clustering, PCA' },
    ],
  }),
  course({
    id: 'c-internship',
    code: '22ITI02',
    title: 'Industrial / Rural Internship-II',
    type: 'practical',
    order: 10,
    credits: 2,
    teacherId: 'u-t2',
    weights: { assignments: 100, tests: 0 },
    description:
      'Internship of 3–4 weeks (90 hours) in industry or a rural development setting. Students submit a completion certificate and a report, and present their work to the department committee. Evaluated through CIE only.',
  }),

  // ---------- Other departments ----------
  {
    id: 'c-ec303',
    type: 'theory',
    code: 'EC303',
    title: 'Digital Signal Processing',
    department: 'ECE',
    semester: 3,
    term: TERM,
    credits: 4,
    teacherId: 'u-t5',
    status: 'active',
    studentIds: [...ECE_SEM3],
    weights: { assignments: 40, tests: 60 },
    description:
      'Discrete-time signals and systems, the z-transform, the discrete Fourier transform and FFT algorithms, and the design of FIR and IIR digital filters.',
    schedule: [
      { day: 'Monday', time: '10:00 – 11:00', room: 'EC-102' },
      { day: 'Wednesday', time: '10:00 – 11:00', room: 'EC-102' },
      { day: 'Friday', time: '14:00 – 16:00', room: 'DSP Lab' },
    ],
    syllabus: [
      { unit: 1, title: 'Discrete-time Signals', topics: 'Sampling, LTI systems, convolution' },
      { unit: 2, title: 'z-Transform', topics: 'ROC, inverse z-transform, system functions' },
      { unit: 3, title: 'DFT and FFT', topics: 'DFT properties, radix-2 FFT' },
      { unit: 4, title: 'FIR Filters', topics: 'Windowing, frequency sampling' },
      { unit: 5, title: 'IIR Filters', topics: 'Bilinear transform, Butterworth and Chebyshev' },
    ],
  },
  {
    id: 'c-ma201',
    type: 'theory',
    code: 'MA201',
    title: 'Probability and Statistics',
    department: 'MATH',
    semester: 3,
    term: TERM,
    credits: 3,
    teacherId: 'u-t6',
    status: 'active',
    studentIds: [...ECE_SEM3],
    weights: { assignments: 40, tests: 60 },
    description:
      'Probability axioms, random variables, standard discrete and continuous distributions, joint distributions, sampling theory, estimation and hypothesis testing.',
    schedule: [
      { day: 'Tuesday', time: '11:00 – 12:00', room: 'SC-005' },
      { day: 'Thursday', time: '11:00 – 12:00', room: 'SC-005' },
    ],
    syllabus: [
      { unit: 1, title: 'Probability', topics: 'Axioms, conditional probability, Bayes theorem' },
      { unit: 2, title: 'Random Variables', topics: 'PMF, PDF, expectation, variance' },
      { unit: 3, title: 'Distributions', topics: 'Binomial, Poisson, normal, exponential' },
      { unit: 4, title: 'Sampling', topics: 'Sampling distributions, central limit theorem' },
      { unit: 5, title: 'Inference', topics: 'Estimation, t-test, chi-square test' },
    ],
  },
  {
    id: 'c-cs215',
    type: 'theory',
    code: 'CS215',
    title: 'Object Oriented Programming',
    department: 'CSE',
    semester: 3,
    term: 'III Semester 2025–26',
    credits: 3,
    teacherId: 'u-t3',
    status: 'archived',
    studentIds: [],
    weights: { assignments: 50, tests: 50 },
    description: 'Object-oriented programming in Java: classes, inheritance, polymorphism, interfaces, exceptions and collections. Offered in the previous academic year.',
    schedule: [],
    syllabus: [],
  },
];

module.exports = courses;
module.exports.TERM = TERM;
