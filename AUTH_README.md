# LegalIQ - Legal Services Platform

A comprehensive legal services platform inspired by Practo, featuring user authentication, lawyer directory, video consultations, and appointment management. Built with React, Node.js, Express, and MongoDB.

![LegalIQ Logo](https://img.shields.io/badge/LegalIQ-Legal%20Services-purple)

## 🌟 Features

### Authentication System
- **User Registration & Login** - Secure authentication with JWT tokens
- **Profile Management** - Users can manage their personal information
- **MongoDB Integration** - User data stored securely in MongoDB
- **Password Encryption** - Bcrypt for secure password hashing
- **Protected Routes** - Route protection for authenticated users

### Homepage (Practo-inspired)
- **Modern Landing Page** - Beautiful gradient design with floating cards
- **Search Functionality** - Quick search for lawyers by name, specialization, or location
- **Specialization Categories** - Browse lawyers by legal specialization
- **Feature Highlights** - Showcase platform benefits
- **Responsive Design** - Mobile-friendly interface

### Lawyer Directory
- **Advanced Search** - Search by name, specialization, location
- **Filter Options** - Filter by specialization and location
- **Pagination** - Load more functionality for better performance
- **Lawyer Profiles** - Detailed information about each lawyer
- **Real-time Updates** - Dynamic data fetching from backend

### Video Consultation
- **WebRTC Integration** - Peer-to-peer video calls
- **Secure Connections** - End-to-end encrypted video sessions
- **Appointment Booking** - Schedule consultations with lawyers
- **Consultation Management** - Track and manage appointments

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router DOM** - Client-side routing
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with gradients and animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Socket.io** - Real-time communication (for video calls)

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd karnataka-bar-association
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

#### Backend Environment (.env in backend folder)

Create `backend/.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/legaliq
# For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/legaliq

# JWT Configuration
JWT_SECRET=legaliq-secret-key-2024-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=4000
CLIENT_URL=http://localhost:5173
```

#### Frontend Environment (.env in root folder)

The `.env` file already exists with:

```env
VITE_API_URL=http://localhost:4000/api
```

### 5. Start MongoDB

#### Local MongoDB:
```bash
mongod
```

#### MongoDB Atlas:
Update the `MONGODB_URI` in `backend/.env` with your Atlas connection string.

### 6. Start the Application

#### Option 1: Start Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Option 2: Use the Start Script (if available)

```bash
./start.sh
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000

## 📁 Project Structure

```
karnataka-bar-association/
├── backend/
│   ├── controllers/
│   │   └── authController.js      # Authentication logic
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   └── User.js                # User schema
│   ├── routes/
│   │   └── authRoutes.js          # Auth endpoints
│   ├── server.js                  # Express server
│   ├── lawyersData.js             # Fallback lawyer data
│   ├── package.json
│   └── .env
├── src/
│   ├── components/
│   │   ├── Homepage.jsx           # Landing page
│   │   ├── Homepage.css
│   │   ├── Login.jsx              # Login component
│   │   ├── Login.css
│   │   ├── Register.jsx           # Registration component
│   │   ├── Register.css
│   │   ├── LawyerCard.jsx         # Lawyer profile card
│   │   ├── SearchBar.jsx          # Search functionality
│   │   ├── FilterSection.jsx     # Filter options
│   │   ├── ConsultationForm.jsx   # Booking form
│   │   ├── VideoConsultation.jsx  # Video call component
│   │   └── AppointmentManager.jsx # Appointment management
│   ├── services/
│   │   ├── authService.js         # Authentication API calls
│   │   └── lawyerService.js       # Lawyer API calls
│   ├── App.jsx                    # Main app with routing
│   ├── App.css
│   └── main.jsx                   # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "john@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543210"
}
```

### Lawyer Routes

#### Get Lawyers
```http
GET /api/lawyers?limit=12&offset=0
```

#### Search Lawyers
```http
GET /api/lawyers/search?q=criminal&specialization=Criminal%20Law&location=Bangalore
```

### Consultation Routes

#### Create Consultation
```http
POST /api/consultations
Content-Type: application/json

{
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "1234567890",
  "caseType": "Criminal",
  "preferredDate": "2024-12-25",
  "preferredTime": "10:00 AM",
  "caseDescription": "Need legal advice",
  "lawyerId": "123",
  "lawyerName": "Lawyer Name"
}
```

## 🎨 Key Features Explained

### 1. Authentication Flow
- Users register with email, phone, and password
- Passwords are hashed using bcrypt before storage
- JWT tokens are issued upon successful login
- Tokens are stored in localStorage
- Protected routes verify token before access

### 2. Homepage Design
- Gradient background with animated elements
- Floating cards with smooth animations
- Search bar with instant navigation
- Specialization cards with hover effects
- Responsive grid layouts

### 3. User Profile Management
- Two-step registration process
- Profile data stored in MongoDB
- Update profile functionality
- Secure password handling

### 4. Lawyer Directory
- Dynamic search and filtering
- Pagination for performance
- Detailed lawyer profiles
- Book consultation directly from profile

## 🔧 Configuration

### MongoDB Setup

#### Local MongoDB:
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Database will be created automatically

#### MongoDB Atlas (Cloud):
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env

### JWT Configuration

Change the `JWT_SECRET` in production:
```env
JWT_SECRET=your-super-secret-key-here
```

## 🚦 Running in Production

### Build Frontend
```bash
npm run build
```

### Environment Variables
Update all URLs to production domains:
- `MONGODB_URI` - Production MongoDB URL
- `JWT_SECRET` - Strong secret key
- `CLIENT_URL` - Production frontend URL
- `VITE_API_URL` - Production backend URL

### Deploy
- Frontend: Vercel, Netlify, or similar
- Backend: Heroku, Railway, DigitalOcean, or AWS
- Database: MongoDB Atlas

## 📱 Screenshots

### Homepage
Beautiful landing page with search and specialization categories

### Login/Register
Secure authentication with modern UI design

### Lawyer Directory
Browse and search verified legal professionals

### Video Consultation
Connect with lawyers through secure video calls

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Inspired by Practo's design and user experience
- Karnataka Bar Association for the concept
- React and Node.js communities

## 📞 Support

For support, email support@legaliq.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social media login (Google, Facebook)
- [ ] Payment integration
- [ ] Chat functionality
- [ ] Document upload and management
- [ ] Lawyer ratings and reviews
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Admin dashboard

---

**Made with ❤️ for the legal community**
