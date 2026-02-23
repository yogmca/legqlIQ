# Real-Time SMS OTP Integration Guide

## Overview

Currently, OTPs are displayed in the console for development. To send real SMS to mobile phones, you need to integrate an SMS service provider.

## 🇮🇳 Best SMS Providers for India

### Option 1: MSG91 (Recommended for India)
**Pros:**
- ✅ India-focused, best delivery rates
- ✅ Affordable pricing (₹0.15-0.25 per SMS)
- ✅ OTP-specific templates
- ✅ Easy integration
- ✅ Free trial credits

**Pricing:** ₹500 for ~2000 SMS

### Option 2: Twilio
**Pros:**
- ✅ Global coverage
- ✅ Reliable delivery
- ✅ Good documentation
- ✅ Free trial ($15 credit)

**Cons:**
- ❌ More expensive for India
- ❌ Requires international setup

**Pricing:** $0.0058 per SMS (~₹0.50)

### Option 3: AWS SNS
**Pros:**
- ✅ Part of AWS ecosystem
- ✅ Scalable
- ✅ Pay-as-you-go

**Cons:**
- ❌ Complex setup
- ❌ Requires AWS account

**Pricing:** $0.00645 per SMS

---

## 🚀 Quick Setup: MSG91 (Recommended)

### Step 1: Sign Up
1. Go to https://msg91.com/
2. Sign up for free account
3. Get ₹50 free credits
4. Verify your account

### Step 2: Get API Credentials
1. Login to MSG91 dashboard
2. Go to **Settings** → **API Keys**
3. Copy your **Auth Key**
4. Note your **Sender ID** (e.g., "LGALIQ")

### Step 3: Install Package
```bash
cd karnataka-bar-association/backend
npm install msg91-sms
```

### Step 4: Update Environment Variables
Add to [`backend/.env`](backend/.env):
```env
# MSG91 Configuration
MSG91_AUTH_KEY=your_auth_key_here
MSG91_SENDER_ID=LGALIQ
MSG91_ROUTE=4
MSG91_DLT_TEMPLATE_ID=your_template_id
```

### Step 5: Update OTP Controller

Replace the console.log in [`backend/controllers/otpController.js`](backend/controllers/otpController.js):

```javascript
const msg91 = require('msg91-sms');

// Configure MSG91
msg91.initialize({
  authKey: process.env.MSG91_AUTH_KEY,
  senderId: process.env.MSG91_SENDER_ID,
  route: process.env.MSG91_ROUTE || '4'
});

// In sendOTP function, replace console.log with:
try {
  // Send SMS via MSG91
  await msg91.send(
    phone, // Mobile number
    `Your LegalIQ OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
    (err, response) => {
      if (err) {
        console.error('SMS Error:', err);
      } else {
        console.log('SMS sent successfully:', response);
      }
    }
  );

  res.status(200).json({
    message: 'OTP sent successfully'
    // Remove otp from response in production
  });
} catch (error) {
  console.error('Error sending OTP:', error);
  res.status(500).json({ message: 'Failed to send OTP' });
}
```

### Step 6: Test Real SMS
```bash
# Restart backend
cd karnataka-bar-association/backend
npm start

# Test with your real mobile number
curl -X POST http://localhost:4000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR_MOBILE_NUMBER"}'
```

You should receive SMS on your phone! 📱

---

## 🔧 Complete Implementation: MSG91

Here's the complete updated OTP controller:

```javascript
// backend/controllers/otpController.js
const OTP = require('../models/OTP');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const msg91 = require('msg91-sms');

// Initialize MSG91
msg91.initialize({
  authKey: process.env.MSG91_AUTH_KEY,
  senderId: process.env.MSG91_SENDER_ID,
  route: process.env.MSG91_ROUTE || '4'
});

