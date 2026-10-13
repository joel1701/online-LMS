const { Schema, model } = require('mongoose');
const options = require('./schemaOptions');

const departmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    headId: String, // -> User.id
  },
  options
);

module.exports = model('Department', departmentSchema);
