const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load environment variables FIRST (explicit path for PM2 compatibility)

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport'); // Now passport can access env vars
const http = require('http');
const { Server } = require('socket.io');
const SignalingService = require('./services/signalingService');
const ChatService = require('./services/chatService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Same-origin single-container deploy: reflect request origin.
    origin: process.env.CLIENT_URL || true,
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Initialize WebRTC signaling service
const signalingService = new SignalingService(io);
signalingService.initialize();
console.log('✅ WebRTC Signaling Service initialized');

// Initialize Chat service
const chatService = new ChatService(io);
chatService.initialize();
console.log('✅ Chat Service initialized');

// MongoDB Connection
// Alpine (musl libc) in the Docker image often fails the SRV DNS lookup that
// mongodb+srv:// requires ("querySrv ENOTFOUND ..."). Force Node's resolver to
// use public DNS servers, and if the connection string is mongodb+srv:// we
// pre-resolve the SRV/TXT records ourselves and build a standard mongodb://
// connection string so the driver never has to do the failing SRV lookup.
const dns = require('dns');
const dnsPromises = dns.promises;
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  console.log('🌐 DNS resolvers set to public servers for SRV lookups');
} catch (e) {
  console.warn('⚠️  Could not set custom DNS servers:', e.message);
}

let MONGODB_URI = process.env.MONGODB_URI;

/**
 * Convert a mongodb+srv:// URI into a standard mongodb:// URI by resolving the
 * SRV (host list) and TXT (connection options) records via our chosen DNS
 * servers. This avoids the driver's internal SRV lookup that fails on Alpine.
 */
async function resolveSrvUri(srvUri) {
  // mongodb+srv://user:pass@host/dbAndOptions
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(.*)$/);
  if (!match) throw new Error('Unrecognized mongodb+srv:// URI format');

  const [, credentials, hostname, rest] = match;
  const srvHost = `_mongodb._tcp.${hostname}`;

  console.log(`🔎 Resolving SRV records for ${srvHost} ...`);
  const srvRecords = await dnsPromises.resolveSrv(srvHost);
  if (!srvRecords || srvRecords.length === 0) {
    throw new Error('No SRV records returned');
  }
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');

  // TXT record holds default connection options (e.g. authSource, replicaSet)
  let txtOptions = '';
  try {
    const txtRecords = await dnsPromises.resolveTxt(hostname);
    txtOptions = txtRecords.map((parts) => parts.join('')).join('&');
  } catch (e) {
    console.warn('⚠️  Could not read TXT options:', e.message);
  }

  // Split off path (/db) and existing query string from `rest`
  let dbPath = '';
  let userQuery = '';
  const qIndex = rest.indexOf('?');
  if (qIndex >= 0) {
    dbPath = rest.slice(0, qIndex);
    userQuery = rest.slice(qIndex + 1);
  } else {
    dbPath = rest;
  }

  // SRV implies TLS by default
  const mergedParams = new URLSearchParams();
  if (txtOptions) {
    new URLSearchParams(txtOptions).forEach((v, k) => mergedParams.set(k, v));
  }
  if (userQuery) {
    new URLSearchParams(userQuery).forEach((v, k) => mergedParams.set(k, v));
  }
  if (!mergedParams.has('ssl') && !mergedParams.has('tls')) {
    mergedParams.set('ssl', 'true');
  }
  if (!mergedParams.has('authSource')) {
    mergedParams.set('authSource', 'admin');
  }

  const standardUri = `mongodb://${credentials}@${hosts}${dbPath}?${mergedParams.toString()}`;
  console.log('✅ Built standard mongodb:// URI from SRV records');
  return standardUri;
}

/**
 * Build a standard mongodb:// URI WITHOUT any SRV/DNS-TXT lookup, using the
 * deterministic Atlas shard hostname pattern. Render's network blocks SRV
 * queries entirely, but normal A-record resolution of the shard hostnames
 * works. We seed all 3 shard hosts; the driver discovers the replica set
 * automatically (no replicaSet name needed).
 */
