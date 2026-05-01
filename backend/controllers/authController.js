const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Location = require('../models/Location');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'legaliq-secret-key-2024', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, gender, address, profileImage } = req.body;

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
      address,
      profilePicture: profileImage || ''
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

    // Send WhatsApp notification to admin about new signup (non-blocking)
    whatsappService.sendNewUserSignupToAdmin({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'client'
    }).catch(err => console.error('Failed to send WhatsApp new user notification to admin:', err));

    // Send WhatsApp welcome message to the new user (non-blocking)
    whatsappService.sendWelcomeToUser({
      name: user.name,
      phone: user.phone
    }).catch(err => console.error('Failed to send WhatsApp welcome to user:', err));

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
    
    // Handle profile picture (including deletion when empty string is passed)
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    // If user is a professional (lawyer, tax-consultant, or auditor), update their Lawyer profile too
    if (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor') {
      const professionalProfile = await Lawyer.findOne({ userId: user._id });
      
      if (professionalProfile) {
        // Update professional profile with same data
        if (name) professionalProfile.name = name;
        if (phone) professionalProfile.phone = phone;
        if (profilePicture !== undefined) {
          professionalProfile.profilePicture = profilePicture;
        }
        
        await professionalProfile.save();
      }
    }

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
      experience, location, court, education, consultationFee, profileImage
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
      role: profType, // 'lawyer', 'tax-consultant', or 'auditor'
      profilePicture: profileImage || ''
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
      consultationFee: consultationFee ? parseInt(consultationFee) : 500,
      isVerified: true, // Auto-verify professionals upon registration
      source: 'registration',
      profilePicture: profileImage || ''
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

    // Add or update location in database
    if (location) {
      await Location.addOrUpdateLocation(location);
    }

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

    // Send WhatsApp notification to admin about new professional signup (non-blocking)
    whatsappService.sendNewProfessionalSignupToAdmin({
      name: user.name,
      email: user.email,
      phone: user.phone,
      professionalType: profType,
      specialization: professional.specialization,
      experience: professional.experience,
      barRegistrationNo: professional.barRegistrationNo,
      registrationNo: professional.registrationNo
    }).catch(err => console.error(`Failed to send WhatsApp ${profType} signup notification to admin:`, err));

    // Send WhatsApp welcome message to the new professional (non-blocking)
    whatsappService.sendWelcomeToProfessional({
      name: user.name,
      phone: user.phone,
      professionalType: profType
    }).catch(err => console.error(`Failed to send WhatsApp welcome to ${profType}:`, err));

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

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (not a Google OAuth user)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for Google authenticated accounts'
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Update professional profile (for lawyers, tax consultants, auditors)
exports.updateProfessionalProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      location,
      court,
      education,
      consultationFee,
      description,
      languages
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a professional
    if (user.role !== 'lawyer' && user.role !== 'tax-consultant' && user.role !== 'auditor') {
      return res.status(403).json({
        success: false,
        message: 'Only professionals can update professional profile'
      });
    }

    // Find or create professional profile
    let professionalProfile = await Lawyer.findOne({ userId: user._id });

    if (!professionalProfile) {
      // Create a new professional profile if it doesn't exist
      // This handles cases where registration was incomplete
      professionalProfile = await Lawyer.create({
        userId: user._id,
        professionalType: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: specialization || ['General'],
        experience: experience ? parseInt(experience) : 0,
        location: location || 'Not specified',
        court: court || 'Not specified',
        education: education || '',
        consultationFee: consultationFee ? parseInt(consultationFee) : 500,
        description: description || '',
        languages: languages || [],
        isVerified: true,
        source: 'registration',
        profilePicture: user.profilePicture || ''
      });

      // Add location to database
      if (location) {
        await Location.addOrUpdateLocation(location);
      }
    } else {
      // Update existing professional fields
      if (specialization) professionalProfile.specialization = specialization;
      if (experience !== undefined) professionalProfile.experience = parseInt(experience);
      if (location) {
        // If location is changing, update the location counts
        if (professionalProfile.location !== location) {
          // Decrement old location count
          if (professionalProfile.location) {
            await Location.decrementCount(professionalProfile.location);
          }
          // Add or increment new location
          await Location.addOrUpdateLocation(location);
        }
        professionalProfile.location = location;
      }
      if (court) professionalProfile.court = court;
      if (education) professionalProfile.education = education;
      if (consultationFee !== undefined) professionalProfile.consultationFee = parseInt(consultationFee);
      if (description) professionalProfile.description = description;
      if (languages) professionalProfile.languages = languages;

      await professionalProfile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Professional profile updated successfully',
      professional: professionalProfile.getPublicProfile()
    });
  } catch (error) {
    console.error('Update professional profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update professional profile'
    });
  }
};

