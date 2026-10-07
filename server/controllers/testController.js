const testService = require('../services/testService');

exports.list = (req, res) => res.json(testService.list(req.user, req.query));
exports.get = (req, res) => res.json(testService.get(req.user, req.params.id));
exports.create = (req, res) => res.status(201).json(testService.create(req.user, req.body || {}));
exports.update = (req, res) => res.json(testService.update(req.user, req.params.id, req.body || {}));
exports.remove = (req, res) => {
  testService.remove(req.user, req.params.id);
  res.status(204).end();
};
exports.start = (req, res) => res.json(testService.start(req.user, req.params.id));
exports.saveProgress = (req, res) => res.json(testService.saveProgress(req.user, req.params.id, (req.body || {}).answers));
exports.submit = (req, res) => res.json(testService.submit(req.user, req.params.id, (req.body || {}).answers));
exports.result = (req, res) => res.json(testService.result(req.user, req.params.id));
exports.results = (req, res) => res.json(testService.results(req.user, req.params.id));
