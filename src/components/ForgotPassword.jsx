import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmailSent(true);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left">
        <div className="forgot-password-branding">
          <Link to="/" className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
                <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
              </svg>
            </div>
            <h1 className="logo-text">LegalIQ</h1>
          </Link>
          <h2 className="tagline">Secure Password Recovery</h2>
          <p className="description">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div className="forgot-password-right">
        <div className="forgot-password-form-container">
          <div className="forgot-password-header">
            <div className="icon-wrapper">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="url(#gradient)"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2>Forgot Password?</h2>
            <p>No worries, we'll send you reset instructions</p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="forgot-password-form">
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="reset-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="back-to-login">
                <Link to="/login">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
                  </svg>
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="success-message-container">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#28a745"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Check Your Email</h3>
              <p className="success-message">{message}</p>
              <div className="email-instructions">
                <p>We've sent a password reset link to your email address. Please check your inbox and follow the instructions.</p>
                <ul>
                  <li>The link will expire in 1 hour</li>
                  <li>Check your spam folder if you don't see it</li>
                  <li>You can close this window</li>
                </ul>
              </div>
              <div className="action-buttons">
                <Link to="/login" className="login-button">
                  Back to Login
                </Link>
                <button 
                  onClick={() => {
                    setEmailSent(false);
                    setMessage('');
                  }}
                  className="resend-button"
                >
                  Resend Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
