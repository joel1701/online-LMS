// Scores an MCQ attempt. `answers` maps questionId -> selected option index.
function scoreAttempt(test, answers = {}) {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const q of test.questions) {
    const selected = answers[q.id];
    if (selected === undefined || selected === null) {
      unansweredCount += 1;
    } else if (Number(selected) === q.correctIndex) {
      correctCount += 1;
      score += q.marks;
    } else {
      incorrectCount += 1;
    }
  }

  return { score, totalMarks: totalMarks(test), correctCount, incorrectCount, unansweredCount };
}

function totalMarks(test) {
  return test.questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
}

module.exports = { scoreAttempt, totalMarks };
