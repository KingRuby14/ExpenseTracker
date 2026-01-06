const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    avatar: String,
    verified: { type: Boolean, default: false },
    verificationToken: String,
    resetOtp: String,
    resetOtpExp: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
