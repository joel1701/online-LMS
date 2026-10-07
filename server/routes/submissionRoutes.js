const router = require('express').Router();
const ctrl = require('../controllers/submissionController');
const { requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', requireRole('student'), ctrl.submit);
router.put('/:id/grade', requireRole('teacher', 'admin'), ctrl.grade);

module.exports = router;
