const userService = require('../services/userService');

exports.list = (req, res) => res.json(userService.list(req.query));
exports.get = (req, res) => res.json(userService.getById(req.params.id));
exports.create = (req, res) => res.status(201).json(userService.create(req.body || {}, req.user));
exports.update = (req, res) => res.json(userService.update(req.params.id, req.body || {}, req.user));
exports.remove = (req, res) => {
  userService.remove(req.params.id, req.user);
  res.status(204).end();
};
exports.updateProfile = (req, res) => res.json(userService.updateProfile(req.user.id, req.body || {}));
