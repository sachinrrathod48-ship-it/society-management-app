const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../config/authMiddleware');

router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.get('/fix-passwords', authController.fixPasswords);

module.exports = router;
