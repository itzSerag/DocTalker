const express = require('express');
const router = express.Router();

queryController = require('../controllers/queryController');
// Define the upload route

router.post('/upload', uploadController.handler);
router.post('/process', processController.handler);

module.exports = router;