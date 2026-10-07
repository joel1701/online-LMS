const courseService = require('../services/courseService');
const progressService = require('../services/progressService');

exports.list = (req, res) => {
  let rows = courseService.list(req.user, req.query);
  if (req.user.role === 'student') {
    rows = rows.map((c) => ({ ...c, progress: progressService.studentProgress(c, req.user.id) }));
  }
  res.json(rows);
};

exports.get = (req, res) => {
  res.json(courseService.getForUser(req.user, req.params.id));
};

exports.create = (req, res) => {
  res.status(201).json(courseService.create(req.body || {}, req.user));
};

exports.update = (req, res) => {
  res.json(courseService.update(req.params.id, req.body || {}, req.user));
};

exports.remove = (req, res) => {
  courseService.remove(req.params.id, req.user);
  res.status(204).end();
};
