import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AppointmentManager.css';
import VideoConsultation from './VideoConsultation';
import authService from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AppointmentManager = ({ userEmail }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [documents, setDocuments] = useState({});
  const [showDocuments, setShowDocuments] = useState({});
  const [documentUploadEnabled, setDocumentUploadEnabled] = useState(true);
  
  // Check if current user is a lawyer
  const currentUser = authService.getUser();
  const isLawyer = currentUser?.role === 'lawyer';

  // Fetch user's document upload feature flag from database
  useEffect(() => {
    const checkDocumentFeature = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        const data = await response.json();
        if (data.success && data.user) {
          // Get features.documentUpload from database (default true if not set)
          const isEnabled = data.user.features?.documentUpload !== false;
          setDocumentUploadEnabled(isEnabled);
          console.log('Document upload feature enabled:', isEnabled);
        }
      } catch (error) {
        console.error('Error fetching user features from database:', error);
        setDocumentUploadEnabled(true); // Default to enabled on error
      }
    };
    checkDocumentFeature();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [userEmail]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/consultations`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      const data = await response.json();
      
      console.log('=== AppointmentManager Debug ===');
      console.log('Fetched consultations:', data);
      console.log('Number of consultations:', data.consultations?.length);
      console.log('Consultations array:', data.consultations);
      
      if (data.success) {
        setAppointments(data.consultations);
        console.log('Set appointments state with:', data.consultations.length, 'items');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
    
    console.log('=== Filtering Appointments ===');
    console.log('Active tab:', activeTab);
    console.log('Total appointments:', appointments.length);
    console.log('Current date:', now);
    
    let filtered;
    switch (activeTab) {
      case 'upcoming':
        filtered = appointments.filter(apt => {
          const aptDate = new Date(apt.preferredDate);
          aptDate.setHours(0, 0, 0, 0);
          const isUpcoming = aptDate >= now && apt.status !== 'completed' && apt.status !== 'cancelled';
          console.log(`Appointment ${apt._id}: date=${aptDate}, status=${apt.status}, isUpcoming=${isUpcoming}`);
          return isUpcoming;
        });
        break;
      case 'past':
        filtered = appointments.filter(apt => {
          const aptDate = new Date(apt.preferredDate);
          aptDate.setHours(0, 0, 0, 0);
          const isPast = aptDate < now || apt.status === 'completed';
          console.log(`Appointment ${apt._id}: date=${aptDate}, status=${apt.status}, isPast=${isPast}`);
          return isPast;
        });
        break;
      case 'cancelled':
        filtered = appointments.filter(apt => apt.status === 'cancelled');
        break;
      default:
        filtered = appointments;
    }
    
    console.log('Filtered appointments:', filtered.length);
    console.log('=== End Filtering ===');
    return filtered;
  };

  const handleStartVideoCall = (appointment) => {
    setActiveVideoCall(appointment);
  };

  const handleEndVideoCall = async (callData) => {
    try {
      // Update appointment status
      await fetch(`${API_URL}/consultations/${activeVideoCall._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          status: 'completed',
          videoCallData: callData
        }),
      });

      setActiveVideoCall(null);
      fetchAppointments();
      alert('Video consultation completed successfully!');
    } catch (error) {
      console.error('Error ending video call:', error);
      alert('Failed to update consultation status');
    }
  };

  // Document upload functions
  const handleFileUpload = async (appointmentId, file) => {
    if (!file) return;

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit');
      return;
    }

    setUploadingDoc(appointmentId);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${API_URL}/consultations/${appointmentId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Document uploaded successfully!');
        fetchDocuments(appointmentId);
      } else {
        alert(data.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const fetchDocuments = async (appointmentId) => {
    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}/documents`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(prev => ({
          ...prev,
          [appointmentId]: data.documents
        }));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleDownloadDocument = async (appointmentId, documentId, filename) => {
    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();

      if (data.success && data.document) {
        // Convert base64 to blob and download
        const byteCharacters = atob(data.document.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.document.mimetype });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(data.message || 'Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleDeleteDocument = async (appointmentId, documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Document deleted successfully!');
        fetchDocuments(appointmentId);
      } else {
        alert(data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const toggleDocuments = (appointmentId) => {
    setShowDocuments(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));

    // Fetch documents if showing for the first time
    if (!showDocuments[appointmentId] && !documents[appointmentId]) {
      fetchDocuments(appointmentId);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAcceptAppointment = async (appointmentId) => {
    if (!window.confirm('Accept this consultation request?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Consultation accepted successfully!');
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to accept consultation');
      }
    } catch (error) {
      console.error('Error accepting appointment:', error);
      alert('Failed to accept consultation');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        alert('Consultation rejected');
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to reject consultation');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Failed to reject consultation');
    }
  };

  const [rescheduleData, setRescheduleData] = useState(null);

  const handleRescheduleAppointment = async (appointmentId, newDate, newTime, reason) => {
    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          preferredDate: newDate,
          preferredTime: newTime,
          reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Consultation rescheduled successfully!');
        setRescheduleData(null);
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to reschedule consultation');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Failed to reschedule consultation');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/consultations/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        alert('Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  // State for tracking payment in progress
  const [payingAppointmentId, setPayingAppointmentId] = useState(null);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Complete payment for a pending_payment consultation
  const handleCompletePayment = async (appointment) => {
    const user = authService.getUser();
    const token = authService.getToken();

    if (!user || !token) {
      alert('Please login to continue.');
      return;
    }

    // Check if consultation date has passed
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const aptDate = new Date(appointment.preferredDate);
    aptDate.setHours(0, 0, 0, 0);

    if (aptDate < now) {
      alert('This consultation date has already passed. Please book a new consultation.');
      // Cancel the expired appointment
      try {
        await fetch(`${API_URL}/consultations/cancel-pending-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ consultationId: appointment._id })
        });
        fetchAppointments();
      } catch (err) {
        console.error('Failed to cancel expired appointment:', err);
      }
      return;
    }

    setPayingAppointmentId(appointment._id);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setPayingAppointmentId(null);
        return;
      }

      // Call retry-payment endpoint to create a new Razorpay order for existing consultation
      const orderResponse = await fetch(`${API_URL}/consultations/retry-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consultationId: appointment._id })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ message: 'Failed to create payment order' }));
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LegalIQ',
        description: `Video Consultation with ${orderData.lawyerName || appointment.lawyerInfo?.name || 'Lawyer'}`,
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

            alert('Payment successful! Your consultation is now confirmed.');
            fetchAppointments(); // Refresh to show updated status
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
            console.log('Razorpay modal dismissed');
            setPayingAppointmentId(null);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || 'Unknown error'}\n\nYou can try again from the Appointments page.`);
        setPayingAppointmentId(null);
      });

      razorpayInstance.open();
      setPayingAppointmentId(null);

    } catch (error) {
      console.error('Complete payment error:', error);
      alert(`Payment failed: ${error.message}\n\nPlease try again.`);
      setPayingAppointmentId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      rescheduled: 'status-confirmed' // Use confirmed styling for rescheduled
    };

    const statusLabels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled & Confirmed'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredAppointments = getFilteredAppointments();

  if (activeVideoCall) {
    return (
      <VideoConsultation
        consultation={activeVideoCall}
        onClose={() => setActiveVideoCall(null)}
        onEndCall={handleEndVideoCall}
      />
    );
  }

  return (
    <div className="appointment-manager">
      <div className="appointment-container">
        <div className="appointment-nav">
          <Link to="/" className="logo-section">
            <img src="/Legaliq.jpg" alt="LegalIQ Logo" className="logo-image" />
            <h1 className="logo-text">LegalIQ</h1>
          </Link>
        </div>

        <div className="appointment-header">
          <h2>{isLawyer ? 'Client Consultations' : 'My Consultations'}</h2>
          {isLawyer && (
            <div className="lawyer-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"/>
              </svg>
              Lawyer Account
            </div>
          )}
          <button className="btn-refresh" onClick={fetchAppointments}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 2v6h6M16 18v-6h-6M17.65 6.35A8 8 0 1 0 6.35 17.65" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            Refresh
          </button>
        </div>

      <div className="appointment-tabs">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button
          className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>

      <div className="appointments-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3>No {activeTab} appointments</h3>
            <p>You don't have any {activeTab} consultations at the moment.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-card-header">
                <div className="lawyer-info">
                  <div className="lawyer-avatar-small">
                    {isLawyer
                      ? (appointment.clientInfo?.name || 'C').split(' ')[1]?.[0] || (appointment.clientInfo?.name || 'C')[0]
                      : (appointment.lawyerInfo?.name || appointment.lawyerName || 'L').split(' ')[1]?.[0] || (appointment.lawyerInfo?.name || appointment.lawyerName || 'L')[0]
                    }
                  </div>
                  <div>
                    <h3>
                      {isLawyer
                        ? (appointment.clientInfo?.name || appointment.name || 'Client')
                        : (appointment.lawyerInfo?.name || appointment.lawyerName || 'Lawyer')
                      }
                    </h3>
                    <p className="case-type">{appointment.caseType}</p>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="appointment-details">
                <div className="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{formatDate(appointment.preferredDate)}</span>
                </div>
                <div className="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                  <span>{appointment.preferredTime}</span>
                </div>
                {!isLawyer && (
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{appointment.clientInfo?.name || appointment.name || 'Client'}</span>
                  </div>
                )}
                {isLawyer && (
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span>{appointment.clientInfo?.email || 'No email'}</span>
                  </div>
                )}
              </div>

              <div className="appointment-description">
                <strong>Case Description:</strong>
                <p>{appointment.caseDescription}</p>
              </div>

              {/* Document Upload Section */}
              {documentUploadEnabled && (
                <div className="document-section">
                  <button
                    className="btn-toggle-documents"
                    onClick={() => toggleDocuments(appointment._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '10px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                    {showDocuments[appointment._id] ? '📂 Hide Documents' : '📁 Show Documents'}
                    {documents[appointment._id] && documents[appointment._id].length > 0 && (
                      <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {documents[appointment._id].length}
                      </span>
                    )}
                  </button>

                  {showDocuments[appointment._id] && (
                    <div className="documents-container" style={{
                      background: '#f9fafb',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      marginBottom: '10px'
                    }}>
                      {/* Upload Button */}
                      <div style={{ marginBottom: '15px' }}>
                        <label
                          htmlFor={`file-upload-${appointment._id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: uploadingDoc === appointment._id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            opacity: uploadingDoc === appointment._id ? 0.6 : 1
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8" stroke="white" strokeWidth="2" fill="none"/>
                            <line x1="12" y1="3" x2="12" y2="15" stroke="white" strokeWidth="2"/>
                          </svg>
                          {uploadingDoc === appointment._id ? 'Uploading...' : '📎 Upload Document'}
                        </label>
                        <input
                          id={`file-upload-${appointment._id}`}
                          type="file"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(appointment._id, e.target.files[0]);
                              e.target.value = ''; // Reset input
                            }
                          }}
                          disabled={uploadingDoc === appointment._id}
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                        />
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '5px',
                          marginLeft: '5px'
                        }}>
                          Max file size: 5MB. Supported: PDF, Word, Excel, PowerPoint, Images, Archives
                        </p>
                      </div>

                      {/* Documents List */}
                      {documents[appointment._id] && documents[appointment._id].length > 0 ? (
                        <div className="documents-list">
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '10px'
                          }}>
                            📄 Uploaded Documents ({documents[appointment._id].length})
                          </h4>
                          {documents[appointment._id].map((doc) => (
                            <div
                              key={doc._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                marginBottom: '8px'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: '#111827',
                                  marginBottom: '4px'
                                }}>
                                  📎 {doc.originalName}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#6b7280'
                                }}>
                                  {formatFileSize(doc.size)} • Uploaded by {doc.uploadedBy?.name || 'Unknown'} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleDownloadDocument(appointment._id, doc._id, doc.originalName)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}
                                  title="Download"
                                >
                                  ⬇️ Download
                                </button>
                                {doc.uploadedBy?._id === currentUser?._id && (
                                  <button
                                    onClick={() => handleDeleteDocument(appointment._id, doc._id)}
                                    style={{
                                      padding: '6px 12px',
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '500'
                                    }}
                                    title="Delete"
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          📭 No documents uploaded yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="appointment-actions">
                {/* Lawyer Actions for Pending Consultations */}
                {isLawyer && appointment.status === 'pending' && activeTab === 'upcoming' && !rescheduleData && (
                  <>
                    <button
                      className="btn-accept"
                      onClick={() => handleAcceptAppointment(appointment._id)}
                      style={{backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectAppointment(appointment._id)}
                      style={{backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}
                    >
                      ✗ Reject
                    </button>
                    <button
                      className="btn-reschedule"
                      onClick={() => setRescheduleData(appointment)}
                      style={{backgroundColor: '#f59e0b', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}
                    >
                      📅 Reschedule
                    </button>
                  </>
                )}

                {/* Reschedule Form */}
                {rescheduleData && rescheduleData._id === appointment._id && (
                  <div className="reschedule-form" style={{marginTop: '10px', padding: '15px', background: '#f3f4f6', borderRadius: '8px'}}>
                    <h4 style={{marginBottom: '10px', fontSize: '14px'}}>Reschedule Consultation</h4>
                    <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                      <input
                        type="date"
                        id={`date-${appointment._id}`}
                        defaultValue={appointment.preferredDate?.split('T')[0]}
                        style={{padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                      />
                      <input
                        type="time"
                        id={`time-${appointment._id}`}
                        defaultValue={appointment.preferredTime}
                        style={{padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                      />
                      <textarea
                        id={`reason-${appointment._id}`}
                        placeholder="Reason for rescheduling (optional)"
                        style={{padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', minHeight: '60px'}}
                      />
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button
                          onClick={() => {
                            const newDate = document.getElementById(`date-${appointment._id}`).value;
                            const newTime = document.getElementById(`time-${appointment._id}`).value;
                            const reason = document.getElementById(`reason-${appointment._id}`).value;
                            handleRescheduleAppointment(appointment._id, newDate, newTime, reason);
                          }}
                          style={{flex: 1, padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}
                        >
                          Confirm Reschedule
                        </button>
                        <button
                          onClick={() => setRescheduleData(null)}
                          style={{flex: 1, padding: '8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complete Payment button for pending_payment appointments */}
                {appointment.status === 'pending_payment' && activeTab === 'upcoming' && !rescheduleData && (
                  <>
                    <button
                      className="btn-start-call"
                      onClick={() => handleCompletePayment(appointment)}
                      disabled={payingAppointmentId === appointment._id}
                      style={{backgroundColor: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                      💳 {payingAppointmentId === appointment._id ? 'Processing...' : 'Complete Payment'}
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Video Call and Cancel for Confirmed/Rescheduled Appointments */}
                {(appointment.status === 'confirmed' || appointment.status === 'rescheduled') && activeTab === 'upcoming' && !rescheduleData && (
                  <>
                    {/* Show video call button ONLY for video consultations */}
                    {appointment.consultationType === 'video' && (
                      <button
                        className="btn-start-call"
                        onClick={() => handleStartVideoCall(appointment)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                        Start Video Call
                      </button>
                    )}
                    {isLawyer && (
                      <button
                        className="btn-reschedule"
                        onClick={() => setRescheduleData(appointment)}
                        style={{backgroundColor: '#f59e0b', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}
                      >
                        📅 Reschedule
                      </button>
                    )}
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Completed Status */}
                {appointment.status === 'completed' && (
                  <div className="completed-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                    <span>Consultation Completed</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default AppointmentManager;
