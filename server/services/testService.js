// TODO: Replace mockTestService with MongoDB/Mongoose Test and TestAttempt models.
const tests = require('../data/tests');
const attempts = require('../data/testAttempts');
const users = require('../data/users');
const { createId } = require('../utils/ids');
const { notFound, forbidden, conflict } = require('../utils/httpError');
const { check, isBlank, isValidDate } = require('../utils/validate');
const { scoreAttempt, totalMarks } = require('../utils/scoring');
const courseService = require('./courseService');
const activity = require('./activityService');

const GRACE_MS = 30 * 1000;

function findRaw(id) {
  const test = tests.find((t) => t.id === id);
  if (!test) throw notFound('Test');
  return test;
}

function attemptDeadline(test, attempt) {
  const byDuration = new Date(attempt.startedAt).getTime() + test.durationMinutes * 60000;
  return new Date(Math.min(byDuration, new Date(test.availableUntil).getTime())).toISOString();
}

// upcoming | available | in-progress | completed | missed
function studentState(test, attempt) {
  const now = Date.now();
  if (attempt && attempt.status === 'submitted') return 'completed';
  if (attempt && attempt.status === 'in-progress') {
    return new Date(attemptDeadline(test, attempt)).getTime() + GRACE_MS > now ? 'in-progress' : 'completed';
  }
  if (now < new Date(test.availableFrom).getTime()) return 'upcoming';
  if (now <= new Date(test.availableUntil).getTime()) return 'available';
  return 'missed';
}

function base(test) {
  const course = courseService.findRaw(test.courseId);
  return {
    id: test.id,
    courseId: test.courseId,
    courseCode: course ? course.code : '',
    courseTitle: course ? course.title : '',
    title: test.title,
    instructions: test.instructions,
    durationMinutes: test.durationMinutes,
    availableFrom: test.availableFrom,
    availableUntil: test.availableUntil,
    status: test.status,
    showAnswers: test.showAnswers,
    questionCount: test.questions.length,
    totalMarks: totalMarks(test),
  };
}

function attemptSummary(attempt) {
  if (!attempt) return null;
  const { answers, ...rest } = attempt;
  return rest;
}

// An in-progress attempt whose time ran out is closed and scored with whatever was saved.
function closeExpired(test, attempt) {
  if (attempt && attempt.status === 'in-progress' && Date.now() > new Date(attemptDeadline(test, attempt)).getTime() + GRACE_MS) {
    Object.assign(attempt, { status: 'submitted', submittedAt: attemptDeadline(test, attempt), ...scoreAttempt(test, attempt.answers) });
  }
  return attempt;
}

function myAttempt(test, studentId) {
  return closeExpired(test, attempts.find((a) => a.testId === test.id && a.studentId === studentId));
}

function forStudent(test, studentId) {
  const attempt = myAttempt(test, studentId);
  return { ...base(test), state: studentState(test, attempt), attempt: attemptSummary(attempt) };
}

function forStaff(test) {
  const course = courseService.findRaw(test.courseId);
  const done = attempts.filter((a) => a.testId === test.id && a.status === 'submitted');
  const avg = done.length ? done.reduce((s, a) => s + a.score, 0) / done.length : null;
  return {
    ...base(test),
    questions: test.questions,
    createdBy: test.createdBy,
    stats: {
      enrolled: course ? course.studentIds.length : 0,
      attempted: done.length,
      averageScore: avg === null ? null : Math.round(avg * 10) / 10,
    },
  };
}

function list(user, { courseId } = {}) {
  const allowed = new Set(courseService.accessibleCourseIds(user));
  if (courseId && !allowed.has(courseId)) throw forbidden('You do not have access to this course.');

  return tests
    .filter((t) => allowed.has(t.courseId) && (!courseId || t.courseId === courseId))
    .filter((t) => user.role !== 'student' || t.status === 'published')
    .map((t) => (user.role === 'student' ? forStudent(t, user.id) : forStaff(t)))
    .sort((a, b) => new Date(a.availableFrom) - new Date(b.availableFrom));
}

function get(user, id) {
  const test = findRaw(id);
  courseService.requireAccess(user, test.courseId);
  if (user.role === 'student') {
    if (test.status !== 'published') throw notFound('Test');
    return forStudent(test, user.id);
  }
  return forStaff(test);
}

