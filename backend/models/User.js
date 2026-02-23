const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    sparse: true
  },
  password: {
    type: String,
    select: false
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'lawyer', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only if password exists and is modified)
userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password, 12);
});

// Update the updatedAt timestamp
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    address: this.address,
    profilePicture: this.profilePicture,
    role: this.role,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
