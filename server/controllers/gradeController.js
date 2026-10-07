const gradeService = require('../services/gradeService');

exports.list = (req, res) => res.json(gradeService.forStudent(req.user, req.query));
exports.coursePerformance = (req, res) => res.json(gradeService.coursePerformance(req.user, req.params.courseId));
