// Demo authentication only.
// TODO: Replace with bcrypt password hashing and signed JWTs (jsonwebtoken)
// using JWT_SECRET. The token below is NOT secure – it is base64 JSON.
const userService = require('./userService');
const { badRequest, unauthorized } = require('../utils/httpError');

function issueToken(user) {
  return Buffer.from(JSON.stringify({ sub: user.id, iat: Date.now() })).toString('base64url');
}

function readToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    return payload && payload.sub ? payload : null;
  } catch {
    return null;
  }
}

function login(identifier, password) {
  if (!identifier || !password) {
    throw badRequest('Enter your university ID or email and your password.');
  }
  const user = userService.findByLogin(identifier);
  if (!user || user.password !== password) {
    throw unauthorized('The university ID/email or password is incorrect.');
  }
  if (user.status !== 'active') {
    throw unauthorized('This account is disabled. Contact the Registrar’s Office.');
  }
  return { token: issueToken(user), user: userService.toPublic(user) };
}

module.exports = { login, readToken };
