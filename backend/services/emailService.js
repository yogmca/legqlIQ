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
    const { name, email, phone, role, dateOfBirth, gender, address, professionalType } = userData;

    // Determine display label for role/professional type
    const roleLabel = role === 'lawyer' ? 'Lawyer' :
                      role === 'tax-consultant' ? 'Tax Consultant' :
                      role === 'auditor' ? 'Auditor' :
                      professionalType === 'lawyer' ? 'Lawyer' :
                      professionalType === 'tax-consultant' ? 'Tax Consultant' :
                      professionalType === 'auditor' ? 'Auditor' : 'Client';

    const roleIcon = role === 'lawyer' || professionalType === 'lawyer' ? '⚖️' :
                     role === 'tax-consultant' || professionalType === 'tax-consultant' ? '💰' :
                     role === 'auditor' || professionalType === 'auditor' ? '📊' : '👤';

    const roleColor = role === 'lawyer' || professionalType === 'lawyer' ? '#28a745' :
                      role === 'tax-consultant' || professionalType === 'tax-consultant' ? '#fd7e14' :
                      role === 'auditor' || professionalType === 'auditor' ? '#007bff' : '#6c757d';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: this.recipientEmail,
      subject: `🆕 New ${roleLabel} Registration - LegalIQ`,
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
              background: ${roleColor};
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
                <span class="badge">${roleIcon} ${roleLabel.toUpperCase()}</span>
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

