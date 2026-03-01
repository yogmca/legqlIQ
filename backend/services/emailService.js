const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Email configuration - will be set from environment variables
    this.transporter = null;
    this.recipientEmail = process.env.CONTACT_EMAIL || 'yogmca@gmail.com';
    this.initialize();
  }

  initialize() {
    // Create transporter using Gmail
    // Note: In nodemailer v8+, the method is createTransport (not createTransporter)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  async sendContactEmail(contactData) {
    const { name, email, phone, subject, message } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: this.recipientEmail,
      subject: `LegalIQ Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              display: block;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .message-box {
              background: #f5f5f5;
              padding: 15px;
              border-left: 4px solid #667eea;
              border-radius: 4px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Contact Form Submission</h1>
              <p>LegalIQ Contact Form</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Name:</span>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <span class="label">📧 Email:</span>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              <div class="field">
                <span class="label">📞 Phone:</span>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              
              <div class="field">
                <span class="label">📋 Subject:</span>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <span class="label">💬 Message:</span>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div class="footer">
                <p>This email was sent from the LegalIQ contact form</p>
                <p>Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version
      text: `
New Contact Form Submission - LegalIQ

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}

---
Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendAutoReply(userEmail, userName) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: userEmail,
      subject: 'Thank you for contacting LegalIQ',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message Received!</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              
              <p>Thank you for reaching out to LegalIQ. We have received your message and our team will review it shortly.</p>
              
              <p>We typically respond to all inquiries within 24 hours during business days (Monday - Saturday, 9 AM - 6 PM IST).</p>
              
              <p>In the meantime, you can:</p>
              <ul>
                <li>Browse our <a href="https://legaliq.in/lawyers">verified lawyers</a></li>
                <li>Book a <a href="https://legaliq.in/video-consultations">video consultation</a></li>
                <li>Learn more <a href="https://legaliq.in/about">about us</a></li>
              </ul>
              
              <p>If your matter is urgent, please call us at <strong>+91 1800-123-4567</strong></p>
              
              <center>
                <a href="https://legaliq.in" class="button">Visit LegalIQ</a>
              </center>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>Bangalore, Karnataka, India</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Auto-reply sent to:', userEmail);
    } catch (error) {
      console.error('Error sending auto-reply:', error);
      // Don't throw error for auto-reply failure
    }
  }

  async sendNewUserNotification(userData) {
    const { name, email, phone, role, dateOfBirth, gender, address } = userData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: this.recipientEmail,
      subject: `🆕 New User Registration - ${role === 'lawyer' ? 'Lawyer' : 'Client'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              display: block;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .badge {
              display: inline-block;
              padding: 5px 15px;
              background: ${role === 'lawyer' ? '#28a745' : '#007bff'};
              color: white;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 New User Registration</h1>
              <p>LegalIQ Platform</p>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="badge">${role === 'lawyer' ? '⚖️ LAWYER' : '👤 CLIENT'}</span>
              </div>
              
              <div class="field">
                <span class="label">👤 Name:</span>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <span class="label">📧 Email:</span>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              <div class="field">
                <span class="label">📞 Phone:</span>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              
              ${dateOfBirth ? `
              <div class="field">
                <span class="label">🎂 Date of Birth:</span>
                <div class="value">${new Date(dateOfBirth).toLocaleDateString('en-IN')}</div>
              </div>
              ` : ''}
              
              ${gender ? `
              <div class="field">
                <span class="label">⚧ Gender:</span>
                <div class="value">${gender}</div>
              </div>
              ` : ''}
              
              ${address ? `
              <div class="field">
                <span class="label">📍 Address:</span>
                <div class="value">${address}</div>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>This user registered on the LegalIQ platform</p>
                <p>Registered on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New User Registration - LegalIQ

User Type: ${role === 'lawyer' ? 'LAWYER' : 'CLIENT'}

Name: ${name}
Email: ${email}
Phone: ${phone}
${dateOfBirth ? `Date of Birth: ${new Date(dateOfBirth).toLocaleDateString('en-IN')}` : ''}
${gender ? `Gender: ${gender}` : ''}
${address ? `Address: ${address}` : ''}

---
Registered on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('New user notification email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending new user notification email:', error);
      // Don't throw error - registration should succeed even if email fails
      return { success: false, error: error.message };
    }
  }

  async sendNewConsultationNotification(consultationData) {
    const {
      clientName,
      clientEmail,
      clientPhone,
      lawyerName,
      lawyerEmail,
      caseType,
      caseDescription,
      preferredDate,
      preferredTime,
      consultationType,
      amount
    } = consultationData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: this.recipientEmail,
      subject: `📅 New Consultation Booking - ${consultationType === 'video' ? 'Video Call' : 'In-Person'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 15px;
            }
            .field {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #555;
              display: block;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              padding: 8px;
              background: white;
              border-radius: 4px;
            }
            .badge {
              display: inline-block;
              padding: 5px 15px;
              background: ${consultationType === 'video' ? '#28a745' : '#007bff'};
              color: white;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #28a745;
              text-align: center;
              padding: 15px;
              background: #e8f5e9;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 New Consultation Booking</h1>
              <p>LegalIQ Platform</p>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="badge">${consultationType === 'video' ? '🎥 VIDEO CONSULTATION' : '🏢 IN-PERSON CONSULTATION'}</span>
              </div>
              
              ${amount ? `
              <div class="amount">
                ₹${amount}
              </div>
              ` : ''}
              
              <div class="section">
                <div class="section-title">👤 Client Information</div>
                <div class="field">
                  <span class="label">Name:</span>
                  <div class="value">${clientName}</div>
                </div>
                <div class="field">
                  <span class="label">Email:</span>
                  <div class="value"><a href="mailto:${clientEmail}">${clientEmail}</a></div>
                </div>
                <div class="field">
                  <span class="label">Phone:</span>
                  <div class="value"><a href="tel:${clientPhone}">${clientPhone}</a></div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">⚖️ Lawyer Information</div>
                <div class="field">
                  <span class="label">Name:</span>
                  <div class="value">${lawyerName}</div>
                </div>
                ${lawyerEmail ? `
                <div class="field">
                  <span class="label">Email:</span>
                  <div class="value"><a href="mailto:${lawyerEmail}">${lawyerEmail}</a></div>
                </div>
                ` : ''}
              </div>
              
              <div class="section">
                <div class="section-title">📋 Consultation Details</div>
                <div class="field">
                  <span class="label">Case Type:</span>
                  <div class="value">${caseType}</div>
                </div>
                <div class="field">
                  <span class="label">Description:</span>
                  <div class="value">${caseDescription}</div>
                </div>
                <div class="field">
                  <span class="label">Preferred Date:</span>
                  <div class="value">${new Date(preferredDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</div>
                </div>
                <div class="field">
                  <span class="label">Preferred Time:</span>
                  <div class="value">${preferredTime}</div>
                </div>
              </div>
              
              <div class="footer">
                <p>This consultation was booked on the LegalIQ platform</p>
                <p>Booked on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Consultation Booking - LegalIQ

Consultation Type: ${consultationType === 'video' ? 'VIDEO CONSULTATION' : 'IN-PERSON CONSULTATION'}
${amount ? `Amount: ₹${amount}` : ''}

CLIENT INFORMATION:
Name: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone}

LAWYER INFORMATION:
Name: ${lawyerName}
${lawyerEmail ? `Email: ${lawyerEmail}` : ''}

CONSULTATION DETAILS:
Case Type: ${caseType}
Description: ${caseDescription}
Preferred Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
Preferred Time: ${preferredTime}

---
Booked on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('New consultation notification email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending new consultation notification email:', error);
      // Don't throw error - consultation should succeed even if email fails
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: userEmail,
      subject: 'Password Reset Request - LegalIQ',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
              font-size: 16px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .link {
              color: #667eea;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              
              <p>We received a request to reset your password for your LegalIQ account. If you didn't make this request, please ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <center>
                <a href="${resetURL}" class="button">Reset Password</a>
              </center>
              
              <p>Or copy and paste this link into your browser:</p>
              <p class="link">${resetURL}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>For security reasons, you can only use this link once</li>
                  <li>If you didn't request this reset, please secure your account immediately</li>
                </ul>
              </div>
              
              <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>If you need help, contact us at ${this.recipientEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request - LegalIQ

Dear ${userName},

We received a request to reset your password for your LegalIQ account. If you didn't make this request, please ignore this email.

To reset your password, visit this link:
${resetURL}

IMPORTANT:
- This link will expire in 1 hour
- For security reasons, you can only use this link once
- If you didn't request this reset, please secure your account immediately

If you're having trouble with the link, copy and paste it into your web browser.

Best regards,
The LegalIQ Team

---
This is an automated email. Please do not reply to this message.
If you need help, contact us at ${this.recipientEmail}
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Update recipient email (for admin panel in future)
  updateRecipientEmail(newEmail) {
    this.recipientEmail = newEmail;
  }
}

module.exports = new EmailService();
