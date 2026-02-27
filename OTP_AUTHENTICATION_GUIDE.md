# OTP Authentication Guide - LegalIQ

## Overview

LegalIQ now supports **Mobile OTP Authentication** for consultation bookings, providing a seamless and secure way for users to book legal consultations without creating a full account upfront.

## Features

### 1. **Dual Login Methods**
- **Fill Form**: Traditional form-based consultation booking
- **Login with Mobile OTP**: Quick authentication using phone number verification

### 2. **OTP Security Features**
- ✅ 6-digit OTP generation
- ✅ 5-minute expiration time (TTL index in MongoDB)
- ✅ Maximum 3 verification attempts per OTP
- ✅ 30-second cooldown between OTP requests
- ✅ One-time use verification
- ✅ Automatic user creation on first login

### 3. **User Experience**
- **Step 1**: Enter mobile number
- **Step 2**: Receive OTP (displayed in console for development)
- **Step 3**: Enter 6-digit OTP
- **Step 4**: Auto-login and pre-fill consultation form

## Backend Implementation

### Database Schema

#### OTP Model (`backend/models/OTP.js`)
```javascript
{
  phone: String (required, indexed),
  otp: String (required),
  createdAt: Date (default: now, expires after 5 minutes),
  verified: Boolean (default: false),
  attempts: Number (default: 0, max: 3)
}
```

**Key Features:**
- TTL index automatically deletes expired OTPs after 5 minutes
- Tracks verification attempts to prevent brute force
- Indexed phone field for fast lookups

### API Endpoints

#### 1. Send OTP
```http
POST /api/otp/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

**Validation:**
- Phone must be 10 digits
- Must start with 6-9 (Indian mobile numbers)

#### 2. Verify OTP
```http
POST /api/otp/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phone": "9876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client"
  }
}
```

**Behavior:**
- If user exists: Returns existing user data
- If new user: Creates user with phone number and returns new user data
- Marks OTP as verified
- Generates JWT token for authentication

**Error Cases:**
- Invalid OTP: `{ "message": "Invalid OTP" }`
- Expired OTP: `{ "message": "OTP has expired" }`
- Max attempts: `{ "message": "Maximum verification attempts exceeded" }`

#### 3. Resend OTP
```http
POST /api/otp/resend-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully",
  "otp": "654321"  // Only in development mode
}
```

**Validation:**
- 30-second cooldown between requests
- Deletes previous OTP before generating new one

## Frontend Implementation

### ConsultationForm Component

#### State Management
```javascript
const [loginMethod, setLoginMethod] = useState('form'); // 'form' or 'otp'
const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'verify'
const [phoneNumber, setPhoneNumber] = useState('');
const [otp, setOtp] = useState(['', '', '', '', '', '']);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userData, setUserData] = useState(null);
```

#### UI Components

**1. Login Method Tabs**
```jsx
<div className="login-method-tabs">
  <button className={`tab-btn ${loginMethod === 'form' ? 'active' : ''}`}>
    Fill Form
  </button>
  <button className={`tab-btn ${loginMethod === 'otp' ? 'active' : ''}`}>
    Login with Mobile OTP
  </button>
</div>
```

**2. Phone Number Input**
```jsx
<input
  type="tel"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
  placeholder="10-digit mobile number"
  maxLength="10"
/>
<button onClick={handleSendOTP}>Send OTP</button>
```

**3. OTP Input (6 digits)**
```jsx
<div className="otp-inputs">
  {otp.map((digit, index) => (
    <input
      key={index}
      id={`otp-${index}`}
      type="text"
      maxLength="1"
      value={digit}
      onChange={(e) => handleOtpChange(index, e.target.value)}
    />
  ))}
</div>
```

**Features:**
- Auto-focus next input on digit entry
- Backspace navigation to previous input
- Only accepts numeric input

**4. OTP Actions**
```jsx
<button onClick={handleVerifyOTP}>Verify OTP</button>
<button onClick={handleResendOTP} disabled={resendTimer > 0}>
  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
</button>
<button onClick={() => setOtpStep('phone')}>Change Number</button>
```

### CSS Styling

#### Key Classes
- `.login-method-tabs` - Tab navigation
- `.otp-login-section` - OTP login container
- `.otp-inputs` - 6-digit OTP input grid
- `.otp-icon` - Animated emoji icons
- `.logged-in-banner` - Success message after login

#### Responsive Design
- Desktop: 6 OTP inputs (50px × 56px)
- Mobile: 6 OTP inputs (42px × 48px)
- Full-width buttons on mobile

## User Flow

### New User Flow
```
1. Click "Book Consultation" on lawyer card
2. Select "Login with Mobile OTP" tab
3. Enter 10-digit mobile number
4. Click "Send OTP"
5. Receive OTP (check console in dev mode)
6. Enter 6-digit OTP
7. Click "Verify OTP"
8. ✅ User account created automatically
9. ✅ JWT token stored in localStorage
10. ✅ Form pre-filled with phone number
11. Complete consultation details
12. Submit booking
```

### Existing User Flow
```
1. Click "Book Consultation" on lawyer card
2. Select "Login with Mobile OTP" tab
3. Enter registered mobile number
4. Click "Send OTP"
5. Receive OTP
6. Enter 6-digit OTP
7. Click "Verify OTP"
8. ✅ Logged in with existing account
9. ✅ Form pre-filled with saved data (name, email, phone)
10. Complete consultation details
11. Submit booking
```

## Security Considerations

### Current Implementation (Development)
- ✅ OTP displayed in console for testing
- ✅ 5-minute expiration
- ✅ 3 attempt limit
- ✅ 30-second resend cooldown
- ✅ One-time use verification

### Production Recommendations

#### 1. SMS Integration
Replace console.log with actual SMS service:

**Option A: Twilio**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: `Your LegalIQ OTP is: ${otp}. Valid for 5 minutes.`,
  from: '+1234567890',
  to: `+91${phone}`
});
```

