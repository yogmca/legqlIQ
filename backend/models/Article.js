const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true,
    maxlength: 500
  },
  image: {
    type: String, // URL or path to uploaded image
    default: null
  },
  author: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    profession: {
      type: String,
      enum: ['lawyer', 'tax_consultant', 'auditor', 'admin'],
      required: true
    },
    profileImage: {
      type: String,
      default: null
    }
  },
  category: {
    type: String,
    enum: ['legal', 'tax', 'audit', 'general', 'case_study', 'news'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  externalUrl: {
    type: String,
    default: null
  },
  externalSource: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  adminNotes: {
    type: String,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  }
}, {
  timestamps: true
});

// Index for faster queries
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ 'author.userId': 1 });
articleSchema.index({ tags: 1 });

// Virtual for like count
articleSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
articleSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to calculate read time based on content
articleSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
  return this.readTime;
};

// Pre-save middleware to calculate read time
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.calculateReadTime();
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
