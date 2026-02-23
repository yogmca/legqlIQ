# Video Consultation with Razorpay Payment Integration Guide

## Overview

This guide explains the complete video consultation booking system with integrated Razorpay payment gateway. The feature allows clients to:

1. Browse lawyers available for video consultation
2. Book a video consultation slot
3. Pay securely using Razorpay
4. Join the video consultation after payment confirmation

## Features Implemented

### 1. Video Consultation List Page
- **Location**: `/video-consultations`
- **Component**: `VideoConsultationList.jsx`
- Displays all lawyers available for video consultation
- Search and filter functionality
- Shows consultation pricing (₹999 for 30 minutes)
- Real-time availability status

### 2. Payment Integration
- **Payment Gateway**: Razorpay
- Secure payment processing
- Order creation and verification
- Payment status tracking
- Automatic consultation confirmation after successful payment

### 3. Video Consultation Room
- **Location**: `/video-consultation/:id`
- WebRTC-based video calling
- Real-time audio/video communication
- Chat functionality
- Call duration tracking

### 4. Updated Lawyer Cards
- Two action buttons:
  - **"📅 Book Lawyer Visit"**: For in-person consultations
  - **"📹 Book Video Consultation"**: For online consultations

## File Structure

```
karnataka-bar-association/
├── src/
│   ├── components/
│   │   ├── VideoConsultationList.jsx      # Main consultation booking page
│   │   ├── VideoConsultationList.css      # Styling for consultation page
│   │   ├── VideoConsultation.jsx          # Video call component
│   │   ├── VideoConsultation.css          # Video call styling
│   │   ├── LawyerCard.jsx                 # Updated with video consultation button
│   │   └── Homepage.jsx                   # Updated navigation
│   ├── App.jsx                            # Updated routes
│   └── .env                               # Frontend environment variables
├── backend/
│   ├── controllers/
│   │   └── consultationController.js      # Payment & consultation logic
│   ├── routes/
│   │   └── consultationRoutes.js          # Payment routes
│   ├── models/
│   │   └── Consultation.js                # Updated model with payment fields
│   └── .env                               # Backend environment variables
└── index.html                             # Razorpay script included
```

## Setup Instructions

### 1. Install Dependencies

Backend dependencies are already installed:
```bash
cd backend
npm install razorpay crypto
```

### 2. Configure Razorpay

#### Get Razorpay Credentials:
1. Sign up at [https://razorpay.com/](https://razorpay.com/)
2. Go to **Settings > API Keys**
3. Generate **Test Keys** for development
4. Copy the **Key ID** and **Key Secret**

#### Update Backend Environment Variables:
Edit `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
```

#### Update Frontend Environment Variables:
Edit `.env` (root directory):
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
```

**Important**: The Key ID must match in both files!

### 3. Restart Servers

After updating environment variables:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

## User Flow

### Step 1: Navigate to Video Consultations
- Click **"Video Consultation"** in the header navigation
- Or click **"Book Video Consultation"** on any lawyer card
- Or use the homepage CTA button

### Step 2: Browse and Select Lawyer
- View all available lawyers
- Use search to find specific lawyers
- Filter by specialization
- See pricing: ₹999 for 30 minutes
- Click **"Book Video Consultation"** on desired lawyer

### Step 3: Fill Consultation Details
A modal appears with:
- Lawyer summary
- Consultation date picker
- Preferred time selector
- Case description textarea
- Payment summary showing total amount

### Step 4: Payment Processing
- Click **"Pay ₹999 & Book Consultation"**
- Razorpay checkout modal opens
- Choose payment method:
  - Credit/Debit Card
  - Net Banking
  - UPI
  - Wallets
- Complete payment securely

### Step 5: Payment Verification
- Backend verifies payment signature
- Consultation status updated to "confirmed"
- Payment details stored in database
- User redirected to video consultation room

### Step 6: Join Video Consultation
- Access camera and microphone
- See lawyer's video feed
- Control audio/video
- Use chat feature
- End call when consultation is complete

## API Endpoints

### Create Razorpay Order
```http
POST /api/consultations/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 999,
  "lawyerId": "lawyer_id",
  "lawyerName": "Lawyer Name",
  "consultationDate": "2024-01-15",
  "consultationTime": "10:00",
  "caseDescription": "Brief description"
}

