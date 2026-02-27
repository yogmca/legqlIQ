require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
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

// Import fallback data
const fallbackData = require('./lawyersData.js');

// In-memory cache to store scraped data
let lawyersCache = [];
let lastScraped = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// In-memory storage for consultations
let consultations = [];
let consultationIdCounter = 1;

// Web scraping function for Karnataka Bar Association
// Note: This is a template - you'll need to adjust selectors based on actual website structure
async function scrapeLawyers() {
  try {
    // Example URLs - replace with actual Karnataka Bar Association URLs
    const urls = [
      'https://www.karnatakabarassociation.org/lawyers', // Example URL
      // Add more URLs as needed
    ];

    const lawyers = [];

    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Adjust these selectors based on the actual website structure
        $('.lawyer-card, .advocate-profile, .member-listing').each((index, element) => {
          const lawyer = {
            id: Date.now() + index,
            name: $(element).find('.name, .lawyer-name, h3').first().text().trim(),
            barRegistrationNo: $(element).find('.registration, .bar-no').text().trim() || `KBA/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`,
            specialization: $(element).find('.specialization, .practice-area').text().split(',').map(s => s.trim()).filter(Boolean) || ['General Practice'],
            experience: parseInt($(element).find('.experience, .years').text().match(/\d+/)?.[0]) || 5,
            location: $(element).find('.location, .city, .address').text().trim() || 'Bangalore',
            court: $(element).find('.court, .practice-court').text().trim() || 'District Court',
            phone: $(element).find('.phone, .contact, .mobile').text().trim() || '+91 XXXXX XXXXX',
            email: $(element).find('.email, a[href^="mailto:"]').text().trim() || 'contact@example.com',
            address: $(element).find('.address, .office-address').text().trim() || 'Karnataka',
            languages: $(element).find('.languages').text().split(',').map(l => l.trim()).filter(Boolean) || ['English', 'Kannada'],
            education: $(element).find('.education, .qualification').text().trim() || 'LLB',
            description: $(element).find('.description, .bio, p').first().text().trim() || 'Experienced legal professional'
          };

          if (lawyer.name) {
            lawyers.push(lawyer);
          }
        });
      } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
      }
    }

    // If no lawyers were scraped, use fallback data
    if (lawyers.length === 0) {
      console.log('No data scraped, using fallback data...');
      return fallbackData.lawyersData;
    }

    return lawyers;
  } catch (error) {
    console.error('Error in scrapeLawyers:', error);
    // Return fallback data on error
    console.log('Error occurred, using fallback data...');
    return fallbackData.lawyersData;
  }
}

// Alternative: Search using Bar Council of India API or database
async function searchBarCouncilDatabase(searchTerm) {
  try {
    // This would connect to Bar Council of India's database if available
    // For now, returning empty array as placeholder
    console.log('Searching Bar Council database for:', searchTerm);
    return [];
  } catch (error) {
    console.error('Error searching Bar Council database:', error);
    return [];
  }
}

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

// Get initial lawyers
app.get('/api/lawyers', async (req, res) => {
  try {
    const { limit = 12, offset = 0 } = req.query;
    const Lawyer = require('./models/Lawyer');
    
    // Get lawyers from MongoDB
    let dbLawyers = [];
    try {
      const lawyersFromDB = await Lawyer.find({ isVerified: true }).lean();
      dbLawyers = lawyersFromDB.map(lawyer => ({
        id: lawyer._id.toString(),
        name: lawyer.name,
        barRegistrationNo: lawyer.barRegistrationNo,
        specialization: lawyer.specialization,
        experience: lawyer.experience,
        location: lawyer.location,
        court: lawyer.court,
        phone: lawyer.phone,
        email: lawyer.email,
        address: lawyer.address,
        languages: lawyer.languages,
        education: lawyer.education,
        description: lawyer.description,
        rating: lawyer.rating || 0,
        totalReviews: lawyer.totalReviews || 0
      }));
      console.log(`Found ${dbLawyers.length} lawyers in MongoDB`);
    } catch (dbError) {
      console.log('MongoDB query failed, will use fallback data');
    }
    
    // Check if cache is valid for fallback data
    if (!lawyersCache.length || !lastScraped || (Date.now() - lastScraped > CACHE_DURATION)) {
      console.log('Refreshing fallback data...');
      lawyersCache = await scrapeLawyers();
      lastScraped = Date.now();
    }

    // Combine MongoDB lawyers with fallback data
    const allLawyers = [...dbLawyers, ...lawyersCache];
    
    // Remove duplicates based on ID (handle both string and number IDs)
    const uniqueLawyers = allLawyers.filter((lawyer, index, self) =>
      index === self.findIndex((l) => String(l.id) === String(lawyer.id))
    );

    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedLawyers = uniqueLawyers.slice(start, end);

    res.json({
      data: paginatedLawyers,
      total: uniqueLawyers.length,
      hasMore: end < uniqueLawyers.length,
      offset: start,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ error: 'Failed to fetch lawyers' });
  }
});

