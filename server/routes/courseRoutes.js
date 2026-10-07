const router = require('express').Router();
const ctrl = require('../controllers/courseController');
const { requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', requireRole('admin'), ctrl.create);
router.put('/:id', requireRole('admin'), ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
