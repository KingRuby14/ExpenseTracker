// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, unique: true },
//     password: String,
//     avatar: String,
//     verified: { type: Boolean, default: false },
//     verificationToken: String,
//     resetOtp: String,
//     resetOtpExp: Date,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", UserSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String } // url / path to uploaded profile image
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);