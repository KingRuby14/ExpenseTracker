const axios = require("axios");

const sendMail = async (to, subject, html) => {
  try {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Expense Tracker <no-reply@selvapandi.com>",
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
