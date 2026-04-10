const express = require('express');
const router = express.Router();
const { healthAI, getInsights } = require('../controllers/aiController');

router.post('/chat', healthAI);
router.get('/insights', getInsights);

module.exports = router;