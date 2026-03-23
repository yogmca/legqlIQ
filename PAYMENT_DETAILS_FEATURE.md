# Payment Details Feature - Implementation Guide

## Overview
This feature allows professionals (lawyers, tax consultants, auditors) to add and manage their payment settlement details in their profile. LegalIQ can use these details for payment settlements after consultations.

## Features Implemented

### Backend Changes

#### 1. Database Schema (Lawyer Model)
**File:** `backend/models/Lawyer.js`

Added `paymentDetails` object with the following fields:
- **Bank Account Details:**
  - `bankAccountNumber` - Stored securely, not returned in regular queries
  - `bankName` - Name of the bank
  - `ifscCode` - IFSC code (auto-converted to uppercase)
  - `accountHolderName` - Name on the account

- **UPI Details:**
  - `upiId` - UPI ID (auto-converted to lowercase)

- **Payment App Numbers:**
  - `phonePeNumber` - PhonePe registered number
  - `googlePayNumber` - Google Pay registered number

- **Preferences:**
  - `preferredPaymentMethod` - Enum: `bank_transfer`, `upi`, `phonepe`, `googlepay`

#### 2. API Endpoints
**File:** `backend/controllers/authController.js`

**GET `/api/auth/payment-details`**
- Retrieves payment details for the logged-in professional
- Returns masked bank account number (shows only last 4 digits)
- Requires authentication
- Only accessible by professionals

**PUT `/api/auth/payment-details`**
- Updates payment details for the logged-in professional
- Validates user role (must be lawyer/tax-consultant/auditor)
- Returns masked bank account number in response
- Requires authentication

#### 3. Routes
**File:** `backend/routes/authRoutes.js`

Added two new protected routes:
```javascript
router.get('/payment-details', protect, authController.getPaymentDetails);
router.put('/payment-details', protect, authController.updatePaymentDetails);
```

## Security Features

### 1. Bank Account Number Protection
- Stored with `select: false` in schema
- Never returned in full in API responses
- Only last 4 digits shown (e.g., `****1234`)

### 2. Role-Based Access
- Only professionals can access payment details endpoints
- Regular users (clients) get 403 Forbidden error

### 3. Data Validation
- IFSC codes automatically converted to uppercase
- UPI IDs automatically converted to lowercase
- All fields are optional (professionals can fill what they have)

## Usage

### For Professionals

Professionals can add their payment details through their profile page. They can provide:

**Option 1: Bank Account**
- Account number
- Bank name
- IFSC code
- Account holder name

**Option 2: UPI**
- UPI ID (e.g., name@paytm, phone@ybl)

**Option 3: Payment Apps**
- PhonePe number
- Google Pay number

**Or any combination of the above**

### For LegalIQ Admin

When a consultation is completed, LegalIQ can:
1. Fetch the professional's payment details
2. Process payment settlement using their preferred method
3. Bank account numbers are securely stored and only accessible by authorized admin

## API Examples

### Get Payment Details
```bash
GET /api/auth/payment-details
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "paymentDetails": {
    "bankName": "State Bank of India",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "John Doe",
    "bankAccountNumber": "****5678",  // Masked
    "upiId": "john@paytm",
    "phonePeNumber": "9876543210",
    "googlePayNumber": "9876543210",
    "preferredPaymentMethod": "upi"
  }
}
```

### Update Payment Details
```bash
PUT /api/auth/payment-details
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "bankAccountNumber": "12345678901234",
  "bankName": "State Bank of India",
  "ifscCode": "sbin0001234",  // Will be converted to uppercase
  "accountHolderName": "John Doe",
  "upiId": "JOHN@PAYTM",  // Will be converted to lowercase
  "phonePeNumber": "9876543210",
  "googlePayNumber": "9876543210",
  "preferredPaymentMethod": "upi"
}

Response:
{
  "success": true,
  "message": "Payment details updated successfully",
  "paymentDetails": {
    "bankName": "State Bank of India",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "John Doe",
    "bankAccountNumber": "****1234",  // Masked
    "upiId": "john@paytm",
    "phonePeNumber": "9876543210",
    "googlePayNumber": "9876543210",
    "preferredPaymentMethod": "upi"
  }
}
```

## Frontend Integration (To Be Implemented)

The Profile component needs to be updated to include a "Payment Details" section where professionals can:

1. View their current payment details
2. Add/Edit payment information
3. Select preferred payment method
4. See masked bank account number for security

### Suggested UI Flow

```
Profile Page
├── Personal Information
├── Professional Details
└── Payment Settlement Details  ← NEW SECTION
    ├── Bank Account (Optional)
    │   ├── Account Number
    │   ├── Bank Name
    │   ├── IFSC Code
    │   └── Account Holder Name
    ├── UPI Details (Optional)
    │   └── UPI ID
    ├── Payment Apps (Optional)
    │   ├── PhonePe Number
    │   └── Google Pay Number
    └── Preferred Payment Method
        └── Dropdown: Bank Transfer / UPI / PhonePe / Google Pay
```

## Testing

### Local Testing
1. Start backend: `cd backend && npm start`
2. Login as a professional (lawyer/tax consultant/auditor)
3. Use Postman or curl to test the endpoints
4. Verify bank account masking works correctly
5. Test role-based access (try with regular user - should fail)

### Production Deployment
1. Pull latest code: `git pull origin LegalIQ_prod`
2. Restart backend: `pm2 restart backend`
3. Test endpoints on production

## Database Migration

No migration needed! The new `paymentDetails` field is optional and will be `undefined` for existing professionals until they add their details.

## Future Enhancements

1. **Frontend UI** - Add payment details form in Profile component
2. **Validation** - Add IFSC code format validation
3. **Encryption** - Consider encrypting bank account numbers at rest
4. **Audit Log** - Track when payment details are accessed/modified
5. **Admin Panel** - Allow admins to view payment details for settlement processing
6. **Payment Integration** - Integrate with payment gateways for automatic settlements

## Files Modified

1. `backend/models/Lawyer.js` - Added paymentDetails schema
2. `backend/controllers/authController.js` - Added get/update payment details functions
3. `backend/routes/authRoutes.js` - Added payment details routes

## Commit

```
commit 3b51cd1
Add payment details feature for professionals

- Added paymentDetails schema to Lawyer model
- Created API endpoints to get and update payment details
- Added security: bank account numbers are masked
- Only professionals can access payment details
- Supports multiple payment methods
```
