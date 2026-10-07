const router = require('express').Router();
const ctrl = require('../controllers/gradeController');
const { requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/courses/:courseId', requireRole('teacher', 'admin'), ctrl.coursePerformance);

module.exports = router;
