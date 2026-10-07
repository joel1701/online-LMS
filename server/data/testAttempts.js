// TODO: Replace with the `testAttempts` collection (testId -> tests, studentId -> users).
const tests = require('./tests');
const { scoreAttempt } = require('../utils/scoring');

// One character per question: c = correct, w = wrong, - = left unanswered.
const seed = {
  't-01': {
    'u-s1': 'cccwc', 'u-s2': 'ccccw', 'u-s3': 'ccccc', 'u-s4': 'wcwwc',
    'u-s5': 'ccccc', 'u-s6': 'cwccc', 'u-s7': 'cccwc', 'u-s9': 'ccccc', 'u-s10': 'wccw-',
  },
  't-03': {
    'u-s1': 'ccccw', 'u-s2': 'cwccw', 'u-s3': 'ccccc', 'u-s4': 'cwcww',
    'u-s5': 'ccccc', 'u-s6': 'cccww', 'u-s7': 'cwccc', 'u-s8': 'wwccw',
    'u-s9': 'ccccc', 'u-s10': 'cwc-w',
  },
  't-09': {
    'u-s1': 'ccccw', 'u-s2': 'cwccc', 'u-s3': 'ccccc', 'u-s4': 'cwwcc',
    'u-s5': 'ccccc', 'u-s6': 'ccwcc', 'u-s7': 'ccccw', 'u-s8': 'wcwcc',
    'u-s9': 'ccccc', 'u-s10': 'cww-c',
  },
  't-08': {
    'u-s11': 'cccw', 'u-s12': 'cwcw', 'u-s13': 'cccc',
  },
};

const attempts = [];
let n = 1;

for (const [testId, byStudent] of Object.entries(seed)) {
  const test = tests.find((t) => t.id === testId);
  const start = new Date(test.availableFrom).getTime();

  for (const [studentId, pattern] of Object.entries(byStudent)) {
    const answers = {};
    test.questions.forEach((question, i) => {
      if (pattern[i] === 'c') answers[question.id] = question.correctIndex;
      if (pattern[i] === 'w') answers[question.id] = (question.correctIndex + 1) % question.options.length;
    });

    const startedAt = new Date(start + n * 7 * 60000);
    const submittedAt = new Date(startedAt.getTime() + (test.durationMinutes - 3) * 60000);

    attempts.push({
      id: `att-${String(n++).padStart(3, '0')}`,
      testId,
      studentId,
      answers,
      startedAt: startedAt.toISOString(),
      submittedAt: submittedAt.toISOString(),
      status: 'submitted',
      ...scoreAttempt(test, answers),
    });
  }
}

module.exports = attempts;
