const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/google', authController.googleAuth);
router.get('/google/redirect', authController.googleRedirect);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify', authController.verifyOtp);
router.get('/logout', authController.logout);

module.exports = router;
