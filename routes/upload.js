const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');  // Update the path
const processController = require('../controllers/processController');  // Update the path
// Define the upload route

router.post('/upload', uploadController.handler);
router.post('/process', processController.handler);

module.exports = router;