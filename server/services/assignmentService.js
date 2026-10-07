// TODO: Replace mockAssignmentService with a MongoDB/Mongoose Assignment model.
const assignments = require('../data/assignments');
const submissions = require('../data/submissions');
const users = require('../data/users');
const { createId } = require('../utils/ids');
const { notFound, forbidden, conflict } = require('../utils/httpError');
const { check, isBlank, isValidDate } = require('../utils/validate');
const courseService = require('./courseService');
const activity = require('./activityService');

// Status of an assignment from one student's point of view.
function studentStatus(assignment, submission) {
  if (submission && submission.status === 'graded') return 'graded';
  if (submission) return 'submitted';
  return new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending';
}

function base(assignment) {
  const course = courseService.findRaw(assignment.courseId);
  const teacher = course && users.find((u) => u.id === course.teacherId);
  return {
    ...assignment,
    courseCode: course ? course.code : '',
    courseTitle: course ? course.title : '',
    teacherName: teacher ? teacher.name : '',
    isClosed: new Date(assignment.dueDate) < new Date(),
  };
}

function forStudent(assignment, studentId) {
  const submission = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === studentId) || null;
  return { ...base(assignment), submission, status: studentStatus(assignment, submission) };
}

function forStaff(assignment) {
  const course = courseService.findRaw(assignment.courseId);
  const subs = submissions.filter((s) => s.assignmentId === assignment.id);
  return {
    ...base(assignment),
    counts: {
      enrolled: course ? course.studentIds.length : 0,
      submitted: subs.length,
      graded: subs.filter((s) => s.status === 'graded').length,
      awaitingGrading: subs.filter((s) => s.status === 'submitted').length,
    },
  };
}

function list(user, { courseId, status } = {}) {
  const allowed = new Set(courseService.accessibleCourseIds(user));
  if (courseId && !allowed.has(courseId)) throw forbidden('You do not have access to this course.');

  const now = new Date();
  const rows = assignments
    .filter((a) => allowed.has(a.courseId) && (!courseId || a.courseId === courseId))
    // Students only see an assignment from its issue date onwards.
    .filter((a) => user.role !== 'student' || new Date(a.issueDate) <= now)
    .map((a) => (user.role === 'student' ? forStudent(a, user.id) : forStaff(a)))
    .filter((a) => !status || user.role !== 'student' || a.status === status);

  return rows.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function findRaw(id) {
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) throw notFound('Assignment');
  return assignment;
}

function get(user, id) {
  const assignment = findRaw(id);
  courseService.requireAccess(user, assignment.courseId);
  if (user.role === 'student' && new Date(assignment.issueDate) > new Date()) throw notFound('Assignment');
  return user.role === 'student' ? forStudent(assignment, user.id) : forStaff(assignment);
}

function validate(data) {
  const maxMarks = Number(data.maxMarks);
  const datesOk = isValidDate(data.issueDate) && isValidDate(data.dueDate);
  check([
    ['courseId', isBlank(data.courseId) && 'Select a course.'],
    ['title', isBlank(data.title) && 'Title is required.'],
    ['title', !isBlank(data.title) && String(data.title).trim().length > 120 && 'Keep the title under 120 characters.'],
    ['description', isBlank(data.description) && 'Add instructions for students.'],
    ['issueDate', !isValidDate(data.issueDate) && 'Enter a valid issue date.'],
    ['dueDate', !isValidDate(data.dueDate) && 'Enter a valid due date.'],
    ['dueDate', datesOk && new Date(data.dueDate) <= new Date(data.issueDate) && 'Due date must be after the issue date.'],
    ['maxMarks', !(Number.isInteger(maxMarks) && maxMarks >= 1 && maxMarks <= 100) && 'Maximum marks must be a whole number from 1 to 100.'],
  ]);
  return {
    courseId: data.courseId,
    title: String(data.title).trim(),
    description: String(data.description).trim(),
    issueDate: new Date(data.issueDate).toISOString(),
    dueDate: new Date(data.dueDate).toISOString(),
    maxMarks,
    attachment: data.attachment && data.attachment.name ? { name: data.attachment.name, size: data.attachment.size || '' } : null,
  };
}

function create(user, data) {
  const clean = validate(data);
  courseService.requireManage(user, clean.courseId);
  const assignment = { id: createId('as-'), ...clean, createdBy: user.id, createdAt: new Date().toISOString() };
  assignments.push(assignment);
  activity.record(user.id, 'assignment.created', `Created ${assignment.title}`, assignment.courseId);
  return forStaff(assignment);
}

function update(user, id, data) {
  const assignment = findRaw(id);
  courseService.requireManage(user, assignment.courseId);
  const clean = validate({ ...assignment, ...data });
  if (clean.courseId !== assignment.courseId && submissions.some((s) => s.assignmentId === id)) {
    throw conflict('This assignment already has submissions, so it cannot be moved to another course.');
  }
  courseService.requireManage(user, clean.courseId);

  const highest = Math.max(0, ...submissions.filter((s) => s.assignmentId === id && s.marks !== null).map((s) => s.marks));
  if (clean.maxMarks < highest) {
    throw conflict(`A submission has already been awarded ${highest} marks. Maximum marks cannot be lower than that.`);
  }

  Object.assign(assignment, clean);
  activity.record(user.id, 'assignment.updated', `Updated ${assignment.title}`, assignment.courseId);
  return forStaff(assignment);
}

function remove(user, id) {
  const assignment = findRaw(id);
  courseService.requireManage(user, assignment.courseId);
  for (let i = submissions.length - 1; i >= 0; i -= 1) {
    if (submissions[i].assignmentId === id) submissions.splice(i, 1);
  }
  assignments.splice(assignments.indexOf(assignment), 1);
  activity.record(user.id, 'assignment.deleted', `Deleted ${assignment.title}`, assignment.courseId);
}

module.exports = { studentStatus, list, get, findRaw, create, update, remove };
