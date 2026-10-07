const assignmentService = require('../services/assignmentService');

exports.list = (req, res) => res.json(assignmentService.list(req.user, req.query));
exports.get = (req, res) => res.json(assignmentService.get(req.user, req.params.id));
exports.create = (req, res) => res.status(201).json(assignmentService.create(req.user, req.body || {}));
exports.update = (req, res) => res.json(assignmentService.update(req.user, req.params.id, req.body || {}));
exports.remove = (req, res) => {
  assignmentService.remove(req.user, req.params.id);
  res.status(204).end();
};
