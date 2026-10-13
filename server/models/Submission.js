const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const submissionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    assignmentId: { type: String, required: true }, // -> Assignment.id
    studentId: { type: String, required: true }, // -> User.id
    fileName: String,
    fileSize: String,
    comment: String,
    submittedAt: String,
    status: { type: String, enum: ['submitted', 'graded'] },
    marks: { type: Number, default: null },
    feedback: String,
    gradedAt: { type: String, default: null },
    gradedBy: { type: String, default: null }, // -> User.id
  },
  options
);

// One submission per student per assignment.
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = model('Submission', submissionSchema);
