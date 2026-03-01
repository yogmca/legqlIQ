# Email Notification Implementation Guide

## Overview
This document describes the email notification system for LegalIQ platform, which now supports multiple professional types: Lawyers, Tax Consultants, and Auditors.

## Current Email Configuration

### Environment Variables
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=yogmca@gmail.com  # Admin email for notifications
```

### Email Service Location
- **File**: `backend/services/emailService.js`
- **Class**: `EmailService`
- **Admin Email**: Configured via `CONTACT_EMAIL` environment variable (default: `yogmca@gmail.com`)

## Email Notification Types

### 1. New User Registration Notifications

#### Current Implementation
When a new user registers (Client, Lawyer, Tax Consultant, or Auditor):

**Admin Notification** (to `yogmca@gmail.com`):
- Method: `sendNewUserNotification(userData)`
- Triggered from: `backend/controllers/authController.js`
- Contains: User details, role, professional type, contact information
- Status: ✅ **Already Implemented**

**User Welcome Email** (to newly registered user):
- Method: `sendWelcomeEmail(userEmail, userName, userRole, professionalType)` 
- Status: ⚠️ **NEEDS TO BE IMPLEMENTED**
- Should include:
  - Welcome message personalized by professional type
  - Next steps for account verification
  - Platform features overview
  - Contact support information

### 2. Consultation Booking Notifications

**Admin Notification** (to `yogmca@gmail.com`):
- Method: `sendNewConsultationNotification(consultationData)`
- Triggered when: Client books consultation with any professional
- Contains: Client details, professional details, consultation type, date/time
- Status: ✅ **Already Implemented**

### 3. Contact Form Notifications

**Admin Notification** (to `yogmca@gmail.com`):
- Method: `sendContactEmail(contactData)`
- Triggered when: User submits contact form
- Contains: Name, email, phone, subject, message
- Status: ✅ **Already Implemented**

**User Auto-Reply**:
- Method: `sendAutoReply(userEmail, userName)`
- Confirms receipt of contact form submission
- Status: ✅ **Already Implemented**

### 4. Password Reset Notifications

**User Password Reset Email**:
- Method: `sendPasswordResetEmail(userEmail, userName, resetToken)`
- Contains: Password reset link with token
- Status: ✅ **Already Implemented**

## Professional Type Support

### Updated Email Templates

All email templates now support three professional types:

1. **Lawyer** (⚖️)
   - Badge Color: Green (#28a745)
   - Specializations: Criminal Law, Family Law, Corporate Law, etc.
   - Registration Field: Bar Registration Number

2. **Tax Consultant** (💰)
   - Badge Color: Orange (#fd7e14)
   - Specializations: Income Tax, GST, Corporate Tax, etc.
   - Registration Field: Tax Consultant Registration Number

3. **Auditor** (📊)
   - Badge Color: Blue (#007bff)
   - Specializations: Statutory Audit, Tax Audit, Forensic Audit, etc.
   - Registration Field: Auditor Registration Number

### Email Template Updates

#### Admin Notification Email
```javascript
// Subject line now includes professional type
subject: `🆕 New ${professionalType} Registration`

// Badge color changes based on professional type
badge-color: {
  'lawyer': '#28a745',
  'tax-consultant': '#fd7e14', 
  'auditor': '#007bff',
  'user': '#6c757d'
}

// Professional type displayed prominently
<span class="badge">
  ${professionalType === 'lawyer' ? '⚖️ LAWYER' : 
    professionalType === 'tax-consultant' ? '💰 TAX CONSULTANT' :
    professionalType === 'auditor' ? '📊 AUDITOR' : '👤 CLIENT'}
