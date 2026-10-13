const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    universityId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    department: String,
    semester: Number,
    program: String,
    batch: String,
    designation: String,
    office: String,
    phone: String,
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    joinedOn: String,
  },
  options
);

module.exports = model('User', userSchema);
