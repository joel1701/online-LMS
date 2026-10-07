// TODO: Replace mockCourseService with a MongoDB/Mongoose Course model.
const courses = require('../data/courses');
const users = require('../data/users');
const departments = require('../data/departments');
const materials = require('../data/materials');
const assignments = require('../data/assignments');
const submissions = require('../data/submissions');
const tests = require('../data/tests');
const attempts = require('../data/testAttempts');
const announcements = require('../data/announcements');
const { createId } = require('../utils/ids');
const { notFound, forbidden, conflict } = require('../utils/httpError');
const { check, isBlank } = require('../utils/validate');
const activity = require('./activityService');

function findRaw(id) {
  return courses.find((c) => c.id === id);
}

function canAccess(user, course) {
  if (!course) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') return course.teacherId === user.id;
  return course.studentIds.includes(user.id);
}

function canManage(user, course) {
  return !!course && (user.role === 'admin' || (user.role === 'teacher' && course.teacherId === user.id));
}

// Throws unless the user may view the course; returns the raw course.
function requireAccess(user, courseId) {
  const course = findRaw(courseId);
  if (!course) throw notFound('Course');
  if (!canAccess(user, course)) throw forbidden('You are not enrolled in or assigned to this course.');
  return course;
}

function requireManage(user, courseId) {
  const course = findRaw(courseId);
  if (!course) throw notFound('Course');
  if (!canManage(user, course)) throw forbidden('Only the course instructor or an administrator can change this course.');
  return course;
}

function accessibleCourseIds(user) {
  return courses.filter((c) => canAccess(user, c)).map((c) => c.id);
}

function summary(course) {
  const teacher = users.find((u) => u.id === course.teacherId);
  const dept = departments.find((d) => d.code === course.department);
  const { studentIds, ...rest } = course;
  return {
    ...rest,
    departmentName: dept ? dept.name : course.department,
    teacher: teacher ? { id: teacher.id, name: teacher.name, email: teacher.email, office: teacher.office || '' } : null,
    studentCount: studentIds.length,
  };
}

function list(user, { search, status, department } = {}) {
  const term = String(search || '').trim().toLowerCase();
  return courses
    .filter((c) => canAccess(user, c))
    .filter((c) => user.role !== 'student' || c.status === 'active')
    .filter((c) => !status || c.status === status)
    .filter((c) => !department || c.department === department)
    .filter((c) => {
      if (!term) return true;
      const teacher = users.find((u) => u.id === c.teacherId);
      return [c.code, c.title, teacher && teacher.name].some((v) => v && v.toLowerCase().includes(term));
    })
    .sort((a, b) => a.code.localeCompare(b.code))
    .map(summary);
}

function getForUser(user, id) {
  const course = requireAccess(user, id);
  const result = summary(course);
  if (user.role !== 'student') {
    result.students = course.studentIds
      .map((sid) => users.find((u) => u.id === sid))
      .filter(Boolean)
      .map(({ id: sid, name, universityId, email, status, semester }) => ({ id: sid, name, universityId, email, status, semester }))
      .sort((a, b) => a.universityId.localeCompare(b.universityId));
  }
  return result;
}

function validateCourse(data, existingId) {
  const code = String(data.code || '').trim().toUpperCase();
  const semester = Number(data.semester);
  const credits = Number(data.credits);
  const teacher = users.find((u) => u.id === data.teacherId);

  check([
    ['code', isBlank(code) && 'Course code is required.'],
    ['code', !isBlank(code) && !/^[A-Z]{2,4}\d{3}$/.test(code) && 'Use a code such as CS305 (2–4 letters followed by 3 digits).'],
    ['code', courses.some((c) => c.id !== existingId && c.code === code && c.status === 'active') && 'An active course with this code already exists.'],
    ['title', isBlank(data.title) && 'Course title is required.'],
    ['department', !departments.some((d) => d.code === data.department && d.code !== 'ADMIN') && 'Select an academic department.'],
    ['semester', !(Number.isInteger(semester) && semester >= 1 && semester <= 8) && 'Semester must be a whole number from 1 to 8.'],
    ['credits', !(Number.isInteger(credits) && credits >= 1 && credits <= 6) && 'Credits must be a whole number from 1 to 6.'],
    ['teacherId', (!teacher || teacher.role !== 'teacher') && 'Assign a teacher.'],
    ['teacherId', teacher && teacher.role === 'teacher' && teacher.status !== 'active' && 'This teacher account is disabled.'],
    ['status', data.status && !['active', 'archived'].includes(data.status) && 'Invalid status.'],
  ]);

  return {
    code,
    title: String(data.title).trim(),
    department: data.department,
    semester,
    credits,
    teacherId: data.teacherId,
    description: String(data.description || '').trim(),
    status: data.status || 'active',
  };
}

function create(data, actor) {
  const clean = validateCourse(data);
  // New courses enrol every active student of the same department and semester.
  const studentIds = users
    .filter((u) => u.role === 'student' && u.status === 'active' && u.department === clean.department && u.semester === clean.semester)
    .map((u) => u.id);

  const course = {
    id: createId('c-'),
    ...clean,
    term: courses.TERM,
    studentIds,
    weights: { assignments: 40, tests: 60 },
    schedule: [],
    syllabus: [],
  };
  courses.push(course);
  activity.record(actor.id, 'course.created', `Created ${course.code} ${course.title}`, course.id);
  return summary(course);
}

function update(id, data, actor) {
  const course = findRaw(id);
  if (!course) throw notFound('Course');
  const clean = validateCourse({ ...course, ...data }, id);
  const archivedNow = course.status !== clean.status;
  Object.assign(course, clean);
  activity.record(
    actor.id,
    archivedNow ? `course.${course.status === 'archived' ? 'archived' : 'restored'}` : 'course.updated',
    `${archivedNow ? (course.status === 'archived' ? 'Archived' : 'Restored') : 'Updated'} ${course.code} ${course.title}`,
    course.id
  );
  return summary(course);
}

function removeWhere(array, predicate) {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    if (predicate(array[i])) array.splice(i, 1);
  }
}

function remove(id, actor) {
  const course = findRaw(id);
  if (!course) throw notFound('Course');
  if (course.status === 'active' && course.studentIds.length > 0) {
    throw conflict('This course has enrolled students. Archive it instead, or remove it after the term ends.');
  }

  const assignmentIds = new Set(assignments.filter((a) => a.courseId === id).map((a) => a.id));
  const testIds = new Set(tests.filter((t) => t.courseId === id).map((t) => t.id));
  removeWhere(submissions, (s) => assignmentIds.has(s.assignmentId));
  removeWhere(attempts, (a) => testIds.has(a.testId));
  removeWhere(assignments, (a) => a.courseId === id);
  removeWhere(tests, (t) => t.courseId === id);
  removeWhere(materials, (m) => m.courseId === id);
  removeWhere(announcements, (a) => a.courseId === id);
  removeWhere(courses, (c) => c.id === id);

  activity.record(actor.id, 'course.deleted', `Deleted ${course.code} ${course.title}`);
}

module.exports = {
  findRaw,
  canAccess,
  canManage,
  requireAccess,
  requireManage,
  accessibleCourseIds,
  summary,
  list,
  getForUser,
  create,
  update,
  remove,
};