// Helper function to send SMS
const sendSMS = async (phone, message) => {
  return new Promise((resolve, reject) => {
    msg91.send(phone, message, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Please provide a valid 10-digit Indian mobile number' 
      });
    }

    // Check for recent OTP request (30 second cooldown)
    const recentOTP = await OTP.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 30000) }
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait 30 seconds before requesting a new OTP' 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
      phone,
      otp,
      createdAt: new Date(),
      verified: false,
      attempts: 0
    });

    // Send SMS
    const message = `Your LegalIQ OTP is ${otp}. Valid for 5 minutes. Do not share with anyone. - LegalIQ`;
    
    try {
      await sendSMS(phone, message);
      console.log(`✅ OTP sent to ${phone}`);
      
      res.status(200).json({
        message: 'OTP sent successfully to your mobile number'
      });
    } catch (smsError) {
      console.error('SMS Error:', smsError);
      
      // Still return success but log error
      // In production, you might want to handle this differently
      res.status(200).json({
        message: 'OTP generated. If you don\'t receive SMS, please try again.',
        // Include OTP in development only
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    }

  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        message: 'Phone number and OTP are required' 
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      phone, 
      verified: false 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'OTP has expired or is invalid' 
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        message: 'Maximum verification attempts exceeded. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({ 
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.` 
      });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user
      user = await User.create({
        phone,
        role: 'client',
        name: `User ${phone.slice(-4)}`, // Temporary name
        isPhoneVerified: true
      });
      console.log(`✅ New user created: ${user._id}`);
    } else {
      // Update existing user
      user.isPhoneVerified = true;
      await user.save();
      console.log(`✅ Existing user logged in: ${user._id}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ 
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Check cooldown
    const recentOTP = await OTP.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 30000) }
    });

    if (recentOTP) {
      const waitTime = Math.ceil((30000 - (Date.now() - recentOTP.createdAt)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${waitTime} seconds before requesting a new OTP` 
      });
    }

    // Delete old OTPs
    await OTP.deleteMany({ phone });

    // Generate new OTP
    const otp = generateOTP();

    // Save to database
    await OTP.create({
      phone,
      otp,
      createdAt: new Date(),
      verified: false,
      attempts: 0
    });

    // Send SMS
    const message = `Your LegalIQ OTP is ${otp}. Valid for 5 minutes. Do not share with anyone. - LegalIQ`;
    
    try {
      await sendSMS(phone, message);
      console.log(`✅ OTP resent to ${phone}`);
      
      res.status(200).json({
        message: 'OTP resent successfully'
      });
    } catch (smsError) {
      console.error('SMS Error:', smsError);
      res.status(200).json({
        message: 'OTP generated',
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    }

  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(500).json({ 
      message: 'Failed to resend OTP' 
    });
  }
};
```

---

## 🔐 DLT Registration (Required for India)

### What is DLT?
Distributed Ledger Technology (DLT) registration is **mandatory** in India for sending commercial SMS.

### Steps:
1. **Register on DLT Platform**
   - Jio: https://trueconnect.jio.com/
   - Airtel: https://smartping.live/
   - Vodafone: https://www.vilpower.in/

2. **Register Your Entity**
   - Company name: LegalIQ
   - Business type: Technology/Legal Services

3. **Create SMS Template**
   ```
   Your LegalIQ OTP is <#> XXXXXX. Valid for 5 minutes. 
   Do not share with anyone. - LegalIQ
   ```

4. **Get Template ID**
   - Copy the approved template ID
   - Add to `.env` as `MSG91_DLT_TEMPLATE_ID`

5. **Update MSG91 Configuration**
   ```javascript
   msg91.send(
     phone,
     message,
     {
       DLT_TE_ID: process.env.MSG91_DLT_TEMPLATE_ID
     },
     callback
   );
   ```

---

## 💰 Cost Comparison

### MSG91 (Recommended)
- **Setup:** Free
- **Per SMS:** ₹0.15 - ₹0.25
- **1000 SMS:** ₹150 - ₹250
- **10,000 SMS:** ₹1,500 - ₹2,500

### Twilio
- **Setup:** Free ($15 credit)
- **Per SMS:** $0.0058 (~₹0.50)
- **1000 SMS:** ~₹500
- **10,000 SMS:** ~₹5,000

### AWS SNS
- **Setup:** Free (AWS account required)
- **Per SMS:** $0.00645 (~₹0.55)
- **1000 SMS:** ~₹550
- **10,000 SMS:** ~₹5,500

---

## 🧪 Testing Checklist

### Development Testing
- [x] Console OTP working
- [ ] MSG91 account created
- [ ] API key configured
- [ ] Test SMS to your number
- [ ] Verify OTP received
- [ ] Test resend functionality

### Production Testing
- [ ] DLT registration complete
- [ ] Template approved
- [ ] Rate limiting enabled
- [ ] Error handling tested
- [ ] Delivery reports monitored
- [ ] Cost tracking setup

---

## 📊 Monitoring & Analytics

### Track These Metrics:
1. **Delivery Rate**: % of SMS successfully delivered
2. **Average Delivery Time**: Time from send to receive
3. **Failed Deliveries**: Track and investigate failures
4. **Cost per User**: Monitor SMS costs
5. **OTP Verification Rate**: % of users who verify OTP

### MSG91 Dashboard:
- Real-time delivery reports
- Failed SMS analysis
- Cost tracking
- API usage statistics

---

## 🚨 Production Checklist

Before going live:
- [ ] MSG91 account verified
- [ ] DLT registration complete
- [ ] Template approved
- [ ] Environment variables set
- [ ] Remove OTP from API responses
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Test with multiple carriers (Jio, Airtel, Vi)
- [ ] Backup SMS provider configured
- [ ] Error notifications setup

---

## 🆘 Troubleshooting

### SMS Not Received
1. Check MSG91 dashboard for delivery status
2. Verify phone number format (+91XXXXXXXXXX)
3. Check DLT template approval
4. Verify sender ID is approved
5. Check account balance

### "DLT Template Not Found"
- Ensure template is approved
- Verify template ID in .env
- Check template content matches exactly

### High Failure Rate
- Check operator-specific issues
- Verify DND (Do Not Disturb) status
- Review template compliance
- Check time restrictions (9 AM - 9 PM)

---

## 📞 Support

**MSG91 Support:**
- Email: support@msg91.com
- Phone: +91-9650-140-680
- Docs: https://docs.msg91.com/

**LegalIQ Support:**
- Check [`OTP_AUTHENTICATION_GUIDE.md`](OTP_AUTHENTICATION_GUIDE.md)
- Review backend logs
- Test with curl commands

---

**Ready to send real SMS?** Follow the MSG91 setup above and you'll be sending OTPs to mobile phones in minutes! 📱✨
