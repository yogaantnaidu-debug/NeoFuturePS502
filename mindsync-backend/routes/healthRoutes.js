const express = require('express');
const router = express.Router();
const { connectGoogleFit, syncHealthData, getConnectionStatus } = require('../controllers/healthController');

router.post('/google/connect', connectGoogleFit);
router.post('/sync', syncHealthData);
router.get('/status', getConnectionStatus);

module.exports = router;