// Search lawyers
app.get('/api/lawyers/search', async (req, res) => {
  try {
    const { q = '', specialization = 'All Specializations', location = 'All Locations', limit = 12, offset = 0 } = req.query;
    const Lawyer = require('./models/Lawyer');

    // Get lawyers from MongoDB
    let dbLawyers = [];
    try {
      const lawyersFromDB = await Lawyer.find({ isVerified: true }).lean();
      dbLawyers = lawyersFromDB.map(lawyer => ({
        id: lawyer._id.toString(),
        name: lawyer.name,
        barRegistrationNo: lawyer.barRegistrationNo,
        specialization: lawyer.specialization,
        experience: lawyer.experience,
        location: lawyer.location,
        court: lawyer.court,
        phone: lawyer.phone,
        email: lawyer.email,
        address: lawyer.address,
        languages: lawyer.languages,
        education: lawyer.education,
        description: lawyer.description,
        rating: lawyer.rating || 0,
        totalReviews: lawyer.totalReviews || 0
      }));
    } catch (dbError) {
      console.log('MongoDB query failed, will use fallback data');
    }

    // Ensure cache is populated
    if (!lawyersCache.length || !lastScraped || (Date.now() - lastScraped > CACHE_DURATION)) {
      lawyersCache = await scrapeLawyers();
      lastScraped = Date.now();
    }

    // Also try to search Bar Council database
    const barCouncilResults = await searchBarCouncilDatabase(q);
    const allLawyers = [...dbLawyers, ...lawyersCache, ...barCouncilResults];
    
    // Remove duplicates based on ID (handle both string and number IDs)
    const uniqueLawyers = allLawyers.filter((lawyer, index, self) =>
      index === self.findIndex((l) => String(l.id) === String(lawyer.id))
    );

    // Filter lawyers
    const filtered = uniqueLawyers.filter(lawyer => {
      const searchLower = q.toLowerCase();
      const matchesSearch = !q ||
        lawyer.name.toLowerCase().includes(searchLower) ||
        lawyer.location.toLowerCase().includes(searchLower) ||
        (Array.isArray(lawyer.specialization) && lawyer.specialization.some(spec => spec.toLowerCase().includes(searchLower))) ||
        lawyer.description.toLowerCase().includes(searchLower) ||
        lawyer.court.toLowerCase().includes(searchLower);

      const matchesSpecialization = specialization === 'All Specializations' ||
        (Array.isArray(lawyer.specialization) && lawyer.specialization.includes(specialization));

      const matchesLocation = location === 'All Locations' ||
        lawyer.location === location;

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
    console.error('Error searching lawyers:', error);
    res.status(500).json({ error: 'Failed to search lawyers' });
  }
});

// Refresh cache manually
app.post('/api/lawyers/refresh', async (req, res) => {
  try {
    console.log('Manually refreshing lawyer data...');
    lawyersCache = await scrapeLawyers();
    lastScraped = Date.now();
    res.json({ message: 'Cache refreshed successfully', count: lawyersCache.length });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

// Legacy consultation routes removed - now using MongoDB-based routes at /api/consultations

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    cachedLawyers: lawyersCache.length,
    lastScraped: lastScraped ? new Date(lastScraped).toISOString() : null,
    totalConsultations: consultations.length
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('🔌 WebSocket server ready for video consultations');
  console.log('Note: Update the scraping selectors based on actual Karnataka Bar Association website structure');
});
