const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const materialSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    courseId: { type: String, required: true, index: true }, // -> Course.id
    week: Number,
    title: String,
    type: { type: String, enum: ['pdf', 'slides', 'notes', 'video', 'link'] },
    description: String,
    fileName: String,
    fileSize: String,
    url: String,
    uploadedAt: String,
    uploadedBy: String, // -> User.id
  },
  options
);

module.exports = model('Material', materialSchema);
