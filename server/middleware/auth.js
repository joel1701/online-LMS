const authService = require('../services/authService');
const userService = require('../services/userService');
const { unauthorized, forbidden } = require('../utils/httpError');

// TODO: Verify a signed JWT here once real authentication is implemented.
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token && authService.readToken(token);
  const user = payload && userService.findRaw(payload.sub);

  if (!user) return next(unauthorized());
  if (user.status !== 'active') return next(unauthorized('This account has been disabled.'));

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden('Your role does not have permission for this action.'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
