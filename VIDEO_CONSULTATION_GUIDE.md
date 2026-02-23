# Video Consultation Booking Feature - User Guide

## Overview

The Karnataka Bar Association Lawyer Directory now includes a comprehensive video consultation booking system that allows users to:
- Book video consultations with lawyers
- Manage their appointments
- Conduct video calls directly from the platform

## Features

### 1. Book Consultation
Users can book video consultations with any lawyer in the directory by clicking the "Book Consultation" button on lawyer cards.

#### Booking Form Fields:
- **Full Name** (required): Client's full name
- **Phone Number** (required): 10-digit Indian mobile number
- **Email Address** (required): Valid email address
- **Case Type** (required): Select from 11 case types including Criminal Law, Civil Law, Family Law, etc.
- **Preferred Date** (required): Choose a date (today to 3 months ahead)
- **Preferred Time** (required): Select from available time slots (9 AM - 5 PM)
- **Case Description** (required): Minimum 20 characters describing the case

#### Form Validation:
- Real-time validation for all fields
- Indian phone number format validation (10 digits starting with 6-9)
- Email format validation
- Date validation (cannot select past dates)
- Character count for case description

### 2. My Consultations Dashboard

Access your consultations by clicking the "My Consultations" button in the header navigation.

#### Three Tabs:
1. **Upcoming**: View pending and confirmed consultations
2. **Past**: View completed consultations
3. **Cancelled**: View cancelled appointments

#### Consultation Card Information:
- Lawyer name and avatar
- Case type
- Appointment date and time
- Client name
- Case description
- Status badge (Pending, Confirmed, Completed, Cancelled)

#### Actions Available:
- **Start Video Call**: Begin the video consultation (for upcoming appointments)
- **Cancel**: Cancel the appointment
- **Refresh**: Reload consultations list

### 3. Video Consultation Interface

When you start a video call, you'll see:

#### Video Features:
- **Remote Video**: Lawyer's video feed (main view)
- **Local Video**: Your video feed (picture-in-picture)
- **Connection Status**: Real-time connection indicator
- **Call Duration**: Timer showing consultation length

#### Controls:
- **Mute/Unmute**: Toggle microphone
- **Camera On/Off**: Toggle video
- **Chat**: Open text chat panel
- **End Call**: Terminate the consultation

#### Chat Panel:
- Send text messages during the call
- View message history
- Timestamps for all messages

## API Endpoints

### Backend API (Port 4000)

#### Create Consultation
```
POST /api/consultations
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "caseType": "Criminal Law",
  "preferredDate": "2026-02-20",
  "preferredTime": "10:00 AM",
  "caseDescription": "Need legal consultation regarding...",
  "lawyerId": 1,
  "lawyerName": "Adv. Rajesh Kumar",
  "lawyerEmail": "rajesh.kumar@kbalaw.in"
}
```

#### Get Consultations
```
GET /api/consultations?email=user@example.com&status=pending
```

#### Get Specific Consultation
```
GET /api/consultations/:id
```

#### Update Consultation
```
PATCH /api/consultations/:id
Content-Type: application/json

{
  "status": "completed",
  "videoCallData": {
    "duration": 1800,
    "endedAt": "2026-02-20T10:30:00Z"
  }
}
```

#### Delete Consultation
```
DELETE /api/consultations/:id
```

## Technical Implementation

### Frontend Components

1. **ConsultationForm.jsx**: Modal form for booking consultations
   - Form validation
   - Error handling
   - API integration

2. **VideoConsultation.jsx**: Video call interface
   - WebRTC integration (camera/microphone access)
   - Real-time chat
   - Call controls
   - Duration tracking

3. **AppointmentManager.jsx**: Consultation management dashboard
   - Tab navigation
   - Appointment listing
   - Status filtering
   - Action buttons

4. **LawyerCard.jsx**: Updated with "Book Consultation" button
   - Modal trigger
   - Consultation submission

### Backend Implementation

- **In-memory storage** for consultations (can be replaced with database)
- RESTful API endpoints
- CORS enabled for frontend communication
- Request validation
- Error handling

### Styling

All components include responsive CSS with:
- Mobile-first design
- Gradient themes matching the brand
- Smooth animations
- Accessible UI elements
- Professional color scheme

## Browser Compatibility

### Required Permissions:
- **Camera**: For video consultations
- **Microphone**: For audio during calls

### Supported Browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Usage Flow

### For Clients:

1. **Browse Lawyers**: Search and filter lawyers by specialization and location
2. **Select Lawyer**: Click "Book Consultation" on desired lawyer's card
3. **Fill Form**: Complete the consultation booking form
4. **Submit**: Receive confirmation with booking ID
5. **View Appointments**: Navigate to "My Consultations"
6. **Start Call**: Click "Start Video Call" at appointment time
7. **Conduct Consultation**: Use video, audio, and chat features
8. **End Call**: Complete the consultation

### For Lawyers (Future Enhancement):

- Receive booking notifications
- Accept/reject consultation requests
- View client information
- Join scheduled video calls
- Access consultation history

## Security Considerations

### Current Implementation:
- Client-side form validation
- CORS protection
- Input sanitization

### Recommended Enhancements:
- User authentication (JWT tokens)
- Encrypted video streams (HTTPS/WSS)
- Database storage with encryption
- Payment gateway integration
- Email/SMS notifications
- Calendar integration
- Session recording (with consent)

## Future Enhancements

1. **Authentication System**
   - User registration and login
   - Lawyer verification
   - Role-based access control

2. **Payment Integration**
   - Consultation fees
   - Payment gateway (Razorpay/Stripe)
   - Invoice generation

3. **Notifications**
   - Email confirmations
   - SMS reminders
   - Push notifications

4. **Advanced Features**
   - Screen sharing
   - Document upload
   - Session recording
   - Calendar sync
   - Rescheduling
   - Review and ratings

5. **Analytics**
   - Consultation statistics
   - Lawyer performance metrics
   - User engagement tracking

## Troubleshooting

### Camera/Microphone Not Working:
- Check browser permissions
- Ensure HTTPS connection (required for WebRTC)
- Try different browser
- Check device settings

### Consultation Not Appearing:
- Click "Refresh" button
- Check email filter
- Verify booking confirmation

### Video Quality Issues:
- Check internet connection
- Close other bandwidth-heavy applications
- Try disabling video and using audio only

## Support

For technical issues or questions:
- Email: support@kbalaw.in
- Phone: +91 XXXXX XXXXX
- Office: Karnataka Bar Association

## License

© 2026 Karnataka Bar Association. All rights reserved.
