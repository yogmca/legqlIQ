# LegalIQ - Legal Services Platform

A comprehensive full-stack legal services platform inspired by Practo, featuring lawyer directory, consultation booking, video consultations, and user authentication with Google OAuth 2.0 integration.

## 🎯 Overview

**LegalIQ** is a modern legal services platform that connects clients with verified lawyers. The application features a Practo-inspired design with MongoDB-based user authentication, consultation booking system, and Google OAuth 2.0 login.

## ✨ Key Features

### 🔐 Authentication & User Management
- **Email/Phone Registration & Login** - Secure user authentication with JWT tokens
- **Google OAuth 2.0** - One-click login with Google account
- **User Profiles** - Manage personal information and consultation history
- **Password Encryption** - Bcrypt-based secure password hashing
- **Session Management** - Persistent login with token-based authentication

### 👨‍⚖️ Lawyer Directory
- **Dynamic Search** - Real-time search across lawyer profiles
- **Advanced Filtering** - Filter by specialization, location, and experience
- **Lawyer Profiles** - Detailed information including education, experience, and reviews
- **Lazy Loading** - Efficient pagination for better performance
- **Web Scraping** - Automated data fetching from Karnataka Bar Association

### 📅 Consultation Booking
- **MongoDB Integration** - Persistent consultation records
- **User-Lawyer Relationships** - Linked consultations with user and lawyer profiles
- **Calendar Picker** - Interactive date and time selection
- **Booking Management** - View, update, and cancel consultations
- **Status Tracking** - Track consultation status (pending, confirmed, completed)

### 🎥 Video Consultations
- **WebRTC P2P** - Direct peer-to-peer video calls
- **Socket.io Signaling** - Real-time connection establishment
- **Screen Sharing** - Share documents during consultations
- **Chat Integration** - Text chat alongside video calls

### 🎨 Modern UI/UX
- **Practo-Inspired Design** - Clean, professional healthcare-style interface
- **Responsive Layout** - Works seamlessly on all devices
- **Gradient Themes** - Modern purple-blue gradient design
- **Loading States** - Smooth loading indicators and transitions
- **Error Handling** - User-friendly error messages

## 📁 Project Structure

```
karnataka-bar-association/
├── backend/                           # Node.js Express backend
│   ├── config/
│   │   └── passport.js               # Google OAuth configuration
│   ├── controllers/
│   │   ├── authController.js         # Authentication logic
│   │   └── consultationController.js # Consultation CRUD operations
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT verification middleware
│   ├── models/
│   │   ├── User.js                   # User schema with OAuth support
│   │   ├── Lawyer.js                 # Lawyer profile schema
│   │   └── Consultation.js           # Consultation booking schema
│   ├── routes/
│   │   ├── authRoutes.js             # Auth & OAuth routes
│   │   └── consultationRoutes.js     # Consultation API routes
│   ├── server.js                     # Main server file
│   ├── lawyersData.js                # Fallback lawyer data
│   ├── package.json                  # Backend dependencies
│   └── .env                          # Backend environment variables
├── src/                              # React frontend
│   ├── components/
│   │   ├── Homepage.jsx              # Practo-style landing page
│   │   ├── Login.jsx                 # Login with Google OAuth
│   │   ├── Register.jsx              # Two-step registration
│   │   ├── LawyerCard.jsx            # Lawyer profile cards
│   │   ├── SearchBar.jsx             # Search functionality
│   │   ├── FilterSection.jsx         # Filter controls
│   │   ├── ConsultationForm.jsx      # Booking form with calendar
│   │   ├── AppointmentManager.jsx    # View/manage bookings
│   │   └── VideoConsultation.jsx     # WebRTC video calls
│   ├── services/
│   │   ├── authService.js            # Authentication API client
│   │   └── lawyerService.js          # Lawyer data API client
│   ├── App.jsx                       # Main app with routing
│   └── main.jsx                      # React entry point
├── .env                              # Frontend environment variables
├── README.md                         # This file
├── GOOGLE_OAUTH_SETUP.md             # Google OAuth setup guide
├── VIDEO_CONSULTATION_GUIDE.md       # Video consultation documentation
└── package.json                      # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   cd karnataka-bar-association
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**

   **Frontend** (`.env`):
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

   **Backend** (`backend/.env`):
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/legaliq
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Session
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   
   # URLs
   CLIENT_URL=http://localhost:5173
   SERVER_URL=http://localhost:4000
   
   # Google OAuth (see GOOGLE_OAUTH_SETUP.md)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on: `http://localhost:4000`

