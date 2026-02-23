const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const smsService = require('../services/smsService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'legaliq-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Send OTP to mobile number
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this phone number
    await OTP.deleteMany({ phone });

    // Save OTP to database
    await OTP.create({
      phone,
      otp
    });

    // Send OTP via SMS service
    try {
      await smsService.sendOTP(phone, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your mobile number',
        // Only include OTP in development mode when SMS is disabled
        otp: (process.env.NODE_ENV === 'development' && !process.env.SMS_ENABLED) ? otp : undefined
      });
    } catch (smsError) {
      // SMS failed but OTP is saved in database
      console.error('SMS sending failed:', smsError.message);
      
      res.status(200).json({
        success: true,
        message: 'OTP generated. Please check your phone.',
        // Include OTP in development if SMS fails
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP and login/register user
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and OTP'
      });
    }

    // Find the most recent OTP for this phone number
    const otpRecord = await OTP.findOne({ phone })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new OTP'
      });
    }

    // Check if OTP is already verified
    if (otpRecord.verified) {
      return res.status(400).json({
        success: false,
        message: 'OTP already used. Please request a new OTP'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining`
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user if doesn't exist
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your name for registration',
          requiresName: true
        });
      }

      user = await User.create({
        name: name.trim(),
        phone,
        email: `${phone}@legaliq.temp`, // Temporary email
        role: 'user',
        isVerified: true // Phone verified via OTP
      });

      console.log('✅ New user created via OTP:', user.name);
    } else {
      console.log('✅ Existing user logged in via OTP:', user.name);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: user.isNew ? 'Registration successful' : 'Login successful',
      token,
      user: user.getPublicProfile(),
      isNewUser: !user.isNew
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Check if last OTP was sent less than 30 seconds ago
    const lastOTP = await OTP.findOne({ phone })
      .sort({ createdAt: -1 });

    if (lastOTP) {
      const timeDiff = (Date.now() - lastOTP.createdAt) / 1000; // in seconds
      if (timeDiff < 30) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(30 - timeDiff)} seconds before requesting a new OTP`
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();

    // Delete old OTPs
    await OTP.deleteMany({ phone });

    // Save new OTP
    await OTP.create({
      phone,
      otp
    });

    // Send OTP via SMS service
    try {
      await smsService.sendOTP(phone, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP resent successfully to your mobile number',
        otp: (process.env.NODE_ENV === 'development' && !process.env.SMS_ENABLED) ? otp : undefined
      });
    } catch (smsError) {
      console.error('SMS resend failed:', smsError.message);
      
      res.status(200).json({
        success: true,
        message: 'OTP generated. Please check your phone.',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};
