const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(422).json({ msg: "Invalid email format" });

    if (password.length < 8)
      return res.status(422).json({ msg: "Password must be at least 8 characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const user = await User.create({ username, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
};

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
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      profile = data;
    } else if (code) {
      const { tokens } = await googleClient.getToken(code);
      const idPayload = JSON.parse(
        Buffer.from(tokens.id_token.split(".")[1], "base64")
      );
      profile = idPayload;
    } else {
      return res.status(400).json({ msg: "No Google credential received" });
    }

    const { sub: googleId, email, name } = profile;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name,
        email,
        googleId,
        authType: "google",
      });
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token: appToken,
      user: { id: user._id, username: user.username, email },
    });
  } catch (err) {
    console.error("Google login error", err.response?.data || err.message);
    res.status(401).json({ msg: "Invalid Google credential" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
};
