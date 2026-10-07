const router = require('express').Router();
const ctrl = require('../controllers/assignmentController');
const { requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', requireRole('teacher', 'admin'), ctrl.create);
router.put('/:id', requireRole('teacher', 'admin'), ctrl.update);
router.delete('/:id', requireRole('teacher', 'admin'), ctrl.remove);

module.exports = router;
