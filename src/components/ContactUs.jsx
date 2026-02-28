import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './ContactUs.css';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message should be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://legaliq.in/api'}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page">
      {/* Logo Header */}
      <div className="contact-page-header">
        <Logo variant="large" />
      </div>

      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We're here to help. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="info-icon">📧</div>
            <h3>Email Us</h3>
            <p>support@legaliq.in</p>
            <small>We'll respond within 24 hours</small>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">📞</div>
            <h3>Call Us</h3>
            <p>+91 1800-123-4567</p>
            <small>Mon-Sat, 9 AM - 6 PM IST</small>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">📍</div>
            <h3>Visit Us</h3>
            <p>Bangalore, Karnataka</p>
            <small>India</small>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">⏰</div>
            <h3>Business Hours</h3>
            <p>Monday - Saturday</p>
            <small>9:00 AM - 6:00 PM IST</small>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-card">
            <h2>Send us a Message</h2>
            <p className="form-subtitle">Fill out the form below and we'll get back to you shortly</p>

            {submitStatus === 'success' && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                <div>
                  <strong>Message sent successfully!</strong>
                  <p>Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠</span>
                <div>
                  <strong>Failed to send message</strong>
                  <p>Please try again or email us directly at support@legaliq.in</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'error' : ''}
                  placeholder="What is this regarding?"
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'error' : ''}
                  placeholder="Please describe your query in detail (minimum 20 characters)"
                  rows="6"
                />
                {errors.message && <span className="error-message">{errors.message}</span>}
                <small className="char-count">{formData.message.length} characters</small>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-card">
            <h3>How quickly will I get a response?</h3>
            <p>We typically respond to all inquiries within 24 hours during business days.</p>
          </div>
          <div className="faq-card">
            <h3>Can I book a consultation directly?</h3>
            <p>Yes! Visit our <a href="/lawyers">Find Lawyers</a> page to browse and book consultations.</p>
          </div>
          <div className="faq-card">
            <h3>Do you offer video consultations?</h3>
            <p>Absolutely! Check out our <a href="/video-consultations">Video Consultation</a> service.</p>
          </div>
          <div className="faq-card">
            <h3>Is my information secure?</h3>
            <p>Yes, we use industry-standard encryption to protect all your personal information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
