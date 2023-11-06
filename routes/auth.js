const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/google', authController.googleAuth);
router.get('/google/redirect', authController.googleRedirect);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/otp/verify', authController.verifyOtp);
router.post('/otp/resend', authController.resendOtp);

// router.post('/forgot-password', authController.forgotPassword);  -- > Later



module.exports = router;
