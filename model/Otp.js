const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: { expires: "10m" }, // OTP will automatically expire after 10 minutes
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    used: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// Index to automatically delete expired OTPs
otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