function buildStandardUriFromAtlasPattern(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(.*)$/);
  if (!match) throw new Error('Unrecognized mongodb+srv:// URI format');

  const [, credentials, hostname, rest] = match;
  // hostname e.g. "legaliq.b4xrthx.mongodb.net" -> cluster "legaliq", domain "b4xrthx.mongodb.net"
  const dotIndex = hostname.indexOf('.');
  const cluster = hostname.slice(0, dotIndex);
  const domain = hostname.slice(dotIndex + 1);

  const hosts = [0, 1, 2]
    .map((n) => `${cluster}-shard-00-0${n}.${domain}:27017`)
    .join(',');

  // Split path (/db) and existing query string
  let dbPath = '';
  let userQuery = '';
  const qIndex = rest.indexOf('?');
  if (qIndex >= 0) {
    dbPath = rest.slice(0, qIndex);
    userQuery = rest.slice(qIndex + 1);
  } else {
    dbPath = rest;
  }

  const params = new URLSearchParams(userQuery);
  params.set('ssl', 'true');
  params.set('authSource', 'admin');
  // Let the driver auto-discover topology from the seed list.

  const standardUri = `mongodb://${credentials}@${hosts}${dbPath}?${params.toString()}`;
  console.log('🧩 Built standard mongodb:// URI from Atlas shard pattern (no SRV needed)');
  return standardUri;
}

/**
 * Build a connection using the Atlas shard hostnames resolved to IP addresses
 * via our chosen public DNS resolver (dns.resolve4 honours dns.setServers,
 * unlike getaddrinfo which uses the broken /etc/resolv.conf). We connect by IP
 * and set tlsAllowInvalidHostnames so the Atlas TLS cert (CN = hostname) is
 * still accepted. This bypasses the container's broken OS resolver entirely.
 */
async function buildIpBasedConnection(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(.*)$/);
  if (!match) throw new Error('Unrecognized mongodb+srv:// URI format');

  const [, credentials, hostname, rest] = match;
  const dotIndex = hostname.indexOf('.');
  const cluster = hostname.slice(0, dotIndex);
  const domain = hostname.slice(dotIndex + 1);

  const shardHosts = [0, 1, 2].map((n) => `${cluster}-shard-00-0${n}.${domain}`);

  // Resolve each shard host to an IP using the public DNS resolver.
  const resolvedHosts = [];
  for (const h of shardHosts) {
    const addrs = await dnsPromises.resolve4(h);
    if (addrs && addrs.length > 0) {
      resolvedHosts.push(`${addrs[0]}:27017`);
      console.log(`🔗 Resolved ${h} -> ${addrs[0]}`);
    }
  }
  if (resolvedHosts.length === 0) {
    throw new Error('Could not resolve any shard host to an IP');
  }

  // Parse db path + query from the original URI
  let dbPath = '';
  let userQuery = '';
  const qIndex = rest.indexOf('?');
  if (qIndex >= 0) {
    dbPath = rest.slice(0, qIndex);
    userQuery = rest.slice(qIndex + 1);
  } else {
    dbPath = rest;
  }

  const params = new URLSearchParams(userQuery);
  params.set('authSource', 'admin');

  const uri = `mongodb://${credentials}@${resolvedHosts.join(',')}${dbPath}?${params.toString()}`;
  return {
    uri,
    options: {
      tls: true,
      tlsAllowInvalidHostnames: true, // connecting by IP; cert CN is the hostname
    },
  };
}

async function tryConnect(uri, label, extraOptions = {}) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    ...extraOptions,
  });
  console.log(`✅ MongoDB connected successfully (${label})`);
}

