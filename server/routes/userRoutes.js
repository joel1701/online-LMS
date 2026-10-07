const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { requireRole } = require('../middleware/auth');

router.put('/me', ctrl.updateProfile);

router.get('/', requireRole('admin'), ctrl.list);
router.get('/:id', requireRole('admin'), ctrl.get);
router.post('/', requireRole('admin'), ctrl.create);
router.put('/:id', requireRole('admin'), ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
