const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  // Client (User) reference - one-to-many relationship
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required']
  },
  // Lawyer reference - one-to-many relationship
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: [true, 'Lawyer ID is required']
  },
  // Client Information (denormalized for quick access)
  clientInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  // Lawyer Information (denormalized for quick access)
  lawyerInfo: {
    name: {
      type: String,
      required: true
    },
    email: String,
    specialization: [String]
  },
  // Consultation Details
  caseType: {
    type: String,
    required: [true, 'Case type is required'],
    enum: [
      'Criminal Law',
      'Civil Law',
      'Family Law',
      'Corporate Law',
      'Property Law',
      'Labour Law',
      'Tax Law',
      'Constitutional Law',
      'Consumer Protection',
      'Intellectual Property',
      'Video Consultation',
      'Other'
    ]
  },
  consultationType: {
    type: String,
    enum: ['in-person', 'video'],
    default: 'in-person'
  },
  caseDescription: {
    type: String,
    required: [true, 'Case description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required']
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required']
  },
  // Consultation Status
  status: {
    type: String,
    enum: ['pending', 'pending_payment', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  // Video Call Data
  videoCallData: {
    roomId: String,
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    recordingUrl: String
  },
  // Payment Information
  payment: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  // Razorpay Payment Fields
  amount: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAt: Date,
  // Notes and Follow-up
  notes: {
    type: String
  },
  lawyerNotes: {
    type: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  // Rating and Review
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  },
  reviewedAt: Date,
  // Documents (stored as base64 in database)
  documents: [{
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: String,
      enum: ['client', 'professional'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    data: {
      type: String, // base64 encoded file data
      required: true
    },
    // Visibility control - who can see this document
    visibleTo: {
      type: String,
      enum: ['both', 'client-only', 'professional-only'],
      default: 'both'
    },
    isHidden: {
      type: Boolean,
      default: false // If true, document is hidden from all users
    }
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date
});

// Indexes for better query performance
consultationSchema.index({ clientId: 1, createdAt: -1 });
consultationSchema.index({ lawyerId: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ preferredDate: 1 });

// Update the updatedAt timestamp before saving
consultationSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  
  // Set timestamp based on status change
  if (this.isModified('status')) {
    if (this.status === 'confirmed' && !this.confirmedAt) {
      this.confirmedAt = Date.now();
    } else if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = Date.now();
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = Date.now();
    }
  }
});

// Virtual for consultation duration
consultationSchema.virtual('scheduledDateTime').get(function() {
  if (this.preferredDate && this.preferredTime) {
    return `${this.preferredDate.toDateString()} at ${this.preferredTime}`;
  }
  return null;
});

// Method to get consultation summary
consultationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    clientId: this.clientId,
    lawyerId: this.lawyerId,
    clientName: this.clientInfo.name,
    lawyerName: this.lawyerInfo.name,
    caseType: this.caseType,
    preferredDate: this.preferredDate,
    preferredTime: this.preferredTime,
    status: this.status,
    createdAt: this.createdAt
  };
};

// Static method to get consultations by client
consultationSchema.statics.getByClient = function(clientId, options = {}) {
  const query = this.find({ clientId })
    .populate('lawyerId', 'name email specialization rating')
    .sort({ createdAt: -1 });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to get consultations by lawyer
consultationSchema.statics.getByLawyer = function(lawyerId, options = {}) {
  const query = this.find({ lawyerId })
    .populate('clientId', 'name email phone')
    .sort({ createdAt: -1 });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
