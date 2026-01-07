const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,          // MUST be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Gmail APP PASSWORD only
  },
  tls: {
    rejectUnauthorized: false
  }
});
 
transporter.verify((err) => {
  if (err) console.log("❌ SMTP ERROR", err);
  else console.log("✅ SMTP READY");
});

module.exports = transporter;
