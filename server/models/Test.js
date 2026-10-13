const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const questionSchema = new Schema(
  {
    id: String,
    text: String,
    options: [String],
    correctIndex: Number,
    marks: Number,
  },
  { _id: false }
);

const testSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    courseId: { type: String, required: true, index: true }, // -> Course.id
    title: { type: String, required: true },
    instructions: String,
    durationMinutes: Number,
    availableFrom: String,
    availableUntil: String,
    status: { type: String, enum: ['draft', 'published'] },
    showAnswers: Boolean,
    createdBy: String, // -> User.id
    createdAt: String,
    questions: [questionSchema], // embedded
  },
  options
);

module.exports = model('Test', testSchema);
