// Grades are computed from submissions and test attempts rather than stored.
// TODO: When MongoDB is added, either keep computing them here from the
// Submission/TestAttempt collections or cache results in a `grades` collection.
const courses = require('../data/courses');
const assignments = require('../data/assignments');
const submissions = require('../data/submissions');
const tests = require('../data/tests');
const users = require('../data/users');
const { forbidden, notFound } = require('../utils/httpError');
const courseService = require('./courseService');
const testService = require('./testService');

// Westmere uses a 10-point letter scale.
const SCALE = [
  [90, 'O', 10],
  [80, 'A+', 9],
  [70, 'A', 8],
  [60, 'B+', 7],
  [50, 'B', 6],
  [45, 'C', 5],
  [40, 'P', 4],
  [0, 'F', 0],
];

function letterFor(percent) {
  if (percent === null) return { letter: '—', points: null };
  const [, letter, points] = SCALE.find(([min]) => percent >= min);
  return { letter, points };
}

const round1 = (n) => Math.round(n * 10) / 10;
const pct = (earned, max) => (max > 0 ? round1((earned / max) * 100) : null);

function assignmentItems(course, studentId) {
  return assignments
    .filter((a) => a.courseId === course.id)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId);
      const overdue = new Date(a.dueDate) < new Date();
      let state = 'pending';
      if (sub && sub.status === 'graded') state = 'graded';
      else if (sub) state = 'submitted';
      else if (overdue) state = 'missing';
      return {
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        maxMarks: a.maxMarks,
        marks: state === 'graded' ? sub.marks : state === 'missing' ? 0 : null,
        state,
        counts: state === 'graded' || state === 'missing',
      };
    });
}

function testItems(course, studentId) {
  return tests
    .filter((t) => t.courseId === course.id && t.status === 'published')
    .sort((a, b) => new Date(a.availableFrom) - new Date(b.availableFrom))
    .map((t) => {
      const attempt = testService.myAttempt(t, studentId);
      const state = testService.studentState(t, attempt);
      const max = t.questions.reduce((s, q) => s + q.marks, 0);
      return {
        id: t.id,
        title: t.title,
        date: t.availableFrom,
        maxMarks: max,
        marks: state === 'completed' ? attempt.score : state === 'missed' ? 0 : null,
        state,
        counts: state === 'completed' || state === 'missed',
      };
    });
}

function courseGrade(course, studentId) {
  const aItems = assignmentItems(course, studentId);
  const tItems = testItems(course, studentId);

  const sum = (items, key) => items.filter((i) => i.counts).reduce((s, i) => s + i[key], 0);
  const assignmentPct = pct(sum(aItems, 'marks'), sum(aItems, 'maxMarks'));
  const testPct = pct(sum(tItems, 'marks'), sum(tItems, 'maxMarks'));

  const parts = [];
  if (assignmentPct !== null) parts.push([assignmentPct, course.weights.assignments]);
  if (testPct !== null) parts.push([testPct, course.weights.tests]);
  const weightTotal = parts.reduce((s, [, w]) => s + w, 0);
  const total = parts.length ? round1(parts.reduce((s, [p, w]) => s + p * w, 0) / weightTotal) : null;
  const { letter, points } = letterFor(total);

  const missing = aItems.filter((i) => i.state === 'missing').length + tItems.filter((i) => i.state === 'missed').length;
  let standing = 'No graded work yet';
  if (total !== null) standing = total < 50 ? 'At risk' : total >= 75 ? 'Good standing' : 'Satisfactory';

  const teacher = users.find((u) => u.id === course.teacherId);
  return {
    courseId: course.id,
    code: course.code,
    title: course.title,
    term: course.term,
    semester: course.semester,
    credits: course.credits,
    teacherName: teacher ? teacher.name : '',
    weights: course.weights,
    assignments: aItems,
    tests: tItems,
    assignmentPct,
    testPct,
    total,
    letter,
    points,
    standing,
    missing,
  };
}

function forStudent(user, { studentId, courseId, term } = {}) {
  const targetId = user.role === 'student' ? user.id : studentId;
  if (!targetId) throw notFound('Student');
  const student = users.find((u) => u.id === targetId && u.role === 'student');
  if (!student) throw notFound('Student');

  const rows = courses
    .filter((c) => c.studentIds.includes(targetId))
    .filter((c) => !courseId || c.id === courseId)
    .filter((c) => !term || c.term === term)
    .filter((c) => user.role !== 'teacher' || c.teacherId === user.id)
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((c) => courseGrade(c, targetId));

  if (user.role === 'teacher' && rows.length === 0) throw forbidden('This student is not enrolled in any of your courses.');

  const graded = rows.filter((r) => r.points !== null);
  const credits = graded.reduce((s, r) => s + r.credits, 0);
  const sgpa = credits ? Math.round((graded.reduce((s, r) => s + r.points * r.credits, 0) / credits) * 100) / 100 : null;

  return { studentId: targetId, rows, sgpa, terms: [...new Set(courses.filter((c) => c.studentIds.includes(targetId)).map((c) => c.term))] };
}

function coursePerformance(user, courseId) {
  const course = courseService.requireManage(user, courseId);
  const courseAssignments = assignments
    .filter((a) => a.courseId === courseId)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map(({ id, title, maxMarks, dueDate }) => ({ id, title, maxMarks, dueDate }));
  const courseTests = tests
    .filter((t) => t.courseId === courseId && t.status === 'published')
    .sort((a, b) => new Date(a.availableFrom) - new Date(b.availableFrom))
    .map((t) => ({ id: t.id, title: t.title, maxMarks: t.questions.reduce((s, q) => s + q.marks, 0), date: t.availableFrom }));

  const rows = course.studentIds
    .map((sid) => users.find((u) => u.id === sid))
    .filter(Boolean)
    .map((student) => {
      const g = courseGrade(course, student.id);
      return {
        student: { id: student.id, name: student.name, universityId: student.universityId, status: student.status },
        assignments: g.assignments.map(({ id, marks, state }) => ({ id, marks, state })),
        tests: g.tests.map(({ id, marks, state }) => ({ id, marks, state })),
        assignmentPct: g.assignmentPct,
        testPct: g.testPct,
        total: g.total,
        letter: g.letter,
        standing: g.standing,
        missing: g.missing,
      };
    })
    .sort((a, b) => a.student.universityId.localeCompare(b.student.universityId));

  const totals = rows.map((r) => r.total).filter((t) => t !== null);
  const distribution = SCALE.map(([, letter]) => ({ letter, count: rows.filter((r) => r.letter === letter).length }));

  return {
    course: courseService.summary(course),
    assignments: courseAssignments,
    tests: courseTests,
    rows,
    averageTotal: totals.length ? round1(totals.reduce((s, t) => s + t, 0) / totals.length) : null,
    atRisk: rows.filter((r) => r.standing === 'At risk').length,
    distribution,
  };
}

module.exports = { courseGrade, forStudent, coursePerformance, letterFor };
