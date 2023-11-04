const express = require('express');
const otpController = require('../controllers/otpController');
const router = express.Router();


router.post('/send', otpController.sendOtp);
router.post('/verify', otpController.verifyOtp);
router.post('/resend', otpController.resendOtp);



module.exports = router;