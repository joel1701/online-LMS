const assignments = require('../data/assignments');
const submissions = require('../data/submissions');
const tests = require('../data/tests');
const testService = require('./testService');

// Share of released coursework (assignments issued + tests opened) a student has completed,
// plus the next open item in the course.
function studentProgress(course, studentId) {
  const now = new Date();
  const released = [];

  for (const a of assignments.filter((x) => x.courseId === course.id && new Date(x.issueDate) <= now)) {
    const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId);
    released.push({ kind: 'assignment', id: a.id, title: a.title, when: a.dueDate, done: Boolean(sub), open: !sub && new Date(a.dueDate) > now });
  }
  for (const t of tests.filter((x) => x.courseId === course.id && x.status === 'published')) {
    const state = testService.studentState(t, testService.myAttempt(t, studentId));
    if (state === 'upcoming') {
      released.push({ kind: 'test', id: t.id, title: t.title, when: t.availableFrom, done: false, open: true, upcoming: true });
      continue;
    }
    released.push({ kind: 'test', id: t.id, title: t.title, when: t.availableUntil, done: state === 'completed', open: state === 'available' || state === 'in-progress' });
  }

  const countable = released.filter((r) => !r.upcoming);
  const completed = countable.filter((r) => r.done).length;
  const next = released.filter((r) => r.open).sort((a, b) => new Date(a.when) - new Date(b.when))[0] || null;

  return {
    completed,
    total: countable.length,
    percent: countable.length ? Math.round((completed / countable.length) * 100) : 0,
    next: next ? { kind: next.kind, id: next.id, title: next.title, when: next.when, upcoming: Boolean(next.upcoming) } : null,
  };
}

module.exports = { studentProgress };
