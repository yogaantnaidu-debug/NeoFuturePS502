const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer to save files temporarily to an 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

const { predictEmotion } = require('../controllers/mlController');

router.post('/predict-emotion', upload.single('image'), predictEmotion);

module.exports = router;
