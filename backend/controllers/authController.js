const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const emailService = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'legaliq-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, gender, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address
    });

    // Generate token
    const token = generateToken(user._id);

    // Send notification email to admin (non-blocking)
    emailService.sendNewUserNotification({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'client',
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address
    }).catch(err => console.error('Failed to send new user notification:', err));

    // Send welcome email to the newly registered user (non-blocking)
    emailService.sendWelcomeEmail(
      user.email,
      user.name,
      user.role || 'client',
      'user' // Client registration
    ).catch(err => console.error('Failed to send welcome email:', err));

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Validate input
    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password'
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, address, profilePicture } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Register new professional (lawyer, tax-consultant, or auditor)
exports.registerLawyer = async (req, res) => {
  try {
    const {
      name, email, phone, password, dateOfBirth, gender, address,
      professionalType, barRegistrationNo, registrationNo, specialization,
      experience, location, court, education, consultationFee
    } = req.body;

    // Determine the professional type (default to 'lawyer' for backward compatibility)
    const profType = professionalType || 'lawyer';

    // Check if email or phone already exists in User collection
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Phone number already registered'
      });
    }

    // Check if email or registration number already exists in Lawyer collection
    const registrationQuery = { email };
    
    // Add registration number check based on professional type
    if (profType === 'lawyer' && barRegistrationNo) {
      registrationQuery.$or = [{ email }, { barRegistrationNo }];
    } else if ((profType === 'tax-consultant' || profType === 'auditor') && registrationNo) {
      registrationQuery.$or = [{ email }, { registrationNo }];
    }

    const existingProfessional = await Lawyer.findOne(registrationQuery);

    if (existingProfessional) {
      return res.status(400).json({
        success: false,
        message: existingProfessional.email === email
          ? `Email already registered as ${profType}`
          : 'Registration number already registered'
      });
    }

    // Create user account first with appropriate role
    const user = await User.create({
      name,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      role: profType // 'lawyer', 'tax-consultant', or 'auditor'
    });

    // Create professional profile
    const professionalData = {
      userId: user._id,
      professionalType: profType,
      name,
      email,
      phone,
      specialization,
      experience: parseInt(experience),
      location,
      education,
      consultationFee: consultationFee ? parseInt(consultationFee) : 500
    };

    // Add registration number based on professional type
    if (profType === 'lawyer') {
      professionalData.barRegistrationNo = barRegistrationNo;
      professionalData.court = court;
    } else {
      professionalData.registrationNo = registrationNo;
      professionalData.court = court; // Used as office/firm name for tax consultants and auditors
    }

    const professional = await Lawyer.create(professionalData);

    // Generate token
    const token = generateToken(user._id);

    // Send notification email to admin (non-blocking)
    const notificationData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: profType,
      professionalType: profType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      specialization: professional.specialization,
      experience: professional.experience
    };

    if (profType === 'lawyer') {
      notificationData.barRegistrationNo = professional.barRegistrationNo;
    } else {
      notificationData.registrationNo = professional.registrationNo;
    }

    emailService.sendNewUserNotification(notificationData)
      .catch(err => console.error(`Failed to send ${profType} registration notification:`, err));

    // Send welcome email to the newly registered professional (non-blocking)
    emailService.sendWelcomeEmail(
      user.email,
      user.name,
      profType, // Role is the professional type
      profType  // Professional type: lawyer, tax-consultant, or auditor
    ).catch(err => console.error(`Failed to send welcome email to ${profType}:`, err));

    // Prepare response message
    const roleLabel = profType === 'lawyer' ? 'Lawyer' :
                      profType === 'tax-consultant' ? 'Tax Consultant' : 'Auditor';

    res.status(201).json({
      success: true,
      message: `${roleLabel} registration successful`,
      token,
      user: {
        ...user.getPublicProfile(),
        professionalId: professional._id,
        professionalType: profType,
        barRegistrationNo: professional.barRegistrationNo,
        registrationNo: professional.registrationNo
      }
    });
  } catch (error) {
    console.error('Professional registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Professional registration failed'
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link shortly'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email'
      });
    } catch (emailError) {
      // If email fails, remove reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate input
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password and confirm password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token from URL
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new token for auto-login
    const authToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: authToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Logout user (client-side token removal)
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};
