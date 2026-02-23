const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  // Link to User model (if lawyer is also a registered user)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null for lawyers not yet registered as users
  },
  name: {
    type: String,
    required: [true, 'Please provide lawyer name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide lawyer email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  barRegistrationNo: {
    type: String,
    required: [true, 'Please provide bar registration number'],
    unique: true,
    trim: true
  },
  specialization: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Please provide location'],
    trim: true
  },
  court: {
    type: String,
    required: [true, 'Please provide court information'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  languages: [{
    type: String
  }],
  education: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  availability: {
    type: Boolean,
    default: true
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

// Update the updatedAt timestamp before saving
lawyerSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

// Method to get public profile
lawyerSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    barRegistrationNo: this.barRegistrationNo,
    specialization: this.specialization,
    experience: this.experience,
    location: this.location,
    court: this.court,
    address: this.address,
    languages: this.languages,
    education: this.education,
    description: this.description,
    profilePicture: this.profilePicture,
    rating: this.rating,
    totalReviews: this.totalReviews,
    consultationFee: this.consultationFee,
    availability: this.availability,
    isVerified: this.isVerified
  };
};

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

module.exports = Lawyer;
