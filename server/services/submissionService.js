// TODO: Replace mockSubmissionService with a MongoDB/Mongoose Submission model.
const submissions = require('../data/submissions');
const users = require('../data/users');
const { createId } = require('../utils/ids');
const { notFound, forbidden, conflict, badRequest } = require('../utils/httpError');
const { check, isBlank } = require('../utils/validate');
const courseService = require('./courseService');
const assignmentService = require('./assignmentService');
const activity = require('./activityService');

function isLate(submission, assignment) {
  return new Date(submission.submittedAt) > new Date(assignment.dueDate);
}

// Teacher view: one row per enrolled student, including students who have not submitted.
function rosterForAssignment(user, assignmentId) {
  const assignment = assignmentService.findRaw(assignmentId);
  const course = courseService.requireManage(user, assignment.courseId);

  return course.studentIds
    .map((sid) => users.find((u) => u.id === sid))
    .filter(Boolean)
    .map((student) => {
      const submission = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === student.id) || null;
      return {
        student: { id: student.id, name: student.name, universityId: student.universityId },
        submission: submission ? { ...submission, late: isLate(submission, assignment) } : null,
        status: assignmentService.studentStatus(assignment, submission),
      };
    })
    .sort((a, b) => a.student.universityId.localeCompare(b.student.universityId));
}

function listMine(user) {
  return submissions.filter((s) => s.studentId === user.id);
}

function submit(user, data) {
  if (user.role !== 'student') throw forbidden('Only students can submit assignments.');
  const assignment = assignmentService.findRaw(data.assignmentId);
  courseService.requireAccess(user, assignment.courseId);

  check([
    ['fileName', isBlank(data.fileName) && 'Attach your work before submitting.'],
    ['comment', String(data.comment || '').length > 1000 && 'Keep the comment under 1000 characters.'],
  ]);

  if (new Date(assignment.issueDate) > new Date()) throw notFound('Assignment');
  if (new Date(assignment.dueDate) < new Date()) {
    throw conflict('The deadline for this assignment has passed. Contact your instructor if you need an extension.');
  }

  let submission = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === user.id);
  if (submission && submission.status === 'graded') {
    throw conflict('This submission has already been graded and can no longer be changed.');
  }

  const now = new Date().toISOString();
  if (submission) {
    Object.assign(submission, {
      fileName: String(data.fileName).trim(),
      fileSize: data.fileSize || '',
      comment: String(data.comment || '').trim(),
      submittedAt: now,
    });
  } else {
    submission = {
      id: createId('sub-'),
      assignmentId: assignment.id,
      studentId: user.id,
      fileName: String(data.fileName).trim(),
      fileSize: data.fileSize || '',
      comment: String(data.comment || '').trim(),
      submittedAt: now,
      status: 'submitted',
      marks: null,
      feedback: '',
      gradedAt: null,
      gradedBy: null,
    };
    submissions.push(submission);
  }
  return submission;
}

function grade(user, id, data) {
  const submission = submissions.find((s) => s.id === id);
  if (!submission) throw notFound('Submission');
  const assignment = assignmentService.findRaw(submission.assignmentId);
  courseService.requireManage(user, assignment.courseId);

  const raw = data.marks;
  const marks = Number(raw);
  if (raw === '' || raw === null || raw === undefined || Number.isNaN(marks)) {
    throw badRequest('Please correct the highlighted fields.', { marks: 'Enter marks.' });
  }
  check([
    ['marks', marks < 0 && 'Marks cannot be negative.'],
    ['marks', marks > assignment.maxMarks && `Marks cannot exceed the maximum of ${assignment.maxMarks}.`],
    ['marks', Math.round(marks * 2) !== marks * 2 && 'Use whole or half marks only.'],
    ['feedback', String(data.feedback || '').length > 1000 && 'Keep feedback under 1000 characters.'],
  ]);

  const wasGraded = submission.status === 'graded';
  Object.assign(submission, {
    marks,
    feedback: String(data.feedback || '').trim(),
    status: 'graded',
    gradedAt: new Date().toISOString(),
    gradedBy: user.id,
  });

  const student = users.find((u) => u.id === submission.studentId);
  activity.record(
    user.id,
    wasGraded ? 'submission.regraded' : 'submission.graded',
    `${wasGraded ? 'Updated grade for' : 'Graded'} ${student ? student.name : 'a student'} – ${assignment.title} (${marks}/${assignment.maxMarks})`,
    assignment.courseId
  );
  return { ...submission, late: isLate(submission, assignment) };
}

module.exports = { rosterForAssignment, listMine, submit, grade };
