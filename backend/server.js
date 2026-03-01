require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport'); // Now passport can access env vars
const http = require('http');
const { Server } = require('socket.io');
const SignalingService = require('./services/signalingService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Initialize WebRTC signaling service
const signalingService = new SignalingService(io);
signalingService.initialize();
console.log('✅ WebRTC Signaling Service initialized');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️  Server will continue without database functionality');
  });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'legaliq-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./routes/authRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const otpRoutes = require('./routes/otpRoutes');
const contactRoutes = require('./routes/contactRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const scraperRoutes = require('./routes/scraperRoutes');

// Now using ONLY MongoDB database for lawyer data
// No hardcoded fallback data or web scraping

// API Routes

// Auth routes
app.use('/api/auth', authRoutes);

// OTP routes
app.use('/api/otp', otpRoutes);

// Consultation routes (MongoDB-based, requires authentication)
app.use('/api/consultations', consultationRoutes);

// Contact routes
app.use('/api/contact', contactRoutes);

// Chatbot routes
app.use('/api/chatbot', chatbotRoutes);

// Web Scraper routes
app.use('/api/scraper', scraperRoutes);

// Get initial lawyers - ONLY from MongoDB database
app.get('/api/lawyers', async (req, res) => {
  try {
    const { limit = 12, offset = 0, professionalType = 'lawyer' } = req.query;
    const Lawyer = require('./models/Lawyer');
    
    // Get professionals from MongoDB ONLY, filtered by professional type
    const query = {
      isVerified: true,
      professionalType: professionalType
    };
    
    const professionalsFromDB = await Lawyer.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
      
    const dbProfessionals = professionalsFromDB.map(professional => ({
      id: professional._id.toString(),
      name: professional.name,
      professionalType: professional.professionalType,
      barRegistrationNo: professional.barRegistrationNo,
      registrationNo: professional.registrationNo,
      specialization: professional.specialization,
      experience: professional.experience,
      location: professional.location,
      court: professional.court,
      phone: professional.phone,
      email: professional.email,
      address: professional.address,
      languages: professional.languages,
      education: professional.education,
      description: professional.description,
      rating: professional.rating || 0,
      totalReviews: professional.totalReviews || 0
    }));
    
    console.log(`✅ Found ${dbProfessionals.length} verified ${professionalType}s in MongoDB`);

    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedProfessionals = dbProfessionals.slice(start, end);

    res.json({
      data: paginatedProfessionals,
      total: dbProfessionals.length,
      hasMore: end < dbProfessionals.length,
      offset: start,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('❌ Error fetching professionals from MongoDB:', error);
    res.status(500).json({
      error: 'Failed to fetch professionals',
      message: 'Please ensure MongoDB is connected and professionals are registered'
    });
  }
});

// Search lawyers - ONLY from MongoDB database
app.get('/api/lawyers/search', async (req, res) => {
  try {
    const { q = '', specialization = 'All Specializations', location = 'All Locations', limit = 12, offset = 0, professionalType = 'lawyer' } = req.query;
    const Lawyer = require('./models/Lawyer');

    // Get professionals from MongoDB ONLY, filtered by professional type
    const query = {
      isVerified: true,
      professionalType: professionalType
    };
    
    const professionalsFromDB = await Lawyer.find(query)
      .sort({ createdAt: -1 })
      .lean();
      
    const dbProfessionals = professionalsFromDB.map(professional => ({
      id: professional._id.toString(),
      name: professional.name,
      professionalType: professional.professionalType,
      barRegistrationNo: professional.barRegistrationNo,
      registrationNo: professional.registrationNo,
      specialization: professional.specialization,
      experience: professional.experience,
      location: professional.location,
      court: professional.court,
      phone: professional.phone,
      email: professional.email,
      address: professional.address,
      languages: professional.languages,
      education: professional.education,
      description: professional.description,
      rating: professional.rating || 0,
      totalReviews: professional.totalReviews || 0
    }));

    console.log(`✅ Searching ${dbProfessionals.length} ${professionalType}s in MongoDB`);

    // Filter professionals based on search criteria
    const filtered = dbProfessionals.filter(professional => {
      const searchLower = q.toLowerCase();
      const matchesSearch = !q ||
        professional.name.toLowerCase().includes(searchLower) ||
        professional.location.toLowerCase().includes(searchLower) ||
        (Array.isArray(professional.specialization) && professional.specialization.some(spec => spec.toLowerCase().includes(searchLower))) ||
        professional.description.toLowerCase().includes(searchLower) ||
        professional.court.toLowerCase().includes(searchLower);

      const matchesSpecialization = specialization === 'All Specializations' ||
        (Array.isArray(professional.specialization) && professional.specialization.includes(specialization));

      const matchesLocation = location === 'All Locations' ||
        professional.location === location;

      return matchesSearch && matchesSpecialization && matchesLocation;
    });

    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedResults = filtered.slice(start, end);

    res.json({
      data: paginatedResults,
      total: filtered.length,
      hasMore: end < filtered.length,
      offset: start,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('❌ Error searching professionals in MongoDB:', error);
    res.status(500).json({
      error: 'Failed to search professionals',
      message: 'Please ensure MongoDB is connected and professionals are registered'
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const Lawyer = require('./models/Lawyer');
    const lawyerCount = await Lawyer.countDocuments({ isVerified: true });
    
    res.json({
      status: 'ok',
      database: 'MongoDB',
      verifiedLawyers: lawyerCount,
      message: 'Using MongoDB database only - no hardcoded data'
    });
  } catch (error) {
    res.json({
      status: 'ok',
      database: 'MongoDB (connection issue)',
      verifiedLawyers: 0,
      message: 'MongoDB connection error'
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('🔌 WebSocket server ready for video consultations');
  console.log('📊 Using MongoDB database ONLY for lawyer data');
  console.log('✅ No hardcoded fallback data - lawyers must register through the system');
});
