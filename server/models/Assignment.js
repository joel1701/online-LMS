const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const assignmentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    courseId: { type: String, required: true, index: true }, // -> Course.id
    title: { type: String, required: true },
    description: String,
    issueDate: String,
    dueDate: String,
    maxMarks: Number,
    attachment: { type: Schema.Types.Mixed, default: null }, // { name, size } or null
    createdBy: String, // -> User.id
    createdAt: String,
  },
  options
);

module.exports = model('Assignment', assignmentSchema);
