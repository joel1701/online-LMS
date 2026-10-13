// Sample data. Seeds the MongoDB `submissions` collection (npm run seed).
// (assignmentId -> assignments, studentId -> users).
const assignments = require('./assignments');

const FEEDBACK = {
  high: 'Well structured and complete. Good work.',
  mid: 'Mostly correct. Review the comments discussed in class for the sections that lost marks.',
  low: 'Several parts are incomplete. Please meet me during office hours.',
};

// [studentId, submittedHoursBeforeDue, marks (null = not graded yet), comment]
// A negative hours value means the work was submitted after the deadline.
const seed = {
  'as-01': [
    ['u-s1', 30, 17, 'Implemented in Python with NumPy. The report is the last section of the PDF.'],
    ['u-s2', 4, 15, ''],
    ['u-s3', 52, 19, ''],
    ['u-s4', 2, 12, 'Gradient descent diverges for the largest learning rate; this is discussed in the report.'],
    ['u-s5', 40, 18, ''],
    ['u-s6', 20, 14, ''],
    ['u-s7', 26, 16, ''],
    ['u-s9', 70, 18, ''],
    ['u-s10', -10, 11, 'Submitting late due to illness, medical certificate given to the department.'],
  ],
  'as-02': [
    ['u-s3', 140, null, ''],
    ['u-s5', 130, null, 'Problem 7 is verified against scikit-learn’s DecisionTreeClassifier.'],
  ],
  'as-03': [
    ['u-s1', 48, 13, ''],
    ['u-s2', 10, 12, ''],
    ['u-s3', 72, 14, ''],
    ['u-s4', 3, 10, ''],
    ['u-s5', 30, 14, ''],
    ['u-s6', 12, 11, ''],
    ['u-s7', 36, 13, ''],
    ['u-s8', 1, 9, ''],
    ['u-s9', 60, 15, ''],
    ['u-s10', 5, 8, ''],
  ],
  'as-04': [
    ['u-s1', 20, null, 'NFA 4 minimises to two equivalent DFAs; I have shown both.'],
    ['u-s2', 6, null, ''],
    ['u-s3', 40, null, ''],
    ['u-s4', -9, null, 'Apologies for the late submission.'],
    ['u-s5', 26, null, ''],
    ['u-s6', 3, null, ''],
    ['u-s7', 30, null, ''],
    ['u-s9', 44, null, ''],
  ],
  'as-05': [
    ['u-s3', 150, null, ''],
  ],
  'as-06': [
    ['u-s1', 18, 8, ''],
    ['u-s2', 6, 9, ''],
    ['u-s3', 50, 10, ''],
    ['u-s4', 1, 6, ''],
    ['u-s5', 22, 9, ''],
    ['u-s6', 8, 7, ''],
    ['u-s7', 30, 8, ''],
    ['u-s8', 2, 7, ''],
    ['u-s9', 55, 10, ''],
    ['u-s10', -20, 5, ''],
  ],
  'as-08': [
    ['u-s2', 12, 20, ''],
    ['u-s3', 60, 23, ''],
    ['u-s4', 2, 15, ''],
    ['u-s5', 30, 22, ''],
    ['u-s6', 20, 18, ''],
    ['u-s7', 28, 21, ''],
    ['u-s8', 1, 14, ''],
    ['u-s9', 70, 24, ''],
  ],
  'as-10': [
    ['u-s1', 24, 18, 'Team 4 – Library Seat Booking System.'],
    ['u-s2', 24, 16, ''],
    ['u-s3', 48, 19, ''],
    ['u-s4', 24, 13, ''],
    ['u-s5', 48, 17, ''],
    ['u-s6', 12, 15, ''],
    ['u-s7', 12, 18, ''],
    ['u-s8', 2, 12, ''],
    ['u-s9', 48, 19, ''],
    ['u-s10', 2, 14, ''],
  ],
  'as-11': [
    ['u-s1', 200, null, 'Class diagram is a first version; I will update it after the team review.'],
    ['u-s9', 210, null, ''],
  ],
  'as-14': [
    ['u-s1', 20, 17, 'Team 4 – Library Seat Booking System.'],
    ['u-s2', 6, 15, ''],
    ['u-s3', 40, 19, ''],
    ['u-s4', 2, 12, ''],
    ['u-s5', 30, 18, ''],
    ['u-s6', 10, 14, ''],
    ['u-s7', 26, 16, ''],
    ['u-s8', -6, 11, ''],
    ['u-s9', 48, 18, ''],
    ['u-s10', 4, 13, ''],
  ],
  'as-16': [
    ['u-s1', 30, 9, ''], ['u-s2', 12, 8, ''], ['u-s3', 50, 10, ''], ['u-s4', 3, 7, ''], ['u-s5', 26, 9, ''],
    ['u-s6', 8, 8, ''], ['u-s7', 24, 9, ''], ['u-s8', 1, 6, ''], ['u-s9', 40, 10, ''], ['u-s10', 6, 7, ''],
  ],
  'as-17': [
    ['u-s3', 150, null, ''],
  ],
  'as-18': [
    ['u-s1', 18, 9, ''], ['u-s2', 10, 8, ''], ['u-s3', 44, 10, ''], ['u-s4', 2, 6, ''], ['u-s5', 20, 9, ''],
    ['u-s6', 9, 8, ''], ['u-s7', 30, 9, ''], ['u-s9', 50, 10, ''], ['u-s10', -8, 6, ''],
  ],
  'as-20': [
    ['u-s1', 24, 10, ''], ['u-s2', 8, 8, ''], ['u-s3', 36, 10, ''], ['u-s4', 4, 7, ''], ['u-s5', 28, 9, ''],
    ['u-s6', 12, 8, ''], ['u-s7', 20, 9, ''], ['u-s8', 2, 7, ''], ['u-s9', 46, 10, ''], ['u-s10', 3, 8, ''],
  ],
  'as-21': [
    ['u-s5', 100, null, ''], ['u-s9', 110, null, ''],
  ],
  'as-12': [
    ['u-s11', 110, null, ''],
  ],
  'as-13': [
    ['u-s11', 30, 17, ''],
    ['u-s12', 8, 14, ''],
    ['u-s13', 50, 18, ''],
  ],
};

