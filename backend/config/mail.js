const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,              // Use TLS port (Render stable)
  secure: false,          // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Gmail APP password only
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Debug to confirm SMTP works
transporter.verify((err, success) => {
  if (err) console.log("❌ SMTP ERROR:", err);
  else console.log("✅ SMTP READY");
});

module.exports = transporter;