function validate(data) {
  const duration = Number(data.durationMinutes);
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const datesOk = isValidDate(data.availableFrom) && isValidDate(data.availableUntil);
  const publishing = data.status === 'published';

  const questionErrors = {};
  questions.forEach((q, i) => {
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o || '').trim()) : [];
    const marks = Number(q.marks);
    const ci = q.correctIndex;
    let msg = null;
    if (isBlank(q.text)) msg = 'Question text is required.';
    else if (options.length < 2 || options.some((o) => !o)) msg = 'Every option must have text (at least two options).';
    else if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) msg = 'Options must be different from each other.';
    else if (ci === null || ci === undefined || ci === '' || Number(ci) < 0 || Number(ci) >= options.length) msg = 'Select the correct answer.';
    else if (!(marks > 0 && marks <= 20)) msg = 'Marks must be between 0.5 and 20.';
    if (msg) questionErrors[`questions.${i}`] = msg;
  });

  check([
    ['courseId', isBlank(data.courseId) && 'Select a course.'],
    ['title', isBlank(data.title) && 'Title is required.'],
    ['durationMinutes', !(Number.isInteger(duration) && duration >= 5 && duration <= 180) && 'Duration must be between 5 and 180 minutes.'],
    ['availableFrom', !isValidDate(data.availableFrom) && 'Enter when the test opens.'],
    ['availableUntil', !isValidDate(data.availableUntil) && 'Enter when the test closes.'],
    ['availableUntil', datesOk && new Date(data.availableUntil) <= new Date(data.availableFrom) && 'Closing time must be after the opening time.'],
    ['availableUntil', datesOk && (new Date(data.availableUntil) - new Date(data.availableFrom)) < duration * 60000 && 'The availability window is shorter than the test duration.'],
    ['status', !['draft', 'published'].includes(data.status) && 'Invalid status.'],
    ['questions', publishing && questions.length === 0 && 'Add at least one question before publishing.'],
    ...Object.entries(questionErrors),
  ]);

  return {
    courseId: data.courseId,
    title: String(data.title).trim(),
    instructions: String(data.instructions || '').trim(),
    durationMinutes: duration,
    availableFrom: new Date(data.availableFrom).toISOString(),
    availableUntil: new Date(data.availableUntil).toISOString(),
    status: data.status,
    showAnswers: Boolean(data.showAnswers),
    questions: questions.map((q) => ({
      id: q.id && String(q.id).startsWith('q-') ? q.id : createId('q-'),
      text: String(q.text).trim(),
      options: q.options.map((o) => String(o).trim()),
      correctIndex: Number(q.correctIndex),
      marks: Number(q.marks),
    })),
  };
}

function create(user, data) {
  const clean = validate(data);
  courseService.requireManage(user, clean.courseId);
  const test = { id: createId('t-'), ...clean, createdBy: user.id, createdAt: new Date().toISOString() };
  tests.push(test);
  activity.record(user.id, test.status === 'published' ? 'test.published' : 'test.created', `${test.status === 'published' ? 'Published' : 'Created draft'} ${test.title}`, test.courseId);
  return forStaff(test);
}

function update(user, id, data) {
  const test = findRaw(id);
  courseService.requireManage(user, test.courseId);
  const clean = validate({ ...test, ...data });
  courseService.requireManage(user, clean.courseId);

  const hasAttempts = attempts.some((a) => a.testId === id);
  if (hasAttempts) {
    const strip = (qs) => JSON.stringify(qs.map(({ text, options, correctIndex, marks }) => ({ text, options, correctIndex, marks })));
    if (strip(clean.questions) !== strip(test.questions)) {
      throw conflict('Students have already attempted this test, so its questions can no longer be changed.');
    }
    if (clean.status === 'draft') throw conflict('A test that students have attempted cannot be moved back to draft.');
    clean.questions = test.questions;
  }

  const publishedNow = test.status !== 'published' && clean.status === 'published';
  Object.assign(test, clean);
  activity.record(user.id, publishedNow ? 'test.published' : 'test.updated', `${publishedNow ? 'Published' : 'Updated'} ${test.title}`, test.courseId);
  return forStaff(test);
}

function remove(user, id) {
  const test = findRaw(id);
  courseService.requireManage(user, test.courseId);
  for (let i = attempts.length - 1; i >= 0; i -= 1) {
    if (attempts[i].testId === id) attempts.splice(i, 1);
  }
  tests.splice(tests.indexOf(test), 1);
  activity.record(user.id, 'test.deleted', `Deleted ${test.title}`, test.courseId);
}

function questionsForStudent(test) {
  return test.questions.map(({ id, text, options, marks }) => ({ id, text, options, marks }));
}

