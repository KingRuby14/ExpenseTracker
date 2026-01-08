const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth");
const sendMail = require("../config/mail");

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

/**************** REGISTER + SEND VERIFY LINK *****************/
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
      ? `${process.env.BACKEND_URL}/uploads/${req.file.filename}`
      : null;

    const verifyToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      name,
      email,
      password: hashed,
      avatar,
      emailVerified: false,
      verifyToken,
      verifyTokenExp: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });

    // ✅ FRONTEND LINK
    const link = `${process.env.CLIENT_URL}/verify/${verifyToken}`;

    await sendMail(
      email,
      "Verify Your Expense Tracker Account",
      `
        <h2>Hi ${name}</h2>
        <p>Please verify your email</p>
        <a href="${link}"
           style="padding:10px 20px;background:#6d28d9;color:white;border-radius:5px;text-decoration:none">
          Verify Email
        </a>
        <p>This link expires in 24 hours</p>
      `
    );

    res.json({ message: "Registered! Check your email to verify." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**************** VERIFY EMAIL *****************/
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verifyToken: req.params.token,
      verifyTokenExp: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).send("Verification link invalid or expired");

    user.emailVerified = true;
    user.verifyToken = null;
    user.verifyTokenExp = null;
    await user.save();

    res.send(
      "<h2>Email Verified Successfully 🎉</h2><p>You can close this and login now.</p>"
    );
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/**************** RESEND VERIFY *****************/
router.post("/resend-verify", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "Email sent if account exists" });

    if (user.emailVerified) return res.json({ message: "Already verified" });

    user.verifyToken = crypto.randomBytes(32).toString("hex");
    user.verifyTokenExp = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const link = `${BASE_URL}/api/auth/verify/${user.verifyToken}`;

    await sendMail(
      email,
      "Verify Email",
      `<a href="${link}">Verify Account</a>`
    );

    res.json({ message: "Verification email sent" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/**************** LOGIN (BLOCK IF NOT VERIFIED) *****************/
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

    if (!user.emailVerified)
      return res.status(403).json({ message: "Please verify your email" });

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

/**************** FORGOT → SEND OTP (UNCHANGED) *****************/
router.post("/forgot", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      console.log("⚠️ Forgot request for non-existing email:", email);
      return res.json({ message: "If email exists, OTP sent" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExp = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("📨 Sending OTP to:", email);
    console.log("🔐 OTP:", otp);

    const sent = await sendMail(
      email,
      "Expense Tracker Password Reset OTP",
      `
        <h2>Your OTP Code</h2>
        <h1 style="letter-spacing:3px">${otp}</h1>
        <p>Expires in <b>10 minutes</b>.</p>
      `
    );

    if (!sent) return res.status(500).json({ message: "Failed to send OTP" });

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log("❌ SERVER ERROR IN FORGOT ROUTE", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**************** RESET PASSWORD (UNCHANGED) *****************/
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

/**************** GOOGLE LOGIN *****************/
router.post("/google", async (req, res) => {
  try {
    const { email, name, picture } = req.body;

    if (!email) return res.status(400).json({ message: "No email" });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(20).toString("hex"),
        avatar: picture || null,
        emailVerified: true,
      });
    }

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
    res.status(500).json({ message: "Google login failed" });
  }
});

module.exports = router;