// Get professional profile
exports.getProfessionalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a professional
    if (user.role !== 'lawyer' && user.role !== 'tax-consultant' && user.role !== 'auditor') {
      return res.status(403).json({
        success: false,
        message: 'Only professionals have professional profiles'
      });
    }

    // Find professional profile
    const professionalProfile = await Lawyer.findOne({ userId: user._id });

    if (!professionalProfile) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    res.status(200).json({
      success: true,
      professional: professionalProfile.getPublicProfile()
    });
  } catch (error) {
    console.error('Get professional profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch professional profile'
    });
  }
};

// Update payment details (for professionals only)
exports.updatePaymentDetails = async (req, res) => {
  try {
    const {
      bankAccountNumber,
      bankName,
      ifscCode,
      accountHolderName,
      upiId,
      phonePeNumber,
      googlePayNumber,
      preferredPaymentMethod
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a professional
    if (user.role !== 'lawyer' && user.role !== 'tax-consultant' && user.role !== 'auditor') {
      return res.status(403).json({
        success: false,
        message: 'Only professionals can update payment details'
      });
    }

    // Validate that at least one payment method is provided
    const hasPaymentInfo = bankAccountNumber || upiId || phonePeNumber || googlePayNumber;
    if (!hasPaymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one payment method (Bank Account, UPI, PhonePe, or Google Pay)'
      });
    }

    // Find professional profile
    const professionalProfile = await Lawyer.findOne({ userId: user._id }).select('+paymentDetails.bankAccountNumber');

    if (!professionalProfile) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // Initialize paymentDetails if it doesn't exist
    if (!professionalProfile.paymentDetails) {
      professionalProfile.paymentDetails = {};
    }

    // Update payment details fields
    if (bankAccountNumber !== undefined) professionalProfile.paymentDetails.bankAccountNumber = bankAccountNumber;
    if (bankName !== undefined) professionalProfile.paymentDetails.bankName = bankName;
    if (ifscCode !== undefined) professionalProfile.paymentDetails.ifscCode = ifscCode?.toUpperCase();
    if (accountHolderName !== undefined) professionalProfile.paymentDetails.accountHolderName = accountHolderName;
    if (upiId !== undefined) professionalProfile.paymentDetails.upiId = upiId?.toLowerCase();
    if (phonePeNumber !== undefined) professionalProfile.paymentDetails.phonePeNumber = phonePeNumber;
    if (googlePayNumber !== undefined) professionalProfile.paymentDetails.googlePayNumber = googlePayNumber;
    if (preferredPaymentMethod !== undefined) professionalProfile.paymentDetails.preferredPaymentMethod = preferredPaymentMethod;

    await professionalProfile.save();

    // Return payment details without sensitive bank account number
    const paymentDetailsResponse = {
      bankName: professionalProfile.paymentDetails.bankName,
      ifscCode: professionalProfile.paymentDetails.ifscCode,
      accountHolderName: professionalProfile.paymentDetails.accountHolderName,
      upiId: professionalProfile.paymentDetails.upiId,
      phonePeNumber: professionalProfile.paymentDetails.phonePeNumber,
      googlePayNumber: professionalProfile.paymentDetails.googlePayNumber,
      preferredPaymentMethod: professionalProfile.paymentDetails.preferredPaymentMethod,
      // Mask bank account number for security
      bankAccountNumber: professionalProfile.paymentDetails.bankAccountNumber
        ? '****' + professionalProfile.paymentDetails.bankAccountNumber.slice(-4)
        : null
    };

    res.status(200).json({
      success: true,
      message: 'Payment details updated successfully',
      paymentDetails: paymentDetailsResponse
    });
  } catch (error) {
    console.error('Update payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment details'
    });
  }
};

// Get payment details (for professionals only)
exports.getPaymentDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a professional
    if (user.role !== 'lawyer' && user.role !== 'tax-consultant' && user.role !== 'auditor') {
      return res.status(403).json({
        success: false,
        message: 'Only professionals have payment details'
      });
    }

    // Find professional profile with payment details
    const professionalProfile = await Lawyer.findOne({ userId: user._id }).select('+paymentDetails.bankAccountNumber');

    if (!professionalProfile) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // Return payment details without full bank account number
    const paymentDetailsResponse = professionalProfile.paymentDetails ? {
      bankName: professionalProfile.paymentDetails.bankName,
      ifscCode: professionalProfile.paymentDetails.ifscCode,
      accountHolderName: professionalProfile.paymentDetails.accountHolderName,
      upiId: professionalProfile.paymentDetails.upiId,
      phonePeNumber: professionalProfile.paymentDetails.phonePeNumber,
      googlePayNumber: professionalProfile.paymentDetails.googlePayNumber,
      preferredPaymentMethod: professionalProfile.paymentDetails.preferredPaymentMethod,
      // Mask bank account number for security
      bankAccountNumber: professionalProfile.paymentDetails.bankAccountNumber
        ? '****' + professionalProfile.paymentDetails.bankAccountNumber.slice(-4)
        : null
    } : null;

    res.status(200).json({
      success: true,
      paymentDetails: paymentDetailsResponse
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
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
