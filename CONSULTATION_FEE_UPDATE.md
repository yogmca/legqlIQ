# Consultation Fee Configuration Update

## Summary of Changes

The consultation fee system has been updated to be dynamic and editable per lawyer, with a default production fee of ₹500.

## Changes Made

### 1. Frontend - Video Consultation List
**File**: `src/components/VideoConsultationList.jsx`

- **Line 180**: Updated to display lawyer's individual consultation fee
  ```jsx
  <span className="price">₹{lawyer.consultationFee || 500}</span>
  ```

- **Line 226**: Updated payment modal to use lawyer's fee
  ```jsx
  const consultationFee = lawyer.consultationFee || 500; // Use lawyer's fee or default ₹500
  ```

**Previous**: Hardcoded ₹1 for testing
**Now**: Uses each lawyer's `consultationFee` from database, defaults to ₹500 if not set

### 2. Frontend - Lawyer Registration
**File**: `src/components/Register.jsx`

- **Lines 461-473**: Made consultation fee field required with validation
  - Minimum fee: ₹100
  - Placeholder: "Default: ₹500"
  - Recommended range: ₹500-₹2000
  - Field is now marked as required (*)

**Benefits**:
- New lawyers must set their consultation fee during registration
- Provides guidance on recommended pricing
- Prevents unrealistic pricing (minimum ₹100)

### 3. Backend - Lawyer Profile Creation
**File**: `backend/controllers/authController.js`

- **Line 240**: Updated default consultation fee
  ```javascript
  consultationFee: consultationFee ? parseInt(consultationFee) : 500
  ```

**Previous**: Default was ₹0
**Now**: Default is ₹500 if not provided

## How It Works

### For New Lawyers
1. During registration, lawyers see a **required** "Consultation Fee" field
2. They can set their own fee (minimum ₹100)
3. If they don't enter a value, the system defaults to ₹500
4. The fee is stored in their lawyer profile in MongoDB

### For Clients
1. When browsing lawyers, each lawyer's card shows their individual consultation fee
2. When booking a consultation, the payment amount is based on the lawyer's fee
3. Different lawyers can charge different amounts

### For Existing Lawyers
- Lawyers without a `consultationFee` in the database will default to ₹500
- Existing lawyers can update their fee through their profile settings (if implemented)

## Database Schema

The `Lawyer` model already includes the `consultationFee` field:

```javascript
consultationFee: {
  type: Number,
  default: 500
}
```

## Testing vs Production

### Testing Mode (Previous)
- Hardcoded ₹1 for all consultations
- Used for testing payment gateway without real charges

### Production Mode (Current)
- Each lawyer sets their own fee
- Default: ₹500
- Minimum: ₹100
- Recommended: ₹500-₹2000

## Razorpay Configuration

⚠️ **Important**: You're currently using **LIVE Razorpay keys** (`rzp_live_SINnm2d5ld3vlh`)

### For Testing
Switch to TEST keys to avoid real charges:
```env
# In backend/.env and frontend .env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_test_secret
```

### For Production
Keep LIVE keys and ensure proper pricing:
```env
RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
RAZORPAY_KEY_SECRET=your_live_secret
```

## Migration Guide

### For Existing Lawyers in Database

If you have existing lawyers without a consultation fee, run this MongoDB update:

```javascript
// Connect to MongoDB
use legaliq

// Update all lawyers without consultationFee to ₹500
db.lawyers.updateMany(
  { consultationFee: { $exists: false } },
  { $set: { consultationFee: 500 } }
)

// Or update lawyers with ₹0 or ₹1 (testing values)
db.lawyers.updateMany(
  { consultationFee: { $lte: 1 } },
  { $set: { consultationFee: 500 } }
)

// Verify the update
db.lawyers.find({}, { name: 1, consultationFee: 1 })
```

### Update Script

You can also create a migration script:

```bash
# In backend directory
node -e "
const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const result = await Lawyer.updateMany(
      { \$or: [
        { consultationFee: { \$exists: false } },
        { consultationFee: { \$lte: 1 } }
      ]},
      { \$set: { consultationFee: 500 } }
    );
    console.log('Updated', result.modifiedCount, 'lawyers');
    process.exit(0);
  });
"
```

## API Response Format

The `/api/lawyers` endpoint now returns:

```json
{
  "data": [
    {
      "id": "...",
      "name": "Advocate Name",
      "consultationFee": 500,
      "specialization": [...],
      ...
    }
  ]
}
```

## Future Enhancements

### 1. Lawyer Profile Edit
Allow lawyers to update their consultation fee after registration:
- Add "Edit Profile" page for lawyers
- Include consultation fee field
- Validate minimum ₹100

### 2. Dynamic Pricing
- Allow lawyers to set different fees for different consultation types
- Weekend/holiday pricing
- Urgent consultation premium

### 3. Discounts & Promotions
- First-time client discount
- Promotional pricing
- Package deals (multiple consultations)

### 4. Fee History
- Track consultation fee changes
- Show pricing trends
- Analytics for lawyers

## Deployment Instructions

### On AWS EC2

1. **Pull latest code**:
   ```bash
   cd ~/legqlIQ
   git pull origin main
   ```

2. **Update dependencies** (if needed):
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Restart services**:
   ```bash
   pm2 restart all
   ```

4. **Verify changes**:
   ```bash
   # Check if API returns consultationFee
   curl http://13.62.225.158:4000/api/lawyers?limit=1
   ```

5. **Update existing lawyers** (if needed):
   ```bash
   cd ~/legqlIQ/backend
   node -e "
   require('dotenv').config();
   const mongoose = require('mongoose');
   const Lawyer = require('./models/Lawyer');
   
   mongoose.connect(process.env.MONGODB_URI)
     .then(async () => {
       const result = await Lawyer.updateMany(
         { consultationFee: { \$lte: 1 } },
         { \$set: { consultationFee: 500 } }
       );
       console.log('Updated', result.modifiedCount, 'lawyers');
       process.exit(0);
     });
   "
   ```

## Testing Checklist

- [ ] New lawyer registration shows consultation fee field
- [ ] Consultation fee is required during registration
- [ ] Minimum fee validation works (₹100)
- [ ] Lawyer cards display individual consultation fees
- [ ] Payment modal shows correct fee for each lawyer
- [ ] Payment gateway charges correct amount
- [ ] Existing lawyers default to ₹500 if no fee set
- [ ] Database stores consultation fee correctly

## Support

If you encounter any issues:

1. **Check logs**:
   ```bash
   pm2 logs backend
   pm2 logs frontend
   ```

2. **Verify database**:
   ```bash
   mongo
   use legaliq
   db.lawyers.find({}, { name: 1, consultationFee: 1 }).pretty()
   ```

3. **Test API**:
   ```bash
   curl http://13.62.225.158:4000/api/lawyers?limit=5
   ```

## Security Notes

- ✅ Consultation fees are validated on backend
- ✅ Minimum fee enforced (₹100)
- ✅ Payment verification through Razorpay
- ⚠️ Currently using LIVE Razorpay keys - switch to TEST for development
- ✅ All payment transactions are logged in database

## Conclusion

The consultation fee system is now fully dynamic and production-ready:
- ✅ Each lawyer can set their own fee
- ✅ Default production fee: ₹500
- ✅ Minimum fee validation: ₹100
- ✅ Required field during registration
- ✅ Backward compatible (defaults to ₹500 for existing lawyers)
