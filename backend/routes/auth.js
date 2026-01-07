const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const transporter = require("../config/mail");
const User = require("../models/User");
const auth = require("../middleware/auth");

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**************** MULTER *****************/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

/**************** REGISTER *****************/
router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Please enter all fields" });

    email = email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const avatar = req.file
      ? `${BASE_URL}/uploads/${req.file.filename}`
      : null;

    const user = await User.create({
      name,
      email,
      password: hashed,
      avatar,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**************** LOGIN *****************/
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please enter all fields" });

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**************** FORGOT → SEND OTP (10 MINUTES) *****************/
router.post("/forgot", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If email exists, OTP sent" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExp = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Your Reset OTP</h2>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**************** RESET PASSWORD *****************/
router.post("/reset", async (req, res) => {
  try {
    let { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    email = email.toLowerCase().trim();
    otp = String(otp).trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });

    if (!user.resetOtp || !user.resetOtpExp)
      return res.status(400).json({ message: "Request OTP again" });

    if (String(user.resetOtp) !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.resetOtpExp)
      return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = null;
    user.resetOtpExp = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**************** PROFILE *****************/
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
