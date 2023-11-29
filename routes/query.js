const express = require('express');
const queryController = require('../controllers/queryController');  // Update the path


const router = express.Router();


// Define the upload route

router.post('/query-process', queryController.handler);


module.exports = router;