</span>
```

## Implementation Status

### ✅ Completed
1. Admin receives notification for all new registrations
2. Admin receives notification for all consultation bookings
3. Admin receives notification for all contact form submissions
4. Users receive auto-reply for contact form submissions
5. Users receive password reset emails
6. Email templates support professional types (lawyer/tax-consultant/auditor)
7. Chatbot responses updated to mention all professional types

### ⚠️ Pending Implementation
1. **Welcome Email to Newly Registered Users**
   - Need to add `sendWelcomeEmail()` method to EmailService
   - Should be triggered after successful registration
   - Personalized based on professional type
   - Include verification instructions

## Recommended Implementation: Welcome Email

### Method Signature
```javascript
async sendWelcomeEmail(userEmail, userName, userRole, professionalType = 'user')
```

### Email Content Structure
```html
Subject: Welcome to LegalIQ - Your Account is Ready!

Body:
- Personalized greeting with user name
- Welcome message based on professional type:
  * Clients: "Find the right professional for your needs"
  * Lawyers: "Connect with clients seeking legal expertise"
  * Tax Consultants: "Help clients with tax planning and compliance"
  * Auditors: "Provide audit services to businesses"
- Account verification steps (if applicable)
- Platform features overview
- Next steps to complete profile
- Support contact information
```

### Integration Points
```javascript
// In authController.js - after successful registration
await emailService.sendWelcomeEmail(
  user.email,
  user.name,
  user.role,
  professionalType
);
```

## Email Delivery Status

### Current Issues
Based on terminal logs, there's an authentication error with Gmail:
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Resolution Steps
1. **Enable Gmail App Password**:
   - Go to Google Account → Security
   - Enable 2-Factor Authentication
   - Generate App Password for "Mail"
   - Update `EMAIL_PASSWORD` in `.env` file

2. **Alternative: Use SMTP Service**:
   - Consider using SendGrid, AWS SES, or Mailgun for production
   - More reliable than Gmail for automated emails
   - Better deliverability and tracking

3. **Update .env file**:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
CONTACT_EMAIL=yogmca@gmail.com
```

## Testing Checklist

### Registration Flow
- [ ] Client registers → Admin receives notification
- [ ] Client registers → User receives welcome email
- [ ] Lawyer registers → Admin receives notification with professional type
- [ ] Lawyer registers → Lawyer receives welcome email
- [ ] Tax Consultant registers → Admin receives notification
- [ ] Tax Consultant registers → User receives welcome email
- [ ] Auditor registers → Admin receives notification
- [ ] Auditor registers → User receives welcome email

### Consultation Flow
- [ ] Client books lawyer consultation → Admin notified
- [ ] Client books tax consultant consultation → Admin notified
- [ ] Client books auditor consultation → Admin notified

### Contact Form
- [ ] User submits contact form → Admin receives email
- [ ] User submits contact form → User receives auto-reply

### Password Reset
- [ ] User requests password reset → Receives reset email
- [ ] Reset link works correctly

## Security Considerations

1. **Email Credentials**:
   - Never commit `.env` file to Git
   - Use App Passwords instead of account password
   - Rotate credentials regularly

2. **Email Content**:
   - Don't include sensitive data in emails
   - Use secure links for password reset
   - Implement rate limiting for email sending

3. **Spam Prevention**:
   - Implement CAPTCHA on contact form
   - Rate limit registration attempts
   - Verify email addresses

## Production Deployment

### Pre-Deployment Checklist
- [ ] Update `EMAIL_USER` with production email
- [ ] Generate and set `EMAIL_PASSWORD` (App Password)
- [ ] Verify `CONTACT_EMAIL` is correct
- [ ] Test all email notifications
- [ ] Set up email monitoring/logging
- [ ] Configure SPF/DKIM records for domain
- [ ] Test email deliverability

### Monitoring
- Monitor email delivery success/failure rates
- Log all email attempts for debugging
- Set up alerts for email service failures
- Track bounce rates and spam complaints

## Support

For email configuration issues:
- Check Gmail App Password setup
- Verify firewall/network allows SMTP (port 587)
- Review nodemailer documentation
- Check email service logs in terminal

---

**Last Updated**: March 1, 2026
**Version**: 2.0 (Multi-Professional Platform)