Response:
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 99900,
  "currency": "INR",
  "consultationId": "consultation_id"
}
```

### Verify Payment
```http
POST /api/consultations/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "consultationId": "consultation_id"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "consultation": { ... }
}
```

### Get Consultation by ID
```http
GET /api/consultations/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "consultation": {
    "id": "consultation_id",
    "clientInfo": { ... },
    "lawyerInfo": { ... },
    "status": "confirmed",
    "paymentStatus": "paid",
    "amount": 999,
    ...
  }
}
```

## Database Schema Updates

### Consultation Model Fields Added:
```javascript
{
  consultationType: {
    type: String,
    enum: ['in-person', 'video'],
    default: 'in-person'
  },
  amount: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpay PaymentId: String,
  razorpaySignature: String,
  paidAt: Date
}
```

### Status Values:
- `pending_payment`: Consultation created, awaiting payment
- `confirmed`: Payment successful, consultation confirmed
- `completed`: Video consultation finished
- `cancelled`: Consultation cancelled

## Security Features

### 1. Payment Signature Verification
```javascript
const sign = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSign = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(sign.toString())
  .digest('hex');
```

### 2. Authentication Required
- All payment endpoints require JWT authentication
- User must be logged in to book consultations
- Authorization checks on consultation access

### 3. HTTPS in Production
- Always use HTTPS in production
- Razorpay requires secure connections
- Protect API keys and secrets

## Testing

### Test Mode
Razorpay provides test cards for development:

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay`

### Test Scenarios:
1. **Successful Payment**: Use test card above
2. **Failed Payment**: Card `4000 0000 0000 0002`
3. **Payment Timeout**: Don't complete payment

## Troubleshooting

### Issue: Razorpay script not loading
**Solution**: Check `index.html` has:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Issue: Payment verification fails
**Solution**: 
- Verify RAZORPAY_KEY_SECRET matches in backend/.env
- Check signature generation logic
- Ensure order_id and payment_id are correct

### Issue: "Please login" message
**Solution**:
- User must be authenticated
- Check JWT token in localStorage
- Login again if token expired

### Issue: Video not working
**Solution**:
- Grant camera/microphone permissions
- Check browser compatibility (Chrome/Firefox recommended)
- Ensure HTTPS in production

## Production Deployment

### 1. Switch to Live Keys
```env
# backend/.env
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret

# .env
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
```

### 2. Enable Webhooks (Optional)
Configure webhooks in Razorpay dashboard for:
- Payment success notifications
- Payment failure notifications
- Refund notifications

### 3. Set Up Payment Reconciliation
- Regular payment reports
- Match Razorpay transactions with database
- Handle failed/pending payments

### 4. Compliance
- Display terms and conditions
- Privacy policy for payment data
- Refund policy
- GST/Tax information

## Pricing Configuration

Current pricing is hardcoded. To make it dynamic:

1. Add pricing field to Lawyer model
2. Update VideoConsultationList to use lawyer.consultationFee
3. Pass dynamic amount to payment API

## Future Enhancements

1. **Multiple Time Slots**: Allow lawyers to set availability
2. **Recurring Consultations**: Subscription-based pricing
3. **Refund System**: Automated refund processing
4. **Rating System**: Post-consultation ratings
5. **Recording**: Save consultation recordings
6. **Calendar Integration**: Sync with Google Calendar
7. **Reminders**: Email/SMS reminders before consultation
8. **Multi-currency**: Support for different currencies

## Support

For issues or questions:
- Razorpay Documentation: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- Razorpay Support: [https://razorpay.com/support/](https://razorpay.com/support/)

## Summary

The video consultation feature with Razorpay payment integration is now fully functional. Users can:
- ✅ Browse lawyers for video consultation
- ✅ Book consultation slots
- ✅ Pay securely via Razorpay
- ✅ Join video calls after payment
- ✅ Complete consultations with lawyers

All components are integrated and ready for testing with Razorpay test credentials.
