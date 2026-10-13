const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const testAttemptSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    testId: { type: String, required: true }, // -> Test.id
    studentId: { type: String, required: true }, // -> User.id
    answers: { type: Schema.Types.Mixed, default: {} }, // { questionId: optionIndex }
    startedAt: String,
    submittedAt: { type: String, default: null },
    status: { type: String, enum: ['in-progress', 'submitted'] },
    score: Number,
    totalMarks: Number,
    correctCount: Number,
    incorrectCount: Number,
    unansweredCount: Number,
  },
  options
);

// One attempt per student per test.
testAttemptSchema.index({ testId: 1, studentId: 1 }, { unique: true });

module.exports = model('TestAttempt', testAttemptSchema);
