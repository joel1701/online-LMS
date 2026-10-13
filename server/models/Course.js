const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const courseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['theory', 'practical'], default: 'theory' },
    order: Number,
    department: String,
    semester: Number,
    term: String,
    credits: Number,
    teacherId: { type: String, index: true }, // -> User.id
    studentIds: [String], // -> User.id (enrolment)
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    weights: { assignments: Number, tests: Number },
    description: String,
    schedule: [{ _id: false, day: String, time: String, room: String }],
    syllabus: [{ _id: false, unit: Number, title: String, topics: String }],
  },
  options
);

module.exports = model('Course', courseSchema);