/**
 * Fix a common mistake: an un-encoded special character (e.g. '@') in the
 * password breaks URL parsing ("Invalid URL: mongodb://user:Diya@2012@host").
 * Detect extra '@' before the host section and URL-encode the password.
 */
function sanitizeMongoUri(uri) {
  const schemeMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return uri;
  const scheme = schemeMatch[1];
  let afterScheme = schemeMatch[2];

  // Everything up to the LAST '@' is credentials; the rest is host/path.
  const lastAt = afterScheme.lastIndexOf('@');
  if (lastAt === -1) return uri; // no credentials
  const creds = afterScheme.slice(0, lastAt);
  const hostAndRest = afterScheme.slice(lastAt + 1);

  const colon = creds.indexOf(':');
  if (colon === -1) return uri; // no password
  const user = creds.slice(0, colon);
  const pass = creds.slice(colon + 1);

  // If the password contains characters that would break URL parsing and is
  // not already percent-encoded, encode it.
  const needsEncoding = /[@/:?#\[\]]/.test(pass) && !/%[0-9A-Fa-f]{2}/.test(pass);
  if (!needsEncoding) return uri;

  const encodedPass = encodeURIComponent(pass);
  console.log('🧼 Sanitized MONGODB_URI: URL-encoded special chars in password');
  return `${scheme}${user}:${encodedPass}@${hostAndRest}`;
}

async function connectToMongo() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    console.log('⚠️  Server will continue without database functionality');
    return;
  }

  MONGODB_URI = sanitizeMongoUri(MONGODB_URI);

  const isSrv = MONGODB_URI.startsWith('mongodb+srv://');

  // Build the list of connection strategies to try, in order.
  const attempts = [];

  if (isSrv) {
    // 1) Pre-resolve SRV ourselves (works if outbound SRV DNS is allowed).
    attempts.push({
      label: 'SRV pre-resolved',
      prepare: async () => ({ uri: await resolveSrvUri(MONGODB_URI) }),
    });
    // 2) Deterministic Atlas shard pattern by hostname (needs working getaddrinfo).
    attempts.push({
      label: 'Atlas shard pattern (no SRV)',
      prepare: async () => ({ uri: buildStandardUriFromAtlasPattern(MONGODB_URI) }),
    });
    // 3) Atlas shard hosts resolved to IPs via public DNS (bypasses the broken
    //    OS resolver / getaddrinfo entirely). Most reliable on Render.
    attempts.push({
      label: 'Atlas shard IPs (public DNS resolve4)',
      prepare: async () => await buildIpBasedConnection(MONGODB_URI),
    });
    // 4) Last resort: hand the original mongodb+srv:// to the driver.
    attempts.push({
      label: 'original mongodb+srv:// (driver SRV)',
      prepare: async () => ({ uri: MONGODB_URI }),
    });
  } else {
    attempts.push({
      label: 'standard URI',
      prepare: async () => ({ uri: MONGODB_URI }),
    });
  }

  for (const attempt of attempts) {
    try {
      const { uri, options } = await attempt.prepare();
      await tryConnect(uri, attempt.label, options || {});
      return; // connected
    } catch (err) {
      console.warn(`⚠️  MongoDB connect attempt "${attempt.label}" failed: ${err.message}`);
    }
  }

  console.error('❌ All MongoDB connection attempts failed');
  console.log('⚠️  Server will continue without database functionality');
}

