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
  
  // Check if current user is a lawyer
  const currentUser = authService.getUser();
  const isLawyer = currentUser?.role === 'lawyer';

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
          <Link to="/" className="home-link">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Home
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

                {/* Video Call and Cancel for Confirmed/Rescheduled Appointments */}
                {(appointment.status === 'confirmed' || appointment.status === 'rescheduled' || appointment.status === 'pending_payment') && activeTab === 'upcoming' && !rescheduleData && (
                  <>
                    <button
                      className="btn-start-call"
                      onClick={() => handleStartVideoCall(appointment)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                      Start Video Call
                    </button>
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
