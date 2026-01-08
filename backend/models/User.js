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

    password: { type: String, required: true },

    avatar: { type: String, default: null },

    currency: {
      type: String,
      default: "USD",
    },

    resetOtp: String,
    resetOtpExp: Number,

    emailVerified: {
      type: Boolean,
      default: false,
    },

    verifyToken: String,
    verifyTokenExp: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
