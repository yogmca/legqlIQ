const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

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

// Register new lawyer
exports.registerLawyer = async (req, res) => {
  try {
    const {
      name, email, phone, password, dateOfBirth, gender, address,
      barRegistrationNo, specialization, experience, location, court,
      education, consultationFee
    } = req.body;

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

    // Check if email or bar registration number already exists in Lawyer collection
    const existingLawyer = await Lawyer.findOne({
      $or: [{ email }, { barRegistrationNo }]
    });

    if (existingLawyer) {
      return res.status(400).json({
        success: false,
        message: existingLawyer.email === email
          ? 'Email already registered as lawyer'
          : 'Bar registration number already registered'
      });
    }

    // Create user account first with role 'lawyer'
    const user = await User.create({
      name,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      role: 'lawyer'
    });

    // Create lawyer profile
    const lawyer = await Lawyer.create({
      userId: user._id,
      name,
      email,
      phone,
      barRegistrationNo,
      specialization,
      experience: parseInt(experience),
      location,
      court,
      education,
      consultationFee: consultationFee ? parseInt(consultationFee) : 500
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Lawyer registration successful',
      token,
      user: {
        ...user.getPublicProfile(),
        lawyerId: lawyer._id,
        barRegistrationNo: lawyer.barRegistrationNo
      }
    });
  } catch (error) {
    console.error('Lawyer registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lawyer registration failed'
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
