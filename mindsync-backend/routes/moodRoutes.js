const express = require('express');
const router = express.Router();

const {
  createMood,
  getMoods,
  getMoodStats
} = require('../controllers/moodController');

router.post('/', createMood);
router.get('/history', getMoods);
router.get('/stats', getMoodStats);

module.exports = router;