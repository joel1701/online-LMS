const announcementService = require('../services/announcementService');

exports.list = (req, res) => res.json(announcementService.list(req.user, req.query));
exports.create = (req, res) => res.status(201).json(announcementService.create(req.user, req.body || {}));
exports.remove = (req, res) => {
  announcementService.remove(req.user, req.params.id);
  res.status(204).end();
};
