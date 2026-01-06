const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
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
    cb(null, "avatar_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/*************** EMAIL VERIFY ***************/
async function sendVerificationEmail(user) {
  const link = `${process.env.BACKEND_URL}/api/auth/verify/${user.verificationToken}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Verify Email",
    html: `
      <h2>Email Verification</h2>
      <p>Click to verify your account</p>
      <a href="${link}">
      <button style="padding:10px;background:purple;color:white;border:none;border-radius:5px">
      Verify Email
      </button>
      </a>
      <p>If button not working paste this link:</p>
      <p>${link}</p>
    `,
  });
}

/*************** REGISTER ***************/
router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    let exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      avatar: req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null,
      verified: false,
      verificationToken: uuid(),
    });

    await sendVerificationEmail(user);

    res.json({ message: "Registered! Verify email" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/*************** VERIFY ***************/
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=success`);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/*************** LOGIN ***************/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.verified) {
      user.verificationToken = uuid();
      await user.save();
      await sendVerificationEmail(user);
      return res.status(403).json({ message: "Verify email first" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/*************** GOOGLE LOGIN SAFE ***************/
let admin = null;
try {
  admin = require("firebase-admin");
  admin.initializeApp({
    credential: admin.credential.cert(require("../firebase.json")),
  });
} catch (e) {
  console.log(
    "🔥 Firebase Admin NOT enabled (no key found). Google login disabled."
  );
}

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = await User.create({
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
        verified: true,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: jwtToken, user });
  } catch {
    res.status(500).json({ message: "Google login failed" });
  }
});


/*************** FORGOT PASSWORD ***************/
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "OTP sent" });

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOtp = otp;
    user.resetOtpExp = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "Reset OTP",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });

    res.json({ message: "OTP sent" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/*************** RESET PASSWORD ***************/
router.post("/reset", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid" });

    if (user.resetOtp != otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.resetOtpExp)
      return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = null;
    user.resetOtpExp = null;
    await user.save();

    res.json({ message: "Password Reset Success" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/*************** PROFILE ***************/
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

module.exports = router;