7. **Start the frontend** (in a new terminal)
   ```bash
   cd karnataka-bar-association
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

8. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 🔑 Google OAuth Setup

To enable Google login, follow the detailed setup guide in [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md).

**Quick steps:**
1. Create a Google Cloud project
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add credentials to `backend/.env`
6. Restart the backend server

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/register` | POST | No | Register new user |
| `/login` | POST | No | Login with email/phone |
| `/google` | GET | No | Initiate Google OAuth |
| `/google/callback` | GET | No | Google OAuth callback |
| `/profile` | GET | Yes | Get user profile |
| `/profile` | PUT | Yes | Update user profile |
| `/logout` | POST | Yes | Logout user |

### Consultations (`/api/consultations-db`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | Yes | Book consultation |
| `/` | GET | Yes | Get user's consultations |
| `/:id` | GET | Yes | Get consultation details |
| `/:id` | PUT | Yes | Update consultation |
| `/:id` | DELETE | Yes | Cancel consultation |

### Lawyers (`/api/lawyers`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Get lawyers (paginated) |
| `/search` | GET | No | Search lawyers |
| `/refresh` | POST | No | Refresh cache |

## 🗄️ Database Schema

### User Model
```javascript
{
  googleId: String,           // Google OAuth ID
  name: String,               // Full name
  email: String,              // Email (unique)
  phone: String,              // Phone number
  password: String,           // Hashed password
  profilePicture: String,     // Profile image URL
  role: String,               // 'user' or 'lawyer'
  isVerified: Boolean,        // Email verification status
  createdAt: Date,
  updatedAt: Date
}
```

### Consultation Model
```javascript
{
  clientId: ObjectId,         // Reference to User
  lawyerId: ObjectId,         // Reference to Lawyer
  lawyerName: String,
  name: String,               // Client name
  phone: String,
  email: String,
  caseType: String,
  preferredDate: Date,
  preferredTime: String,
  caseDescription: String,
  status: String,             // 'pending', 'confirmed', 'completed', 'cancelled'
  videoCallData: Object,      // WebRTC connection data
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Features in Detail

### User Registration & Login
- Two-step registration process with progress indicator
- Email/phone and password authentication
- Google OAuth 2.0 one-click login
- JWT token-based session management
- Secure password hashing with bcrypt

### Consultation Booking
- Interactive calendar date picker
- Time slot selection
- Case type categorization
- Detailed case description
- Real-time availability checking
- Email/SMS notifications (configurable)

### Video Consultations
- WebRTC peer-to-peer video calls
- Socket.io for signaling
- Screen sharing capability
- Text chat integration
- Connection quality indicators

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
- `VITE_API_URL` - Backend API URL

**Backend** (`backend/.env`):
- `PORT` - Server port (default: 4000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `SESSION_SECRET` - Session encryption secret
- `CLIENT_URL` - Frontend URL
- `SERVER_URL` - Backend URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Or check MongoDB service status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux
```

### Google OAuth Not Working
- Verify credentials in `backend/.env`
- Check redirect URIs in Google Console
- Ensure callback URL matches exactly
- See [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) for details

### Backend Server Won't Start
```bash
# Kill processes on port 4000
lsof -ti:4000 | xargs kill -9

# Restart backend
cd backend && npm start
```

### Frontend Can't Connect to Backend
- Verify backend is running on port 4000
- Check `VITE_API_URL` in frontend `.env`
- Ensure CORS is enabled in backend

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for JWT and sessions in production
3. **Enable HTTPS** in production
4. **Implement rate limiting** on API endpoints
5. **Validate all user inputs** on backend
6. **Use MongoDB Atlas** with IP whitelisting in production
7. **Rotate OAuth credentials** regularly
8. **Enable 2FA** on Google Cloud account

## 📚 Additional Documentation

- [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) - Complete Google OAuth setup guide
- [`VIDEO_CONSULTATION_GUIDE.md`](./VIDEO_CONSULTATION_GUIDE.md) - WebRTC video consultation documentation
- [`WEBRTC_P2P_GUIDE.md`](./WEBRTC_P2P_GUIDE.md) - Peer-to-peer connection guide
- [`PEER_CONNECTION_EXPLAINED.md`](./PEER_CONNECTION_EXPLAINED.md) - WebRTC peer connection details

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy `dist` folder
3. Set environment variable: `VITE_API_URL=https://api.yourdomain.com/api`

### Backend (Heroku/Railway/DigitalOcean)
1. Set all environment variables
2. Use MongoDB Atlas for database
3. Enable HTTPS
4. Update Google OAuth redirect URIs
5. Set `NODE_ENV=production`

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legaliq
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

© 2026 LegalIQ. All rights reserved.

## 📞 Support

For technical issues:
- Check the troubleshooting section
- Review additional documentation files
- Check backend console logs for errors

For legal services inquiries:
- Contact Karnataka Bar Association directly

## 🙏 Acknowledgments

- Inspired by Practo's healthcare platform design
- Built with React, Node.js, Express, and MongoDB
- Uses Passport.js for authentication
- WebRTC for video consultations

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-19  
**Status**: Production Ready (with Google OAuth credentials)
