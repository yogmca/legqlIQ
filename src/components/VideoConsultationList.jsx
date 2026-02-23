import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './VideoConsultationList.css';
import { lawyerService } from '../services/lawyerService';
import authService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const VideoConsultationList = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check if current user is a lawyer
  const currentUser = authService.getUser();
  const isLawyer = currentUser?.role === 'lawyer';

  // Debug logging
  console.log('VideoConsultationList - Current User:', currentUser);
  console.log('VideoConsultationList - Is Lawyer?:', isLawyer);
  console.log('VideoConsultationList - User Role:', currentUser?.role);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const result = await lawyerService.fetchInitialLawyers(50);
      setLawyers(result.data);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = (lawyer) => {
    const user = authService.getUser();
    if (!user) {
      alert('Please login to book a video consultation');
      navigate('/login');
      return;
    }
    
    // Prevent lawyers from booking consultations
    if (user.role === 'lawyer') {
      alert('Lawyers cannot book consultations with other lawyers. This feature is only available for clients.');
      return;
    }
    
    setSelectedLawyer(lawyer);
    setShowPaymentModal(true);
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpec = selectedSpecialization === 'All Specializations' || 
                       lawyer.specialization.includes(selectedSpecialization);
    return matchesSearch && matchesSpec;
  });

  const specializations = ['All Specializations', 'Criminal Law', 'Family Law', 'Corporate Law', 
                          'Property Law', 'Tax Law', 'Civil Law', 'Labour Law', 'Consumer Law'];

  return (
    <div className="video-consultation-page">
      <div className="consultation-page-logo">
        <Logo />
      </div>
      
      <header className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Back to Home
          </button>
          <h1 className="page-title">Video Consultation</h1>
          <p className="page-subtitle">Book instant video consultations with verified lawyers</p>
        </div>
      </header>

      <div className="consultation-container">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search lawyers by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Specialization:</label>
            <select 
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="filter-select"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading lawyers...</p>
          </div>
        ) : (
          <>
            {isLawyer ? (
              <div className="lawyer-restriction-message">
                <div className="restriction-icon">⚖️</div>
                <h2>Lawyer Account Detected</h2>
                <p>As a registered lawyer on our platform, you cannot book consultations with other lawyers.</p>
                <p>This feature is exclusively available for clients seeking legal assistance.</p>
                <div className="restriction-actions">
                  <button onClick={() => navigate('/')} className="btn-home">
                    Go to Homepage
                  </button>
                  <button onClick={() => navigate('/appointments')} className="btn-appointments">
                    View My Appointments
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="results-info">
                  <p>Showing {filteredLawyers.length} lawyers available for video consultation</p>
                </div>

                <div className="lawyers-consultation-grid">
                  {filteredLawyers.map((lawyer) => (
                    <div key={lawyer.id} className="consultation-lawyer-card">
                  <div className="lawyer-header">
                    <div className="lawyer-avatar-large">
                      {lawyer.name.split(' ')[1]?.[0] || lawyer.name[0]}
                    </div>
                    <div className="lawyer-info">
                      <h3>{lawyer.name}</h3>
                      <p className="bar-reg">Bar Reg: {lawyer.barRegistrationNo}</p>
                      <div className="rating">
                        ⭐ 4.8 <span className="reviews">(120 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="specialization-badges">
                    {lawyer.specialization.slice(0, 3).map((spec, index) => (
                      <span key={index} className="badge">{spec}</span>
                    ))}
                  </div>

                  <div className="lawyer-details">
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">💼</span>
                      <span>{lawyer.experience} years experience</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">🗣️</span>
                      <span>{lawyer.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="consultation-pricing">
                    <div className="price-info">
                      <span className="price">₹1</span>
                      <span className="duration">/ 30 minutes (Testing)</span>
                    </div>
                    <div className="availability">
                      <span className="status-dot available"></span>
                      Available Now
                    </div>
                  </div>

                  <button 
                    className="btn-book-consultation"
                    onClick={() => handleBookConsultation(lawyer)}
                  >
                    <span className="icon">📹</span>
                    Book Video Consultation
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showPaymentModal && selectedLawyer && (
        <PaymentModal
          lawyer={selectedLawyer}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedLawyer(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ lawyer, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [caseDescription, setCaseDescription] = useState('');

  const consultationFee = 1; // Testing amount - ₹1

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Validate all required fields
    const missingFields = [];
    if (!consultationDate) missingFields.push('Consultation Date');
    if (!consultationTime) missingFields.push('Preferred Time');
    if (!caseDescription.trim()) missingFields.push('Case Description');
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`);
      return;
    }

    const user = authService.getUser();
    const token = authService.getToken();
    
    console.log('User:', user);
    console.log('Token exists:', !!token);
    
    if (!user || !token) {
      alert('Please login to continue. You are not authenticated.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Create order on backend
      console.log('Creating order with data:', {
        amount: consultationFee,
        lawyerId: lawyer.id,
        lawyerName: lawyer.name,
        consultationDate,
        consultationTime,
        caseDescription
      });

      const orderResponse = await fetch(`${API_URL}/consultations/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          amount: consultationFee,
          lawyerId: lawyer.id,
          lawyerName: lawyer.name,
          consultationDate,
          consultationTime,
          caseDescription
        })
      });

      console.log('Order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Order creation failed - Status:', orderResponse.status);
        console.error('Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Failed to create order' };
        }
        
        throw new Error(errorData.message || `Server error: ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LegalIQ',
        description: `Video Consultation with ${lawyer.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${API_URL}/consultations/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                consultationId: orderData.consultationId
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyResponse.json();
            
            alert('Payment successful! Redirecting to appointments page...');
            onClose();
            
            // Navigate to appointments page instead of video consultation
            // The video consultation feature requires WebRTC setup
            navigate('/appointments');
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed';
      
      if (errorMessage.includes('Razorpay') || errorMessage.includes('key')) {
        alert('⚠️ Razorpay is not configured!\n\nTo enable payments:\n1. Sign up at razorpay.com\n2. Get Test API Keys\n3. Update backend/.env and .env files\n4. Restart servers\n\nSee VIDEO_CONSULTATION_PAYMENT_GUIDE.md for details.');
      } else {
        alert(`Payment failed: ${errorMessage}\n\nPlease check:\n- You are logged in\n- Backend server is running\n- All form fields are filled`);
      }
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Video Consultation</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="lawyer-summary">
            <div className="lawyer-avatar-small">
              {lawyer.name.split(' ')[1]?.[0] || lawyer.name[0]}
            </div>
            <div>
              <h3>{lawyer.name}</h3>
              <p>{lawyer.specialization.join(', ')}</p>
            </div>
          </div>

          <div className="form-group">
            <label>Consultation Date *</label>
            <input
              type="date"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              min={today}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Time *</label>
            <input
              type="time"
              value={consultationTime}
              onChange={(e) => setConsultationTime(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Case Description *</label>
            <textarea
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder="Briefly describe your legal matter..."
              className="form-textarea"
              rows="4"
              required
            />
          </div>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Consultation Fee (30 min)</span>
              <span>₹{consultationFee}</span>
            </div>
            <div className="summary-row">
              <span>Platform Fee</span>
              <span>₹0</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>₹{consultationFee}</span>
            </div>
          </div>

          <button 
            className="btn-proceed-payment"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ₹${consultationFee} & Book Consultation`}
          </button>

          <p className="payment-note">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultationList;
