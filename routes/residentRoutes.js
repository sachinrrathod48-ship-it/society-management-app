const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { isAuth, isResident } = require('../config/authMiddleware');

// Apply Auth & Resident guards
router.use(isAuth, isResident);

router.get('/dashboard', residentController.getDashboard);
router.get('/complaints', residentController.getComplaints);
router.post('/complaints/add', residentController.submitComplaint);
router.get('/maintenance', residentController.getMaintenance);
router.post('/maintenance/pay/:id', residentController.payBill);
router.get('/notices', residentController.getNotices);
router.get('/emergency', residentController.getEmergency);

module.exports = router;
