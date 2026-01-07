const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,          // IMPORTANT
  secure: true,       // IMPORTANT (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Gmail APP PASSWORD only
  }
});

module.exports = transporter;
