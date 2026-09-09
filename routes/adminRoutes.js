const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuth, isAdmin } = require('../config/authMiddleware');

// Apply Auth & Admin guards to all /admin/* routes
router.use(isAuth, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Resident Management
router.get('/residents', adminController.getResidents);
router.post('/residents/add', adminController.addResident);
router.post('/residents/edit/:id', adminController.updateResident);
router.post('/residents/delete/:id', adminController.deleteResident);

// Security Staff Management
router.get('/security', adminController.getSecurity);
router.post('/security/add', adminController.addSecurity);
router.post('/security/edit/:id', adminController.updateSecurity);
router.post('/security/delete/:id', adminController.deleteSecurity);

// Visitor Management
router.get('/visitors', adminController.getVisitors);
router.post('/visitors/exit/:id', adminController.markVisitorExit);

// Complaint Management
router.get('/complaints', adminController.getComplaints);
router.post('/complaints/status/:id', adminController.updateComplaintStatus);

// Maintenance Management
router.get('/maintenance', adminController.getMaintenance);
router.post('/maintenance/create-single', adminController.createSingleBill);
router.post('/maintenance/create-bulk', adminController.createBulkBills);
router.post('/maintenance/pay/:id', adminController.markBillPaid);

// Notice Management
router.get('/notices', adminController.getNotices);
router.post('/notices/add', adminController.addNotice);
router.post('/notices/edit/:id', adminController.updateNotice);
router.post('/notices/delete/:id', adminController.deleteNotice);

// Emergency Contacts Management
router.get('/emergency', adminController.getEmergency);
router.post('/emergency/add', adminController.addEmergency);
router.post('/emergency/edit/:id', adminController.updateEmergency);
router.post('/emergency/delete/:id', adminController.deleteEmergency);

// Profile
router.get('/profile', adminController.getProfile);
router.post('/profile/update', adminController.updateProfile);

module.exports = router;