const fileNames = {
  'as-01': 'Linear_Regression.zip',
  'as-02': 'DecisionTree_ProblemSet.pdf',
  'as-03': 'DFA_Design.pdf',
  'as-04': 'NFA_to_DFA_Solutions.pdf',
  'as-05': 'jflap_exercises.zip',
  'as-14': 'Project_Plan_WBS.pdf',
  'as-16': 'SE_Lab_Record_1-4.pdf',
  'as-17': 'UML_Class_Sequence.pdf',
  'as-18': 'OS_Lab_Programs.zip',
  'as-20': 'ML_Lab_Notebooks_1-4.zip',
  'as-21': 'kmeans_iris.ipynb',
  'as-06': 'Subnetting_Worksheet_Solved.pdf',
  'as-08': 'cpu_scheduler.zip',
  'as-10': 'SRS_Team.pdf',
  'as-11': 'UML_Diagrams.pdf',
  'as-12': 'FIR_Design_Report.pdf',
  'as-13': 'Chapter4_Solutions.pdf',
};

const submissions = [];
let n = 1;

for (const [assignmentId, rows] of Object.entries(seed)) {
  const assignment = assignments.find((x) => x.id === assignmentId);
  const due = new Date(assignment.dueDate).getTime();

  for (const [studentId, hoursBefore, marks, comment] of rows) {
    const submittedAt = new Date(due - hoursBefore * 3600 * 1000).toISOString();
    const graded = marks !== null;
    const ratio = graded ? marks / assignment.maxMarks : 0;
    const prefix = studentId.replace('u-', '').toUpperCase();

    submissions.push({
      id: `sub-${String(n++).padStart(3, '0')}`,
      assignmentId,
      studentId,
      fileName: `${prefix}_${fileNames[assignmentId]}`,
      fileSize: `${(0.2 + ((n * 37) % 30) / 10).toFixed(1)} MB`,
      comment,
      submittedAt,
      status: graded ? 'graded' : 'submitted',
      marks: graded ? marks : null,
      feedback: graded ? (ratio >= 0.85 ? FEEDBACK.high : ratio >= 0.6 ? FEEDBACK.mid : FEEDBACK.low) : '',
      gradedAt: graded ? new Date(Math.min(due + 2 * 86400000, Date.now() - 3600000)).toISOString() : null,
      gradedBy: graded ? assignment.createdBy : null,
    });
  }
}

module.exports = submissions;
