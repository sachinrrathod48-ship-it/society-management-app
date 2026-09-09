const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { isAuth, isSecurity } = require('../config/authMiddleware');

// Apply Auth & Security guards
router.use(isAuth, isSecurity);

router.get('/dashboard', securityController.getDashboard);
router.get('/visitors', securityController.getVisitors);
router.post('/visitors/add', securityController.addVisitor);
router.post('/visitors/exit/:id', securityController.markExit);
router.get('/history', securityController.getHistory);

module.exports = router;