connectToMongo();

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Middleware
app.use(cors({
  // Single-container deploy serves frontend + backend from the SAME origin,
  // so requests are same-origin. Reflect the request origin to avoid CORS 404s
  // if CLIENT_URL is not explicitly set.
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
const articleRoutes = require('./routes/articles');
const chatRoutes = require('./routes/chatRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');

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

// Article routes
app.use('/api/articles', articleRoutes);

// Chat routes
app.use('/api/chats', chatRoutes);

// Sitemap routes (for SEO) - Available at both /api/sitemap and root level
app.use('/api/sitemap', sitemapRoutes);
app.use('/', sitemapRoutes); // Also serve at root for Google

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

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
      .exec(); // Use exec() instead of lean() to get full documents
    
    // Debug: Check if profilePicture exists in raw data
    if (professionalsFromDB.length > 0) {
      console.log('DEBUG: First professional from DB:', {
        name: professionalsFromDB[0].name,
        hasProfilePicture: !!professionalsFromDB[0].profilePicture,
        profilePictureLength: professionalsFromDB[0].profilePicture?.length || 0
      });
    }
      
    const dbProfessionals = professionalsFromDB.map(professional => ({
      id: professional._id.toString(),
      userId: professional.userId, // Include userId for chat functionality
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
      profilePicture: professional.profilePicture, // Include profile picture
      rating: professional.rating || 0,
      totalReviews: professional.totalReviews || 0,
      lastActive: professional.lastActive
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
      .exec(); // Use exec() instead of lean() to get full documents
      
    const dbProfessionals = professionalsFromDB.map(professional => ({
      id: professional._id.toString(),
      userId: professional.userId, // Include userId for chat functionality
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
      profilePicture: professional.profilePicture, // Include profile picture
      rating: professional.rating || 0,
      totalReviews: professional.totalReviews || 0,
      lastActive: professional.lastActive
    }));

    console.log(`✅ Searching ${dbProfessionals.length} ${professionalType}s in MongoDB`);

    // Filter professionals based on search criteria
    const filtered = dbProfessionals.filter(professional => {
      const searchLower = q.toLowerCase();
      const matchesSearch = !q ||
        (professional.name && professional.name.toLowerCase().includes(searchLower)) ||
        (professional.location && professional.location.toLowerCase().includes(searchLower)) ||
        (Array.isArray(professional.specialization) && professional.specialization.some(spec => spec && spec.toLowerCase().includes(searchLower))) ||
        (professional.description && professional.description.toLowerCase().includes(searchLower)) ||
        (professional.court && professional.court.toLowerCase().includes(searchLower));

      const matchesSpecialization = specialization === 'All Specializations' ||
        (Array.isArray(professional.specialization) && professional.specialization.includes(specialization));

      // Handle location matching with Bangalore/Bengaluru alias
      let matchesLocation = location === 'All Locations';
      if (!matchesLocation && professional.location) {
        // Direct match
        if (professional.location === location) {
          matchesLocation = true;
        }
        // Handle Bangalore/Bengaluru alias
        else if (
          (location.toLowerCase() === 'bangalore' || location.toLowerCase() === 'bengaluru') &&
          (professional.location.toLowerCase() === 'bangalore' || professional.location.toLowerCase() === 'bengaluru')
        ) {
          matchesLocation = true;
        }
      }

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

// Get locations from database
app.get('/api/locations', async (req, res) => {
  try {
    const Location = require('./models/Location');
    
    // Get all active locations from database
    const locations = await Location.getActiveLocations();
    
    console.log(`✅ Found ${locations.length} locations in database`);
    
    res.json({
      success: true,
      locations: locations,
      total: locations.length
    });
  } catch (error) {
    console.error('❌ Error fetching locations from database:', error);
    // Return empty array if error, frontend will use default locations
    res.json({
      success: false,
      locations: [],
      total: 0,
      message: 'Failed to fetch locations from database'
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

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('🔌 WebSocket server ready for video consultations');
  console.log('💬 Chat service ready for real-time messaging');
  console.log('📊 Using MongoDB database ONLY for lawyer data');
  console.log('✅ No hardcoded fallback data - lawyers must register through the system');
});

// Handle port already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Attempting to recover...`);
    console.error('   Try: pm2 delete all && pm2 start server.js --name backend');
    process.exit(1);
  } else {
    throw err;
  }
});
const lawyersRoutes = require('./routes/lawyersRoutes');
app.use('/api/lawyers', lawyersRoutes);
