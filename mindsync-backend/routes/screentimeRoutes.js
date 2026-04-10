const express = require('express');
const router = express.Router();
const { logScreentime, getScreentime } = require('../controllers/screentimeController');

router.post('/', logScreentime);
router.get('/:userId', getScreentime);

module.exports = router;
