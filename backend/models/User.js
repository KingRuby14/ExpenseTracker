const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    // Forgot password
    resetOtp: String,
    resetOtpExp: Number,

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifyToken: String,
    verifyTokenExp: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
