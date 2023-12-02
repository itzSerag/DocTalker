const express = require('express');
const router = express.Router();
const multer = require('multer');

// config multer
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })  // now the file in the memory

// file -- > filed name in the form

const uploadController = require('../controllers/uploadController');  // Update the path
const processController = require('../controllers/processController');  // Update the path
// Define the upload route


router.post('/upload', upload.single('file'),uploadController.handler);
router.post('/process', processController.handler); 

module.exports = router;