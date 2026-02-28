# Email Notifications to LegalIQ Admin

## Overview

The system now automatically sends email notifications to the LegalIQ admin email address for:
1. **New User Registrations** (both clients and lawyers)
2. **New Consultation Bookings** (both in-person and video consultations)

## Features

### 1. New User Registration Notifications

When a new user registers on the platform, an email is automatically sent to the admin with:
- User's full name
- Email address
- Phone number
- User type (Client or Lawyer)
- Date of birth (if provided)
- Gender (if provided)
- Address (if provided)
- Registration timestamp

**Triggers:**
- Client registration via [`/api/auth/register`](karnataka-bar-association/backend/controllers/authController.js:13)
- Lawyer registration via [`/api/auth/register-lawyer`](karnataka-bar-association/backend/controllers/authController.js:180)

### 2. New Consultation Booking Notifications

When a client books a consultation, an email is automatically sent to the admin with:
- Client information (name, email, phone)
- Lawyer information (name, email, specialization)
- Case type and description
- Preferred date and time
- Consultation type (Video or In-Person)
- Payment amount (for video consultations)
- Booking timestamp

**Triggers:**
- In-person consultation booking via [`/api/consultations`](karnataka-bar-association/backend/controllers/consultationController.js:72)
- Video consultation booking (after payment verification) via [`/api/consultations/verify-payment`](karnataka-bar-association/backend/controllers/consultationController.js:604)

## Configuration

### Email Settings

The email notifications are sent using the Gmail SMTP service. Configure the following environment variables in your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=yogmca@gmail.com
```

**Important Notes:**
- `EMAIL_USER`: The Gmail account that will send the emails
- `EMAIL_PASSWORD`: Gmail App Password (not your regular password)
- `CONTACT_EMAIL`: The admin email address that will receive all notifications (currently set to yogmca@gmail.com)

### How to Get Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password in the `EMAIL_PASSWORD` environment variable

## Email Templates

### User Registration Email

**Subject:** `🆕 New User Registration - [Client/Lawyer]`

**Features:**
- Color-coded badges (Blue for clients, Green for lawyers)
- Professional gradient header
- Organized field layout
- Clickable email and phone links
- Indian timezone timestamp

### Consultation Booking Email

**Subject:** `📅 New Consultation Booking - [Video Call/In-Person]`

**Features:**
- Consultation type badge (Video/In-Person)
- Payment amount display (for paid consultations)
- Separate sections for client, lawyer, and consultation details
- Formatted date display
- Clickable contact information
- Indian timezone timestamp

## Implementation Details

### Email Service

The email functionality is implemented in [`emailService.js`](karnataka-bar-association/backend/services/emailService.js):

```javascript
// Send new user notification
await emailService.sendNewUserNotification({
  name, email, phone, role, dateOfBirth, gender, address
});

// Send new consultation notification
await emailService.sendNewConsultationNotification({
  clientName, clientEmail, clientPhone,
  lawyerName, lawyerEmail,
  caseType, caseDescription,
  preferredDate, preferredTime,
  consultationType, amount
});
```

### Non-Blocking Execution

All email notifications are sent asynchronously and non-blocking:
- Registration/booking succeeds even if email fails
- Errors are logged but don't affect user experience
- Uses `.catch()` to handle email failures gracefully

```javascript
emailService.sendNewUserNotification(userData)
  .catch(err => console.error('Failed to send notification:', err));
```

## Testing

### Test User Registration

1. Register a new client or lawyer through the registration form
2. Check the admin email (yogmca@gmail.com) for the notification
3. Verify all user details are included

### Test Consultation Booking

1. Book an in-person consultation through the consultation form
2. Or book a video consultation and complete payment
3. Check the admin email for the booking notification
4. Verify all consultation details are included

## Troubleshooting

### Emails Not Being Received

1. **Check Environment Variables:**
   ```bash
   # In backend directory
   cat .env | grep EMAIL
   ```

2. **Verify Gmail App Password:**
   - Ensure you're using an App Password, not your regular Gmail password
   - App Password should be 16 characters without spaces

3. **Check Server Logs:**
   ```bash
   # Look for email-related logs
   tail -f backend/logs/server.log | grep -i email
   ```

4. **Test Email Service:**
   ```bash
   # In backend directory
   node -e "require('./services/emailService').sendContactEmail({
     name: 'Test',
     email: 'test@example.com',
     phone: '1234567890',
     subject: 'Test',
     message: 'Test message'
   })"
   ```

### Common Issues

1. **"Invalid login" error:**
   - Enable "Less secure app access" in Gmail (not recommended)
   - Use App Password instead (recommended)

2. **Emails going to spam:**
   - Add the sender email to contacts
   - Mark as "Not Spam" in Gmail

3. **Timeout errors:**
   - Check internet connectivity
   - Verify firewall settings allow SMTP (port 587)

## Email Recipient Management

To change the admin email address that receives notifications:

1. **Update Environment Variable:**
   ```env
   CONTACT_EMAIL=new-admin@example.com
   ```

2. **Or Update Programmatically:**
   ```javascript
   const emailService = require('./services/emailService');
   emailService.updateRecipientEmail('new-admin@example.com');
   ```

3. **Restart the backend server** for changes to take effect

## Future Enhancements

Potential improvements for the email notification system:

1. **Multiple Recipients:** Support sending to multiple admin emails
2. **Email Templates:** Use external template engine (Handlebars, Pug)
3. **Email Queue:** Implement queue system (Bull, RabbitMQ) for reliability
4. **Email Analytics:** Track open rates and click-through rates
5. **Custom Notifications:** Allow admins to configure notification preferences
6. **SMS Notifications:** Add SMS alerts for critical events
7. **Slack/Discord Integration:** Send notifications to team channels

## Security Considerations

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of regular Gmail passwords
3. **Rotate credentials** periodically
4. **Monitor email logs** for suspicious activity
5. **Implement rate limiting** to prevent email spam
6. **Validate email addresses** before sending

## Support

For issues or questions regarding email notifications:
- Check server logs for error messages
- Verify environment variables are set correctly
- Test with a simple contact form submission first
- Contact the development team if issues persist

---

**Last Updated:** February 28, 2026
**Version:** 1.0.0
