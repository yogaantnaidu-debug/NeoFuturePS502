const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile } = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/:id', getProfile);
router.put('/:id', updateProfile);

module.exports = router;
