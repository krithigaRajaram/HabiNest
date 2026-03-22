const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/me', auth, getMe);

module.exports = router;