User Type: ${roleLabel.toUpperCase()}

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

  // Send welcome email to newly registered user
  async sendWelcomeEmail(userEmail, userName, userRole, professionalType = 'user') {
    // Determine professional type display
    const profTypeDisplay = professionalType === 'lawyer' ? 'Lawyer' :
                           professionalType === 'tax-consultant' ? 'Tax Consultant' :
                           professionalType === 'auditor' ? 'Auditor' : 'Client';
    
    const profIcon = professionalType === 'lawyer' ? '⚖️' :
                     professionalType === 'tax-consultant' ? '💰' :
                     professionalType === 'auditor' ? '📊' : '👤';
    
    const profColor = professionalType === 'lawyer' ? '#28a745' :
                      professionalType === 'tax-consultant' ? '#fd7e14' :
                      professionalType === 'auditor' ? '#007bff' : '#6c757d';

    // Personalized welcome message based on professional type
    let welcomeMessage = '';
    let nextSteps = '';
    
    if (professionalType === 'lawyer') {
      welcomeMessage = 'Welcome to LegalIQ! We\'re excited to have you join our network of legal professionals.';
      nextSteps = `
        <li><strong>Complete Your Profile:</strong> Add your specializations, experience, and credentials</li>
        <li><strong>Get Verified:</strong> Our team will review your bar registration details</li>
        <li><strong>Start Receiving Clients:</strong> Once verified, clients can book consultations with you</li>
        <li><strong>Set Your Availability:</strong> Manage your consultation schedule and fees</li>
      `;
    } else if (professionalType === 'tax-consultant') {
      welcomeMessage = 'Welcome to LegalIQ! We\'re thrilled to have you join our network of tax professionals.';
      nextSteps = `
        <li><strong>Complete Your Profile:</strong> Add your specializations in tax planning, GST, compliance, etc.</li>
        <li><strong>Get Verified:</strong> Our team will review your registration details</li>
        <li><strong>Connect with Clients:</strong> Once verified, clients can book consultations with you</li>
        <li><strong>Set Your Services:</strong> Define your consultation fees and availability</li>
      `;
    } else if (professionalType === 'auditor') {
      welcomeMessage = 'Welcome to LegalIQ! We\'re delighted to have you join our network of audit professionals.';
      nextSteps = `
        <li><strong>Complete Your Profile:</strong> Add your audit specializations and certifications</li>
        <li><strong>Get Verified:</strong> Our team will review your registration details</li>
        <li><strong>Offer Your Services:</strong> Once verified, clients can book consultations with you</li>
        <li><strong>Manage Your Schedule:</strong> Set your consultation fees and availability</li>
      `;
    } else {
      welcomeMessage = 'Welcome to LegalIQ! We\'re glad to have you join our platform.';
      nextSteps = `
        <li><strong>Explore Professionals:</strong> Browse lawyers, tax consultants, and auditors</li>
        <li><strong>Book Consultations:</strong> Schedule video calls or in-person meetings</li>
        <li><strong>Get Expert Advice:</strong> Connect with verified professionals for your needs</li>
        <li><strong>Secure & Convenient:</strong> All payments and communications are secure</li>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: userEmail,
      subject: `Welcome to LegalIQ - Your Account is Ready! ${profIcon}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
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
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .badge {
              display: inline-block;
              padding: 8px 20px;
              background: ${profColor};
              color: white;
              border-radius: 25px;
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0;
            }
            .welcome-text {
              font-size: 16px;
              color: #555;
              margin: 20px 0;
            }
            .next-steps {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .next-steps h3 {
              color: #667eea;
              margin-top: 0;
            }
            .next-steps ul {
              padding-left: 20px;
            }
            .next-steps li {
              margin: 10px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 20px 0;
            }
            .features {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 20px 0;
            }
            .feature {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .feature-icon {
              font-size: 32px;
              margin-bottom: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .support-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to LegalIQ!</h1>
              <p>India's Leading Professional Services Platform</p>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <span class="badge">${profIcon} ${profTypeDisplay.toUpperCase()}</span>
              </div>
              
              <p style="font-size: 18px; color: #333;"><strong>Dear ${userName},</strong></p>
              
              <p class="welcome-text">${welcomeMessage}</p>
              
              <div class="next-steps">
                <h3>📋 Next Steps:</h3>
                <ul>
                  ${nextSteps}
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta-button">
                  Go to Dashboard →
                </a>
              </div>

              <div class="features">
                <div class="feature">
                  <div class="feature-icon">🔒</div>
                  <strong>Secure Platform</strong>
                  <p style="font-size: 12px; color: #666;">Your data is protected</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">💳</div>
                  <strong>Safe Payments</strong>
                  <p style="font-size: 12px; color: #666;">Secure transactions</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">📱</div>
                  <strong>24/7 Access</strong>
                  <p style="font-size: 12px; color: #666;">Anytime, anywhere</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">⭐</div>
                  <strong>Verified Pros</strong>
                  <p style="font-size: 12px; color: #666;">Trusted professionals</p>
                </div>
              </div>

              <div class="support-box">
                <strong>📞 Need Help?</strong><br>
                Our support team is here to assist you 24/7<br>
                Email: <a href="mailto:${this.recipientEmail}">${this.recipientEmail}</a>
              </div>

              <div class="footer">
                <p><strong>LegalIQ</strong> - Connecting You with the Right Professionals</p>
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to LegalIQ!

Dear ${userName},

${welcomeMessage}

You've successfully registered as a ${profTypeDisplay} on LegalIQ platform.

NEXT STEPS:
${nextSteps.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}

Visit your dashboard: ${process.env.CLIENT_URL || 'http://localhost:5173'}

PLATFORM FEATURES:
✓ Secure Platform - Your data is protected
✓ Safe Payments - Secure transactions
✓ 24/7 Access - Anytime, anywhere
✓ Verified Professionals - Trusted experts

NEED HELP?
Our support team is here to assist you 24/7
Email: ${this.recipientEmail}

---
LegalIQ - Connecting You with the Right Professionals
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} LegalIQ. All rights reserved.
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully to:', userEmail, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error - registration should succeed even if email fails
      return { success: false, error: error.message };
    }
  }

  // Update recipient email (for admin panel in future)
  updateRecipientEmail(newEmail) {
    this.recipientEmail = newEmail;
  }

  // Send consultation booking confirmation to client
  async sendConsultationBookingToClient(consultationData) {
    const {
      clientName,
      clientEmail,
      lawyerName,
      caseType,
      caseDescription,
      preferredDate,
      preferredTime,
      consultationType
    } = consultationData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: clientEmail,
      subject: `✅ Consultation Booked Successfully - LegalIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .badge { display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Consultation Booked!</h1>
              <p>Your consultation has been confirmed</p>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              <p>Your consultation has been successfully booked on LegalIQ platform.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <span class="badge">${consultationType === 'video' ? '🎥 VIDEO CONSULTATION' : '🏢 IN-PERSON CONSULTATION'}</span>
              </div>
              
              <div class="info-box">
                <h3 style="color: #667eea; margin-top: 0;">📋 Consultation Details</h3>
                <p><strong>Professional:</strong> ${lawyerName}</p>
                <p><strong>Case Type:</strong> ${caseType}</p>
                <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${preferredTime}</p>
                <p><strong>Description:</strong> ${caseDescription}</p>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>📌 Next Steps:</strong>
                <ul style="margin: 10px 0;">
                  <li>The professional will review your booking request</li>
                  <li>You will receive a confirmation once accepted</li>
                  <li>Check your dashboard for updates</li>
                  ${consultationType === 'video' ? '<li>Video call link will be shared before the consultation</li>' : '<li>Visit the professional\'s office at the scheduled time</li>'}
                </ul>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Consultation Booked Successfully - LegalIQ

Dear ${clientName},

Your consultation has been successfully booked on LegalIQ platform.

CONSULTATION DETAILS:
Professional: ${lawyerName}
Case Type: ${caseType}
Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
Time: ${preferredTime}
Type: ${consultationType === 'video' ? 'VIDEO CONSULTATION' : 'IN-PERSON CONSULTATION'}

NEXT STEPS:
- The professional will review your booking request
- You will receive a confirmation once accepted
- Check your dashboard for updates

Best regards,
The LegalIQ Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Consultation booking email sent to client:', clientEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending consultation booking email to client:', error);
      return { success: false, error: error.message };
    }
  }

  // Send consultation booking notification to professional
  async sendConsultationBookingToProfessional(consultationData) {
    const {
      clientName,
      clientPhone,
      lawyerName,
      lawyerEmail,
      caseType,
      caseDescription,
      preferredDate,
      preferredTime,
      consultationType
    } = consultationData;

    if (!lawyerEmail) {
      console.log('No lawyer email provided, skipping email notification');
      return { success: false, error: 'No lawyer email' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: lawyerEmail,
      subject: `🔔 New Consultation Request - LegalIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .badge { display: inline-block; padding: 5px 15px; background: #007bff; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Consultation Request</h1>
              <p>A client has requested a consultation with you</p>
            </div>
            <div class="content">
              <p>Dear <strong>${lawyerName}</strong>,</p>
              <p>You have received a new consultation request on LegalIQ platform.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <span class="badge">${consultationType === 'video' ? '🎥 VIDEO CONSULTATION' : '🏢 IN-PERSON CONSULTATION'}</span>
              </div>
              
              <div class="info-box">
                <h3 style="color: #667eea; margin-top: 0;">👤 Client Information</h3>
                <p><strong>Name:</strong> ${clientName}</p>
                <p><strong>Phone:</strong> ${clientPhone}</p>
              </div>
              
              <div class="info-box">
                <h3 style="color: #667eea; margin-top: 0;">📋 Consultation Details</h3>
                <p><strong>Case Type:</strong> ${caseType}</p>
                <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${preferredTime}</p>
                <p><strong>Description:</strong> ${caseDescription}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments" class="button">View in Dashboard</a>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px;">
                <strong>⚡ Action Required:</strong>
                <p>Please log in to your dashboard to accept or reschedule this consultation request.</p>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Consultation Request - LegalIQ

Dear ${lawyerName},

You have received a new consultation request on LegalIQ platform.

CLIENT INFORMATION:
Name: ${clientName}
Phone: ${clientPhone}

CONSULTATION DETAILS:
Case Type: ${caseType}
Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
Time: ${preferredTime}
Type: ${consultationType === 'video' ? 'VIDEO CONSULTATION' : 'IN-PERSON CONSULTATION'}
Description: ${caseDescription}

ACTION REQUIRED:
Please log in to your dashboard to accept or reschedule this consultation request.

Dashboard: ${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments

Best regards,
The LegalIQ Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Consultation booking email sent to professional:', lawyerEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending consultation booking email to professional:', error);
      return { success: false, error: error.message };
    }
  }

  // Send consultation accepted notification to client
  async sendConsultationAcceptedToClient(consultationData) {
    const {
      clientName,
      clientEmail,
      lawyerName,
      preferredDate,
      preferredTime,
      consultationType
    } = consultationData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: clientEmail,
      subject: `✅ Consultation Confirmed - LegalIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .badge { display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .info-box { background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Consultation Confirmed!</h1>
              <p>Your consultation has been accepted</p>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              <p>Great news! <strong>${lawyerName}</strong> has accepted your consultation request.</p>
              
              <div class="info-box">
                <h3 style="color: #28a745; margin-top: 0;">📅 Confirmed Appointment</h3>
                <p><strong>Professional:</strong> ${lawyerName}</p>
                <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${preferredTime}</p>
                <p><strong>Type:</strong> ${consultationType === 'video' ? 'Video Consultation' : 'In-Person Consultation'}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments" class="button">View Details</a>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px;">
                <strong>📌 Important:</strong>
                <ul style="margin: 10px 0;">
                  ${consultationType === 'video' ? '<li>Video call link will be shared before the consultation</li>' : '<li>Please arrive on time at the professional\'s office</li>'}
                  <li>Prepare any documents or questions in advance</li>
                  <li>You can reschedule or cancel from your dashboard if needed</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Consultation Confirmed - LegalIQ

Dear ${clientName},

Great news! ${lawyerName} has accepted your consultation request.

CONFIRMED APPOINTMENT:
Professional: ${lawyerName}
Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
Time: ${preferredTime}
Type: ${consultationType === 'video' ? 'Video Consultation' : 'In-Person Consultation'}

View Details: ${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments

Best regards,
The LegalIQ Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Consultation accepted email sent to client:', clientEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending consultation accepted email to client:', error);
      return { success: false, error: error.message };
    }
  }

  // Send consultation rescheduled notification
  async sendConsultationRescheduledToClient(consultationData) {
    const {
      clientName,
      clientEmail,
      lawyerName,
      preferredDate,
      preferredTime,
      reason
    } = consultationData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: clientEmail,
      subject: `📅 Consultation Rescheduled - LegalIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Consultation Rescheduled</h1>
              <p>Your appointment has been rescheduled</p>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              <p><strong>${lawyerName}</strong> has rescheduled your consultation to a new date and time.</p>
              
              <div class="info-box">
                <h3 style="color: #fd7e14; margin-top: 0;">📅 New Appointment Details</h3>
                <p><strong>Professional:</strong> ${lawyerName}</p>
                <p><strong>New Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>New Time:</strong> ${preferredTime}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments" class="button">View Details</a>
              </div>
              
              <p>If this new time doesn't work for you, please contact the professional or cancel and book a new consultation.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Consultation Rescheduled - LegalIQ

Dear ${clientName},

${lawyerName} has rescheduled your consultation to a new date and time.

NEW APPOINTMENT DETAILS:
Professional: ${lawyerName}
New Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
New Time: ${preferredTime}
${reason ? `Reason: ${reason}` : ''}

View Details: ${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments

Best regards,
The LegalIQ Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Consultation rescheduled email sent to client:', clientEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending consultation rescheduled email to client:', error);
      return { success: false, error: error.message };
    }
  }

  // Send consultation cancelled notification
  async sendConsultationCancelledToClient(consultationData) {
    const {
      clientName,
      clientEmail,
      lawyerName,
      preferredDate,
      preferredTime,
      reason
    } = consultationData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: clientEmail,
      subject: `❌ Consultation Cancelled - LegalIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Consultation Cancelled</h1>
              <p>Your appointment has been cancelled</p>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              <p>Your consultation with <strong>${lawyerName}</strong> has been cancelled.</p>
              
              <div class="info-box">
                <h3 style="color: #dc3545; margin-top: 0;">📅 Cancelled Appointment</h3>
                <p><strong>Professional:</strong> ${lawyerName}</p>
                <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${preferredTime}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/lawyers" class="button">Book Another Consultation</a>
              </div>
              
              <p>We apologize for any inconvenience. You can book a new consultation with another professional or try again later.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Consultation Cancelled - LegalIQ

Dear ${clientName},

Your consultation with ${lawyerName} has been cancelled.

CANCELLED APPOINTMENT:
Professional: ${lawyerName}
Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
Time: ${preferredTime}
${reason ? `Reason: ${reason}` : ''}

Book Another Consultation: ${process.env.CLIENT_URL || 'http://localhost:5173'}/lawyers

Best regards,
The LegalIQ Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Consultation cancelled email sent to client:', clientEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending consultation cancelled email to client:', error);
      return { success: false, error: error.message };
    }
  }

  // Send consultation cancelled notification to professional
  async sendConsultationCancelledToProfessional(consultationData) {
    const {
      clientName,
      lawyerName,
      lawyerEmail,
      preferredDate,
      preferredTime,
      reason
    } = consultationData;

    if (!lawyerEmail) {
      console.log('No lawyer email provided, skipping email notification');
      return { success: false, error: 'No lawyer email' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@legaliq.in',
      to: lawyerEmail,
      subject: `❌ Consultation Cancelled by Client - LegalIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Consultation Cancelled</h1>
              <p>A client has cancelled their consultation</p>
            </div>
            <div class="content">
              <p>Dear <strong>${lawyerName}</strong>,</p>
              <p>The consultation with <strong>${clientName}</strong> has been cancelled.</p>
              
              <div class="info-box">
                <h3 style="color: #dc3545; margin-top: 0;">📅 Cancelled Appointment</h3>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${preferredTime}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <p>This time slot is now available for other bookings.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The LegalIQ Team</strong></p>
            </div>
            <div class="footer">
              <p>LegalIQ - Your Trusted Legal Partner</p>
              <p>© ${new Date().getFullYear()} LegalIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Consultation Cancelled - LegalIQ

Dear ${lawyerName},

The consultation with ${clientName} has been cancelled.

CANCELLED APPOINTMENT:
Client: ${clientName}
Date: ${new Date(preferredDate).toLocaleDateString('en-IN')}
Time: ${preferredTime}
${reason ? `Reason: ${reason}` : ''}

This time slot is now available for other bookings.

Best regards,
The LegalIQ Team
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Consultation cancelled email sent to professional:', lawyerEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending consultation cancelled email to professional:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
