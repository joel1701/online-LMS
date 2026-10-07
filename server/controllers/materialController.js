const materialService = require('../services/materialService');

exports.list = (req, res) => res.json(materialService.list(req.user, req.query));
exports.create = (req, res) => res.status(201).json(materialService.create(req.user, req.body || {}));
exports.update = (req, res) => res.json(materialService.update(req.user, req.params.id, req.body || {}));
exports.remove = (req, res) => {
  materialService.remove(req.user, req.params.id);
  res.status(204).end();
};
