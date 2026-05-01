const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  // Link to User model (if lawyer is also a registered user)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null for professionals not yet registered as users
  },
  // Professional type: lawyer, tax-consultant, or auditor
  professionalType: {
    type: String,
    enum: ['lawyer', 'tax-consultant', 'auditor'],
    default: 'lawyer',
    required: [true, 'Please specify professional type']
  },
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
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
    required: false,
    sparse: true, // Allow null for non-lawyers
    trim: true
  },
  // Registration number for tax consultants and auditors (optional)
  registrationNo: {
    type: String,
    required: false,
    sparse: true,
    trim: true
  },
  // For lawyers: array of specializations (dropdown)
  // For tax-consultant/auditor: stored as single-item array with text value
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
  totalBookings: {
    type: Number,
    default: 0
  },
  lastBookedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: ['manual', 'web_scraper', 'registration'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Payment Settlement Details
  paymentDetails: {
    // Bank Account Details
    bankAccountNumber: {
      type: String,
      trim: true,
      select: false // Don't include in regular queries for security
    },
    bankName: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    accountHolderName: {
      type: String,
      trim: true
    },
    // UPI Details
    upiId: {
      type: String,
      trim: true,
      lowercase: true
    },
    // Payment App Numbers
    phonePeNumber: {
      type: String,
      trim: true
    },
    googlePayNumber: {
      type: String,
      trim: true
    },
    // Preferred payment method
    preferredPaymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'phonepe', 'googlepay'],
      default: 'upi'
    }
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
    professionalType: this.professionalType,
    name: this.name,
    email: this.email,
    phone: this.phone,
    barRegistrationNo: this.barRegistrationNo,
    registrationNo: this.registrationNo,
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
    isVerified: this.isVerified,
    lastActive: this.lastActive
  };
};

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

module.exports = Lawyer;
