const router = require('express').Router();
const ctrl = require('../controllers/testController');
const { requireRole } = require('../middleware/auth');

const staff = requireRole('teacher', 'admin');
const student = requireRole('student');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', staff, ctrl.create);
router.put('/:id', staff, ctrl.update);
router.delete('/:id', staff, ctrl.remove);
router.get('/:id/results', staff, ctrl.results);

router.post('/:id/start', student, ctrl.start);
router.put('/:id/progress', student, ctrl.saveProgress);
router.post('/:id/submit', student, ctrl.submit);
router.get('/:id/result', student, ctrl.result);

module.exports = router;