**Option B: AWS SNS**
```javascript
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

await sns.publish({
  Message: `Your LegalIQ OTP is: ${otp}. Valid for 5 minutes.`,
  PhoneNumber: `+91${phone}`
}).promise();
```

**Option C: MSG91 (India-specific)**
```javascript
const axios = require('axios');

await axios.get('https://api.msg91.com/api/v5/otp', {
  params: {
    authkey: process.env.MSG91_AUTH_KEY,
    mobile: phone,
    otp: otp
  }
});
```

#### 2. Remove OTP from Response
```javascript
// ❌ Development
res.json({ message: 'OTP sent', otp: otp });

// ✅ Production
res.json({ message: 'OTP sent successfully' });
```

#### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many OTP requests, please try again later'
});

app.use('/api/otp', otpLimiter);
```

#### 4. IP-based Throttling
```javascript
// Track OTP requests by IP
const requestTracker = new Map();

const checkIPThrottle = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const requests = requestTracker.get(ip) || [];
  
  // Remove requests older than 1 hour
  const recentRequests = requests.filter(time => now - time < 3600000);
  
  if (recentRequests.length >= 10) {
    return res.status(429).json({ 
      message: 'Too many requests from this IP' 
    });
  }
  
  recentRequests.push(now);
  requestTracker.set(ip, recentRequests);
  next();
};
```

#### 5. Phone Number Verification
```javascript
// Add phone verification service
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const isValidIndianNumber = (phone) => {
  try {
    const number = phoneUtil.parse(phone, 'IN');
    return phoneUtil.isValidNumber(number);
  } catch (error) {
    return false;
  }
};
```

## Testing

### Manual Testing Steps

#### 1. Test OTP Generation
```bash
curl -X POST http://localhost:4000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

Expected: `{ "message": "OTP sent successfully", "otp": "123456" }`

#### 2. Test OTP Verification (New User)
```bash
curl -X POST http://localhost:4000/api/otp/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'
```

Expected: User created + JWT token returned

#### 3. Test OTP Verification (Existing User)
```bash
# Use same phone number again
curl -X POST http://localhost:4000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

curl -X POST http://localhost:4000/api/otp/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"<new-otp>"}'
```

Expected: Existing user data returned

#### 4. Test Invalid OTP
```bash
curl -X POST http://localhost:4000/api/otp/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"000000"}'
```

Expected: `{ "message": "Invalid OTP" }`

#### 5. Test Resend OTP
```bash
curl -X POST http://localhost:4000/api/otp/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

Expected: New OTP generated

### Frontend Testing

1. **Open Consultation Form**
   - Navigate to homepage
   - Click "Book Consultation" on any lawyer card

2. **Test OTP Tab**
   - Click "Login with Mobile OTP" tab
   - Verify tab switches correctly

3. **Test Phone Input**
   - Enter invalid phone (e.g., "123")
   - Verify error message
   - Enter valid phone (e.g., "9876543210")
   - Click "Send OTP"
   - Check browser console for OTP

4. **Test OTP Input**
   - Enter OTP digits
   - Verify auto-focus to next input
   - Test backspace navigation
   - Click "Verify OTP"
   - Verify success banner appears

5. **Test Form Pre-fill**
   - Verify phone number is pre-filled
   - Verify phone field is read-only
   - Complete remaining fields
   - Submit consultation

## Environment Variables

Add to [`backend/.env`](backend/.env):
```env
# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_RESEND_COOLDOWN_SECONDS=30

# SMS Service (Production)
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OR AWS SNS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1

# OR MSG91
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=LGALIQ
```

## Database Indexes

Ensure these indexes exist in MongoDB:
```javascript
// OTP Collection
db.otps.createIndex({ "phone": 1 })
db.otps.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 300 })

// Users Collection
db.users.createIndex({ "phone": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true })
```

## Troubleshooting

### Issue: OTP not received
**Solution:** Check browser console (development mode) or SMS service logs (production)

### Issue: "Invalid OTP" error
**Possible Causes:**
1. OTP expired (>5 minutes)
2. Wrong OTP entered
3. OTP already used
4. Maximum attempts exceeded

**Solution:** Click "Resend OTP" to generate new code

### Issue: "Maximum verification attempts exceeded"
**Solution:** Wait 30 seconds and request new OTP

### Issue: User not created after OTP verification
**Check:**
1. MongoDB connection
2. User model validation
3. Backend console for errors

### Issue: Form not pre-filling after login
**Check:**
1. JWT token in localStorage
2. User data in response
3. Browser console for errors

## Future Enhancements

### Planned Features
- [ ] Email OTP as backup
- [ ] Remember device (skip OTP for 30 days)
- [ ] Biometric authentication
- [ ] Social login integration (Facebook, Apple)
- [ ] Multi-factor authentication (MFA)
- [ ] OTP via WhatsApp
- [ ] Voice call OTP for accessibility

### Performance Optimizations
- [ ] Redis caching for OTP storage
- [ ] Batch OTP sending for multiple users
- [ ] CDN for static assets
- [ ] Service worker for offline support

## Support

For issues or questions:
- **Email:** support@legaliq.com
- **Documentation:** `/karnataka-bar-association/README.md`
- **API Docs:** `/karnataka-bar-association/API_DOCUMENTATION.md`

---

**Last Updated:** February 19, 2026  
**Version:** 1.0.0  
**Author:** LegalIQ Development Team
