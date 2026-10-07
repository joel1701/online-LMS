const authService = require('../services/authService');
const userService = require('../services/userService');

exports.login = (req, res) => {
  const { identifier, password } = req.body || {};
  res.json(authService.login(identifier, password));
};

exports.me = (req, res) => {
  res.json({ user: userService.toPublic(req.user) });
};
