import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import LocationAutocomplete from './LocationAutocomplete';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';


const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(''); // 'client' or 'lawyer'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    // Lawyer-specific fields
    barRegistrationNo: '',
    specialization: [],
    experience: '',
    location: '',
    court: '',
    education: '',
    consultationFee: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // Start at 0 for user type selection
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

  const specializationOptions = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleSpecializationToggle = (spec) => {
    setSelectedSpecializations(prev => {
      if (prev.includes(spec)) {
        return prev.filter(s => s !== spec);
      } else {
        return [...prev, spec];
      }
    });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateLawyerFields = () => {
    if (!formData.barRegistrationNo.trim()) {
      setError('Please enter your Bar Registration Number');
      return false;
    }
    if (selectedSpecializations.length === 0) {
      setError('Please select at least one specialization');
      return false;
    }
    if (!formData.experience || formData.experience < 0) {
      setError('Please enter valid years of experience');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Please enter your location');
      return false;
    }
    if (!formData.court.trim()) {
      setError('Please enter the court where you practice');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && userType === 'lawyer' && validateLawyerFields()) {
      setStep(3);
    } else if (step === 2 && userType === 'client') {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      
      // Set role based on user type
      registrationData.role = userType;
      
      // Update specialization array
      if (userType === 'lawyer') {
        registrationData.specialization = selectedSpecializations;
      }

      // Choose endpoint based on user type
      const endpoint = userType === 'lawyer' 
        ? `${API_URL}/auth/register-lawyer`
        : `${API_URL}/auth/register`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call onRegister callback if provided
        if (onRegister) {
          onRegister(data.user);
        }
        
        // Navigate to home page
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-branding">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
                <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
              </svg>
            </div>
            <h1 className="logo-text">LegalIQ</h1>
          </div>
          <h2 className="tagline">Join India's Leading Legal Platform</h2>
          <p className="description">
            {userType === 'lawyer' 
              ? 'Register as a lawyer and connect with clients seeking legal assistance.'
              : 'Get access to thousands of verified lawyers, instant consultations, and comprehensive legal support.'}
          </p>
          <div className="stats">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Verified Lawyers</p>
            </div>
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Happy Clients</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Legal Support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-form-container">
          <div className="register-header">
            <h2>Create Your Account</h2>
            <p>Start your legal journey with LegalIQ</p>
          </div>

          <div className="progress-indicator">
            <div className={`progress-step ${step >= 0 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>User Type</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Basic Info</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>{userType === 'lawyer' ? 'Professional' : 'Personal'}</span>
            </div>
            {userType === 'lawyer' && (
              <>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-number">4</div>
                  <span>Details</span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Step 0: User Type Selection */}
            {step === 0 && (
              <div className="form-step">
                <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                  I want to register as:
                </h3>
                <div className="user-type-selection">
                  <div 
                    className={`user-type-card ${userType === 'client' ? 'selected' : ''}`}
                    onClick={() => setUserType('client')}
                  >
                    <div className="user-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <h4>Client</h4>
                    <p>Find and consult with lawyers</p>
                  </div>
                  
                  <div 
                    className={`user-type-card ${userType === 'lawyer' ? 'selected' : ''}`}
                    onClick={() => setUserType('lawyer')}
                  >
                    <div className="user-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
                        <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
                      </svg>
                    </div>
                    <h4>Lawyer</h4>
                    <p>Offer legal services to clients</p>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => userType && setStep(1)} 
                  className="next-button"
                  disabled={!userType}
                  style={{ marginTop: '30px' }}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
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
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(0)} className="back-button">
                    Back
                  </button>
                  <button type="button" onClick={handleNext} className="next-button">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Lawyer Professional Details OR Client Personal Details */}
            {step === 2 && userType === 'lawyer' && (
              <div className="form-step">
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Professional Information</h3>
                
                <div className="form-group">
                  <label htmlFor="barRegistrationNo">Bar Registration Number *</label>
                  <input
                    type="text"
                    id="barRegistrationNo"
                    name="barRegistrationNo"
                    value={formData.barRegistrationNo}
                    onChange={handleChange}
                    placeholder="e.g., KAR/2015/12345"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specialization * (Select at least one)</label>
                  <div className="specialization-grid">
                    {specializationOptions.map(spec => (
                      <div 
                        key={spec}
                        className={`specialization-chip ${selectedSpecializations.includes(spec) ? 'selected' : ''}`}
                        onClick={() => handleSpecializationToggle(spec)}
                      >
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="experience">Years of Experience *</label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="consultationFee">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      id="consultationFee"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      placeholder="e.g., 1500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location/City *</label>
                    <LocationAutocomplete
                      value={formData.location}
                      onChange={(value) => setFormData({ ...formData, location: value })}
                      placeholder="e.g., Bangalore"
                      defaultValue="Bangalore"
                      required={true}
                      id="location"
                      name="location"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="court">Court *</label>
                    <input
                      type="text"
                      id="court"
                      name="court"
                      value={formData.court}
                      onChange={handleChange}
                      placeholder="e.g., Karnataka High Court"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="education">Education/Qualifications</label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g., LLB from National Law School"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)} className="back-button">
                    Back
                  </button>
                  <button type="button" onClick={handleNext} className="next-button">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Client Personal Details */}
            {step === 2 && userType === 'client' && (
              <div className="form-step">
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Personal Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address.street">Street Address</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="House/Flat No., Street Name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.state">State</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.pincode">Pincode</label>
                    <input
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)} className="back-button">
                    Back
                  </button>
                  <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Lawyer Personal Details */}
            {step === 3 && userType === 'lawyer' && (
              <div className="form-step">
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Personal Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address.street">Street Address</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="House/Flat No., Street Name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.state">State</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.pincode">Pincode</label>
                    <input
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setStep(2)} className="back-button">
                    Back
                  </button>
                  <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
