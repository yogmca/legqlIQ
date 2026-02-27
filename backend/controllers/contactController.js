const emailService = require('../services/emailService');

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number'
      });
    }

    // Validate message length
    if (message.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Message should be at least 20 characters'
      });
    }

    // Send email to admin
    const emailResult = await emailService.sendContactEmail({
      name,
      email,
      phone,
      subject,
      message
    });

    // Send auto-reply to user
    await emailService.sendAutoReply(email, name);

    // Log the contact form submission
    console.log('Contact form submitted:', {
      name,
      email,
      phone,
      subject,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Error in contact form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or email us directly at support@legaliq.in'
    });
  }
};

// Update contact email (for admin use)
exports.updateContactEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    emailService.updateRecipientEmail(newEmail);

    res.status(200).json({
      success: true,
      message: 'Contact email updated successfully',
      newEmail
    });

  } catch (error) {
    console.error('Error updating contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact email'
    });
  }
};
