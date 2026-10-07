const { badRequest } = require('./httpError');

// Collects field errors and throws a single 400 with all of them.
function check(rules) {
  const fields = {};
  for (const [field, message] of rules) {
    if (message && !fields[field]) fields[field] = message;
  }
  if (Object.keys(fields).length) {
    throw badRequest('Please correct the highlighted fields.', fields);
  }
}

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const isValidDate = (v) => !isBlank(v) && !Number.isNaN(new Date(v).getTime());
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));

module.exports = { check, isBlank, isValidDate, isEmail };
