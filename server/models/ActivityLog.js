const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const activityLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    actorId: String, // -> User.id
    action: String,
    detail: String,
    courseId: { type: String, default: null }, // -> Course.id
    at: String,
  },
  options
);

module.exports = model('ActivityLog', activityLogSchema, 'activitylogs');
