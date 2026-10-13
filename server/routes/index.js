const store = require('../db/store');
const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const misc = require('../controllers/miscController');

router.get('/health', (req, res) => res.json({ status: 'ok', dataSource: store.isEnabled() ? 'MongoDB' : 'in-memory sample data' }));

router.use('/auth', require('./authRoutes'));

router.use(authenticate);
router.use('/courses', require('./courseRoutes'));
router.use('/materials', require('./materialRoutes'));
router.use('/assignments', require('./assignmentRoutes'));
router.use('/submissions', require('./submissionRoutes'));
router.use('/tests', require('./testRoutes'));
router.use('/grades', require('./gradeRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/announcements', require('./announcementRoutes'));

router.get('/dashboard', misc.dashboard);
router.get('/notifications', misc.notifications);
router.get('/activity', requireRole('admin', 'teacher'), misc.activity);
router.get('/departments', misc.departments);

module.exports = router;
