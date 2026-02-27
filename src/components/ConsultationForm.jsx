import React, { useState, useEffect } from 'react';
import './ConsultationForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ConsultationForm = ({ lawyer, onClose, onSubmit }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Consultation form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    caseType: '',
    preferredDate: '',
    preferredTime: '',
    caseDescription: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        setIsLoggedIn(true);
        
        // Check if user is a lawyer
        if (parsedUser.role === 'lawyer') {
          alert('Lawyers cannot book consultations with other lawyers. This feature is only available for clients.');
          onClose();
          return;
        }
        
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          name: parsedUser.name || '',
          phone: parsedUser.phone || '',
          email: parsedUser.email || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.classList.remove('modal-open');
    };
  }, []);

  const caseTypes = [
    'Criminal Law',
    'Civil Law',
    'Family Law',
    'Corporate Law',
    'Property Law',
    'Labour Law',
    'Tax Law',
    'Constitutional Law',
    'Consumer Protection',
    'Intellectual Property',
    'Other'
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Login handlers
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUserData(data.user);
        setIsLoggedIn(true);
        setShowLoginForm(false);
        
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || ''
        }));
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Unable to connect to server. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Store the current lawyer info to redirect back after login
    localStorage.setItem('pendingConsultation', JSON.stringify({
      lawyerId: lawyer.id,
      lawyerName: lawyer.name
    }));
    window.location.href = `${API_URL}/auth/google`;
  };

  // Consultation form handlers
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.caseType) {
      newErrors.caseType = 'Please select a case type';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a preferred date';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.preferredDate = 'Date cannot be in the past';
      }
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select a preferred time';
    }

    if (!formData.caseDescription.trim()) {
      newErrors.caseDescription = 'Please provide a brief description of your case';
    } else if (formData.caseDescription.trim().length < 20) {
      newErrors.caseDescription = 'Description should be at least 20 characters';
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

    try {
      // Include full lawyer data for backend to create/update lawyer record
      const consultationData = {
        ...formData,
        lawyerId: lawyer.id || lawyer._id,
        lawyerName: lawyer.name,
        lawyerEmail: lawyer.email,
        lawyerData: {
          barRegistrationNo: lawyer.barRegistrationNo,
          specialization: lawyer.specialization,
          experience: lawyer.experience,
          location: lawyer.location,
          court: lawyer.court,
          phone: lawyer.phone,
          address: lawyer.address,
          languages: lawyer.languages,
          education: lawyer.education,
          description: lawyer.description
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Submitting consultation data:', consultationData);
      await onSubmit(consultationData);
    } catch (error) {
      console.error('Error submitting consultation:', error);
      const errorMessage = error.message || 'Failed to book consultation. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="consultation-modal-overlay" onClick={onClose}>
      <div className="consultation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="consultation-modal-header">
          <h2>Book Video Consultation</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="lawyer-info-banner">
          <div className="lawyer-avatar-small">
            {lawyer.name.split(' ')[1]?.[0] || lawyer.name[0]}
          </div>
          <div>
            <h3>{lawyer.name}</h3>
            <p>{lawyer.specialization.join(', ')}</p>
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="login-required-section">
            {!showLoginForm ? (
              <>
                <div className="login-icon">🔐</div>
                <h3>Login Required</h3>
                <p>Please login to book a consultation with {lawyer.name}</p>
                
                <div className="login-options">
                  <button 
                    className="btn-login-primary" 
                    onClick={() => setShowLoginForm(true)}
                  >
                    Login with Email
                  </button>
                  
                  <button 
                    className="btn-login-google" 
                    onClick={handleGoogleLogin}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                      <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="register-prompt">
                  <p>Don't have an account?</p>
                  <a href="/register" className="btn-register-link">
                    Create Account
                  </a>
                </div>
              </>
            ) : (
              <div className="embedded-login-form">
                <button 
                  className="back-btn" 
                  onClick={() => setShowLoginForm(false)}
                >
                  ← Back
                </button>
                
                <h3>Login to Continue</h3>
                <p>Enter your credentials to book consultation</p>

                {loginError && (
                  <div className="error-message-box">
                    <span className="error-icon">⚠</span>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="login-form-embedded">
                  <div className="form-group">
                    <label htmlFor="emailOrPhone">Email or Phone Number</label>
                    <input
                      type="text"
                      id="emailOrPhone"
                      name="emailOrPhone"
                      value={loginData.emailOrPhone}
                      onChange={handleLoginChange}
                      placeholder="Enter your email or phone"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-login-submit"
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="divider-text">
                  <span>or</span>
                </div>

                <button 
                  className="btn-login-google-alt" 
                  onClick={handleGoogleLogin}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="consultation-form">
            <div className="logged-in-banner">
              <span className="success-icon">✓</span>
              <span>Logged in as {userData?.name || userData?.email}</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="caseType">Case Type *</label>
              <select
                id="caseType"
                name="caseType"
                value={formData.caseType}
                onChange={handleChange}
                className={errors.caseType ? 'error' : ''}
              >
                <option value="">Select case type</option>
                {caseTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.caseType && <span className="error-message">{errors.caseType}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredDate">Preferred Date *</label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={errors.preferredDate ? 'error' : ''}
                />
                {errors.preferredDate && <span className="error-message">{errors.preferredDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time *</label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className={errors.preferredTime ? 'error' : ''}
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.preferredTime && <span className="error-message">{errors.preferredTime}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="caseDescription">Case Description *</label>
              <textarea
                id="caseDescription"
                name="caseDescription"
                value={formData.caseDescription}
                onChange={handleChange}
                placeholder="Please provide a brief description of your case (minimum 20 characters)"
                rows="5"
                className={errors.caseDescription ? 'error' : ''}
              />
              {errors.caseDescription && <span className="error-message">{errors.caseDescription}</span>}
              <small className="char-count">{formData.caseDescription.length} characters</small>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Book Consultation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConsultationForm;
