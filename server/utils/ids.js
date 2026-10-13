const crypto = require('crypto');

// Application-level ids (e.g. "c-mg3k2x9a1b"). They stay unique across server
// restarts, which matters now that data is kept in MongoDB.
function createId(prefix) {
  return `${prefix}${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
}

module.exports = { createId };
