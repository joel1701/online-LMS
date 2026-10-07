const dashboardService = require('../services/dashboardService');
const notificationService = require('../services/notificationService');
const activityService = require('../services/activityService');
const departments = require('../data/departments');

exports.dashboard = (req, res) => res.json(dashboardService.forUser(req.user));
exports.notifications = (req, res) => res.json(notificationService.forUser(req.user));
exports.activity = (req, res) => res.json(activityService.list(req.user, req.query));
exports.departments = (req, res) => res.json(departments.map(({ code, name }) => ({ code, name })));
