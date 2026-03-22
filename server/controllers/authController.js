const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  authType: user.authType,
});

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ msg: 'All fields are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(422).json({ msg: 'Invalid email format' });

    if (password.length < 8)
      return res.status(422).json({ msg: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ msg: 'Email already registered' });

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('registerUser error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    if (user.authType === 'google')
      return res.status(400).json({ msg: 'This account uses Google login' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error('loginUser error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/auth/google-login
const googleLogin = async (req, res) => {
  const { token, access_token, code } = req.body;
  let profile;

  try {
    if (token) {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      profile = ticket.getPayload();
    } else if (access_token) {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      profile = data;
    } else if (code) {
      const { tokens } = await googleClient.getToken(code);
      const idPayload = JSON.parse(
        Buffer.from(tokens.id_token.split('.')[1], 'base64')
      );
      profile = idPayload;
    } else {
      return res.status(400).json({ msg: 'No Google credential received' });
    }

    const { sub: googleId, email, name } = profile;
    if (!email) return res.status(400).json({ msg: 'Google profile missing email' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username: name, email, googleId, authType: 'google' });
    }

    const appToken = generateToken(user._id);
    res.json({ token: appToken, user: safeUser(user) });
  } catch (err) {
    console.error('googleLogin error:', err.response?.data || err.message);
    res.status(401).json({ msg: 'Invalid Google credential' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password -googleId');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(safeUser(user));
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, googleLogin, getMe };