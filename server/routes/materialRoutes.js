const router = require('express').Router();
const ctrl = require('../controllers/materialController');
const { requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', requireRole('teacher', 'admin'), ctrl.create);
router.put('/:id', requireRole('teacher', 'admin'), ctrl.update);
router.delete('/:id', requireRole('teacher', 'admin'), ctrl.remove);

module.exports = router;
