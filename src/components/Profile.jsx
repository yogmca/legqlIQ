import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import PaymentDetails from './PaymentDetails';
import './Profile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'professional', 'payment', or 'password'
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProfessional, setIsProfessional] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    profileImage: ''
  });

  const [professionalData, setProfessionalData] = useState({
    specialization: [],
    experience: '',
    location: '',
    court: '',
    education: '',
    consultationFee: '',
    description: '',
    languages: []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    // Check if user logged in via Google (they won't have a password)
    setIsGoogleUser(currentUser.googleId ? true : false);
    // Check if user is a professional
    const professional = currentUser.role === 'lawyer' || currentUser.role === 'tax-consultant' || currentUser.role === 'auditor';
    setIsProfessional(professional);
    
    fetchUserProfile();
    if (professional) {
      fetchProfessionalProfile();
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const userData = data.user;
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          gender: userData.gender || '',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            pincode: userData.address?.pincode || ''
          },
          profileImage: userData.profilePicture || ''
        });
        
        // Set image preview if profile picture exists
        if (userData.profilePicture) {
          setImagePreview(userData.profilePicture);
        }
        
        // Update isGoogleUser based on fetched data
        if (userData.googleId) {
          setIsGoogleUser(true);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionalProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/professional-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const prof = data.professional;
        setProfessionalData({
          specialization: prof.specialization || [],
          experience: prof.experience || '',
          location: prof.location || '',
          court: prof.court || '',
          education: prof.education || '',
          consultationFee: prof.consultationFee || '',
          description: prof.description || '',
          languages: prof.languages || []
        });
      }
    } catch (err) {
      console.error('Error fetching professional profile:', err);
    }
  };

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
    setSuccess('');
  };

  const handleProfessionalChange = (e) => {
    const { name, value } = e.target;
    setProfessionalData({
      ...professionalData,
      [name]: value
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    setError('');
    setSuccess('');
  };

  const handleProfessionalInfoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/auth/professional-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(professionalData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Professional profile updated successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.message || 'Failed to update professional profile');
      }
    } catch (err) {
      console.error('Error updating professional profile:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate phone number if provided
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        setError('Please enter a valid 10-digit phone number');
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      // Prepare data to send (include profileImage)
      const updateData = {
        ...formData,
        profilePicture: formData.profileImage // Map profileImage to profilePicture for backend
      };
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage with new user data
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess('Profile updated successfully!');
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (!passwordData.currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (!passwordData.newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Resize and compress image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 400x400)
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.8 quality)
          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          
          setFormData({
            ...formData,
            profileImage: base64String
          });
          setImagePreview(base64String);
          setError('');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    // Immediately update UI
    setFormData({
      ...formData,
      profileImage: ''
    });
    setImagePreview(null);
    
    // Save the deletion to backend
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: '' // Send empty string to delete photo
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage with new user data
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess('Profile photo removed successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to remove photo');
      }
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Unable to remove photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-content">
          <Link to="/" className="logo-link">
            <img src="/Legaliq.jpg" alt="LegalIQ Logo" className="header-logo" />
            <span className="logo-title">LegalIQ</span>
          </Link>
          <div className="header-text">
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-user-info">
            <div className="profile-avatar">
              {imagePreview || user?.profilePicture ? (
                <img
                  src={imagePreview || user?.profilePicture}
                  alt={user?.name}
                  className="profile-avatar-image"
                />
              ) : (
                <span className="profile-avatar-initials">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h3>{user?.name}</h3>
            <p className="user-email">{user?.email}</p>
            {user?.role && (
              <span className="user-role-badge">
                {user.role === 'lawyer' ? 'Lawyer' : 
                 user.role === 'tax-consultant' ? 'Tax Consultant' :
                 user.role === 'auditor' ? 'Auditor' : 'Client'}
              </span>
            )}
            {isGoogleUser && (
              <span className="google-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google Account
              </span>
            )}
          </div>

          <nav className="profile-nav">
            <button
              className={`profile-nav-item ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
              </svg>
              Basic Information
            </button>
            {isProfessional && (
              <button
                className={`profile-nav-item ${activeTab === 'professional' ? 'active' : ''}`}
                onClick={() => setActiveTab('professional')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM20 19H4V8H20V19Z" fill="currentColor"/>
                </svg>
                Professional Info
              </button>
            )}
            {isProfessional && (
              <button
                className={`profile-nav-item ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
                </svg>
                Payment Details
              </button>
            )}
            {!isGoogleUser && (
              <button
                className={`profile-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
                </svg>
                Change Password
              </button>
            )}
          </nav>
        </div>

        <div className="profile-content">
          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
              </svg>
              {success}
            </div>
          )}

          {activeTab === 'basic' && (
            <form onSubmit={handleBasicInfoSubmit} className="profile-form">
              <h2>Basic Information</h2>
              
              {/* Profile Photo Upload */}
              <div className="form-group">
                <label>Profile Photo (Optional)</label>
                <div className="profile-image-upload-container">
                  {imagePreview ? (
                    <div className="profile-image-preview-wrapper">
                      <img src={imagePreview} alt="Profile preview" className="profile-image-preview" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="remove-profile-image-btn"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="profileImageUpload" className="profile-image-upload-label">
                      <div className="profile-upload-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                        </svg>
                        <p>Click to upload photo</p>
                        <small>JPG, PNG or GIF (Max 5MB)</small>
                      </div>
                    </label>
                  )}
                  <input
                    type="file"
                    id="profileImageUpload"
                    name="profileImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                  Upload a professional photo to help others recognize you
                </small>
              </div>
              
              {isGoogleUser && (
                <div className="info-banner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
                  </svg>
                  <p>You're signed in with Google. You can update your additional information below (optional).</p>
                </div>
              )}
              
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
                  <label htmlFor="phone">Phone Number {!isGoogleUser && '*'}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    required={!isGoogleUser}
                  />
                  {isGoogleUser && (
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Optional - Add your phone number for better communication
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    min="1940-01-01"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
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

              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Address (Optional)</h3>

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
                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'professional' && isProfessional && (
            <form onSubmit={handleProfessionalInfoSubmit} className="profile-form">
              <h2>Professional Information</h2>
              <p className="form-description">
                Update your professional details to help clients find and connect with you.
              </p>

              <div className="form-group">
                <label htmlFor="specialization">Specialization *</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={professionalData.specialization.join(', ')}
                  onChange={(e) => setProfessionalData({
                    ...professionalData,
                    specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., Criminal Law, Family Law, Corporate Law"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Separate multiple specializations with commas
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experience">Years of Experience *</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={professionalData.experience}
                    onChange={handleProfessionalChange}
                    placeholder="Years"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="consultationFee">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    id="consultationFee"
                    name="consultationFee"
                    value={professionalData.consultationFee}
                    onChange={handleProfessionalChange}
                    placeholder="Amount in rupees"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={professionalData.location}
                  onChange={handleProfessionalChange}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="court">
                  {user?.role === 'lawyer' ? 'Court/Practice Area *' : 'Office/Firm Name *'}
                </label>
                <input
                  type="text"
                  id="court"
                  name="court"
                  value={professionalData.court}
                  onChange={handleProfessionalChange}
                  placeholder={user?.role === 'lawyer' ? 'e.g., High Court, District Court' : 'Your office or firm name'}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Education *</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={professionalData.education}
                  onChange={handleProfessionalChange}
                  placeholder="Your educational qualifications"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="languages">Languages</label>
                <input
                  type="text"
                  id="languages"
                  name="languages"
                  value={professionalData.languages.join(', ')}
                  onChange={(e) => setProfessionalData({
                    ...professionalData,
                    languages: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., English, Hindi, Kannada"
                />
                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Separate multiple languages with commas
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Professional Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={professionalData.description}
                  onChange={handleProfessionalChange}
                  placeholder="Brief description of your practice and expertise"
                  rows="4"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'payment' && isProfessional && (
            <div className="payment-details-wrapper">
              <PaymentDetails />
            </div>
          )}

          {activeTab === 'password' && !isGoogleUser && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <h2>Change Password</h2>
              <p className="form-description">
                Ensure your account is using a strong password to stay secure.
              </p>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                    aria-label={showPasswords.current ? "Hide password" : "Show password"}
                  >
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                    aria-label={showPasswords.new ? "Hide password" : "Show password"}
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                    aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
