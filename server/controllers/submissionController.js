const submissionService = require('../services/submissionService');
const { badRequest } = require('../utils/httpError');

exports.list = (req, res) => {
  if (req.user.role === 'student') return res.json(submissionService.listMine(req.user));
  if (!req.query.assignmentId) throw badRequest('assignmentId query parameter is required.');
  res.json(submissionService.rosterForAssignment(req.user, req.query.assignmentId));
};

exports.submit = (req, res) => res.status(201).json(submissionService.submit(req.user, req.body || {}));
exports.grade = (req, res) => res.json(submissionService.grade(req.user, req.params.id, req.body || {}));
