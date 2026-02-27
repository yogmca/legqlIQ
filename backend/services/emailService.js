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
    // You'll need to set up an App Password in Gmail settings
    this.transporter = nodemailer.createTransporter({
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

  // Update recipient email (for admin panel in future)
  updateRecipientEmail(newEmail) {
    this.recipientEmail = newEmail;
  }
}

module.exports = new EmailService();
