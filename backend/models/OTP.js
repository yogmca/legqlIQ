const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires after 5 minutes (300 seconds)
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  }
});

// Index for faster lookups
otpSchema.index({ phone: 1, createdAt: -1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