function start(user, id) {
  if (user.role !== 'student') throw forbidden('Only students can take tests.');
  const test = findRaw(id);
  courseService.requireAccess(user, test.courseId);
  if (test.status !== 'published') throw notFound('Test');

  let attempt = myAttempt(test, user.id);
  const state = studentState(test, attempt);
  if (state === 'completed') throw conflict('You have already submitted this test.');
  if (state === 'upcoming') throw conflict('This test has not opened yet.');
  if (state === 'missed') throw conflict('This test is closed.');

  if (!attempt) {
    attempt = {
      id: createId('att-'),
      testId: test.id,
      studentId: user.id,
      answers: {},
      startedAt: new Date().toISOString(),
      submittedAt: null,
      status: 'in-progress',
    };
    attempts.push(attempt);
  }

  return {
    test: { ...base(test), questions: questionsForStudent(test) },
    attempt: { id: attempt.id, startedAt: attempt.startedAt, deadline: attemptDeadline(test, attempt), answers: attempt.answers },
    serverTime: new Date().toISOString(),
  };
}

function cleanAnswers(test, answers) {
  const clean = {};
  for (const q of test.questions) {
    const value = answers ? answers[q.id] : undefined;
    if (value !== undefined && value !== null && Number(value) >= 0 && Number(value) < q.options.length) {
      clean[q.id] = Number(value);
    }
  }
  return clean;
}

// Saves answers mid-attempt so a page refresh does not lose work.
function saveProgress(user, id, answers) {
  const test = findRaw(id);
  const attempt = attempts.find((a) => a.testId === id && a.studentId === user.id);
  if (!attempt || attempt.status !== 'in-progress') throw conflict('There is no test in progress.');
  if (Date.now() > new Date(attemptDeadline(test, attempt)).getTime() + GRACE_MS) throw conflict('Time is up for this test.');
  attempt.answers = cleanAnswers(test, answers);
  return { saved: Object.keys(attempt.answers).length };
}

function submit(user, id, answers) {
  if (user.role !== 'student') throw forbidden('Only students can submit tests.');
  const test = findRaw(id);
  courseService.requireAccess(user, test.courseId);

  const attempt = attempts.find((a) => a.testId === id && a.studentId === user.id);
  if (!attempt) throw conflict('Start the test before submitting.');
  if (attempt.status === 'submitted') throw conflict('You have already submitted this test.');

  const late = Date.now() > new Date(attemptDeadline(test, attempt)).getTime() + GRACE_MS;
  // After the deadline only the answers already saved on the server count.
  const finalAnswers = late ? attempt.answers : cleanAnswers(test, answers);

  Object.assign(attempt, {
    answers: finalAnswers,
    status: 'submitted',
    submittedAt: late ? attemptDeadline(test, attempt) : new Date().toISOString(),
    ...scoreAttempt(test, finalAnswers),
  });
  return result(user, id);
}

function result(user, id) {
  const test = findRaw(id);
  courseService.requireAccess(user, test.courseId);
  const attempt = myAttempt(test, user.id);
  if (!attempt || attempt.status !== 'submitted') throw notFound('Result');

  const review = test.showAnswers
    ? test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        marks: q.marks,
        selectedIndex: attempt.answers[q.id] ?? null,
        correctIndex: q.correctIndex,
      }))
    : null;

  return { test: base(test), attempt: attemptSummary(attempt), review };
}

function results(user, id) {
  const test = findRaw(id);
  const course = courseService.requireManage(user, test.courseId);

  const rows = course.studentIds
    .map((sid) => users.find((u) => u.id === sid))
    .filter(Boolean)
    .map((student) => {
      const attempt = closeExpired(test, attempts.find((a) => a.testId === id && a.studentId === student.id));
      return {
        student: { id: student.id, name: student.name, universityId: student.universityId },
        state: studentState(test, attempt),
        attempt: attemptSummary(attempt),
      };
    })
    .sort((a, b) => a.student.universityId.localeCompare(b.student.universityId));

  const perQuestion = test.questions.map((q) => {
    const answered = attempts.filter((a) => a.testId === id && a.status === 'submitted');
    const correct = answered.filter((a) => a.answers[q.id] === q.correctIndex).length;
    return { id: q.id, text: q.text, correct, attempted: answered.length };
  });

  return { test: forStaff(test), rows, perQuestion };
}

module.exports = { findRaw, studentState, myAttempt, list, get, create, update, remove, start, saveProgress, submit, result, results };
