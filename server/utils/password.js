// Passwords are stored only as bcrypt hashes.
const bcrypt = require('bcryptjs');

const ROUNDS = 10;

function hashPassword(plain) {
  return bcrypt.hashSync(String(plain), ROUNDS);
}

function verifyPassword(user, plain) {
  if (!user || !user.passwordHash) return false;
  return bcrypt.compareSync(String(plain), user.passwordHash);
}

// Seed data is written with a plain `password`; replace it with a hash in place.
function hashSeedPasswords(users) {
  const cache = new Map();
  for (const user of users) {
    if (user.password !== undefined) {
      if (!cache.has(user.password)) cache.set(user.password, hashPassword(user.password));
      user.passwordHash = cache.get(user.password);
      delete user.password;
    }
  }
}

module.exports = { hashPassword, verifyPassword, hashSeedPasswords };
