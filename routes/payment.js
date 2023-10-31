const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Process a payment
router.post('/process-payment', paymentController.processPayment);

module.exports = router;
