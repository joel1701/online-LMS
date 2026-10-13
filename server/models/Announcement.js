const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const announcementSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    courseId: { type: String, default: null }, // -> Course.id, null = university-wide notice
    title: String,
    body: String,
    postedBy: String, // -> User.id
    postedAt: String,
  },
  options
);

module.exports = model('Announcement', announcementSchema);
