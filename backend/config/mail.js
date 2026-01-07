// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,          // IMPORTANT SSL
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   tls: {
//     rejectUnauthorized: false
//   },
//   connectionTimeout: 20000
// });

// module.exports = transporter;

const axios = require("axios");

const sendMail = async (to, subject, html) => {
  try {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Expense Tracker <onboarding@resend.dev>",
        to,
        subject,
        html
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ EMAIL SENT SUCCESSFULLY");
    return true;
  } catch (err) {
    console.log("❌ EMAIL FAILED", err?.response?.data || err);
    return false;
  }
};

module.exports = sendMail;
