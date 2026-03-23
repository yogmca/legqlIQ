  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import './LawyerCard.css';
  import ConsultationForm from './ConsultationForm';
  import authService from '../services/authService';
  import chatService from '../services/chatService';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const LawyerCard = ({ lawyer }) => {
    const navigate = useNavigate();
    const [showConsultationForm, setShowConsultationForm] = useState(false);

    const handleBookConsultation = () => {
      setShowConsultationForm(true);
    };

    const handleBookVideoConsultation = () => {
      const user = authService.getUser();
      if (!user) {
        alert('Please login to book a video consultation');
        navigate('/login');
        return;
      }
      navigate('/video-consultations');
    };

    const handleStartChat = async () => {
      const user = authService.getUser();
      if (!user) {
        alert('Please login to start a chat');
        navigate('/login');
        return;
      }

      try {
        // Check if lawyer has a userId (registered as user)
        if (!lawyer.userId) {
          alert('This professional has not enabled chat yet. Please contact them via phone or email.');
          return;
        }
        
        // Get or create chat with the lawyer using their userId
        const chat = await chatService.getOrCreateChat(lawyer.userId);
        
        // Navigate to the chat
        navigate(`/chat/${chat.id}`);
      } catch (error) {
        console.error('Error starting chat:', error);
        alert('Failed to start chat. This professional may not have chat enabled yet.');
      }
    };

    const handleCloseForm = () => {
      setShowConsultationForm(false);
    };

    const handleSubmitConsultation = async (consultationData) => {
      try {
        const token = authService.getToken();
        
        if (!token) {
          alert('Please login to book a consultation');
          return;
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        console.log('Booking consultation with data:', consultationData);
        console.log('API URL:', `${API_URL}/consultations`);

        const response = await fetch(`${API_URL}/consultations`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(consultationData),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          const errorMessage = errorData.message || `Failed to book consultation (Status: ${response.status})`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Success response:', result);
        
        alert(`Consultation booked successfully! Your booking ID is ${result.consultation._id || result.consultation.id}. The lawyer will contact you soon.`);
        setShowConsultationForm(false);
      } catch (error) {
        console.error('Error booking consultation:', error);
        alert(`Error: ${error.message}`);
        throw error;
      }
    };

    // Check if professional is online (active within last 5 minutes)
    const isOnline = lawyer.lastActive &&
      (new Date() - new Date(lawyer.lastActive)) < 5 * 60 * 1000;

    return (
      <div className="lawyer-card">
        <div className="lawyer-card-header">
          <div className="lawyer-avatar">
            {lawyer.profilePicture ? (
              <img
                src={lawyer.profilePicture}
                alt={lawyer.name}
                className="lawyer-avatar-image"
              />
            ) : (
              <span className="lawyer-avatar-initials">
                {lawyer.name.split(' ')[1]?.[0] || lawyer.name[0]}
              </span>
            )}
            {/* Online status indicator */}
            {isOnline && (
              <span className="online-status" title="Online now">
                <span className="online-dot"></span>
              </span>
            )}
          </div>
          <div className="lawyer-title">
            <h3>
              {lawyer.name}
              {isOnline && <span className="online-badge">● Online</span>}
            </h3>
            {/* Hidden for privacy - Bar Registration Number not allowed to display publicly */}
            <p className="bar-registration" style={{display: 'none'}}>Bar Reg: {lawyer.barRegistrationNo}</p>
          </div>
        </div>

        <div className="lawyer-card-body">
          <div className="specialization-tags">
            {lawyer.specialization.map((spec, index) => (
              <span key={index} className="tag">
                {spec}
              </span>
            ))}
          </div>

          <div className="lawyer-info">
            <div className="info-row">
              <span className="info-label">📍 Location:</span>
              <span className="info-value">{lawyer.location}</span>
            </div>
            <div className="info-row">
              <span className="info-label">⚖️ Court:</span>
              <span className="info-value">{lawyer.court}</span>
            </div>
            <div className="info-row">
              <span className="info-label">💼 Experience:</span>
              <span className="info-value">{lawyer.experience} years</span>
            </div>
            <div className="info-row">
              <span className="info-label">🎓 Education:</span>
              <span className="info-value">{lawyer.education}</span>
            </div>
            <div className="info-row">
              <span className="info-label">🗣️ Languages:</span>
              <span className="info-value">{lawyer.languages.join(', ')}</span>
            </div>
          </div>

          <p className="lawyer-description">{lawyer.description}</p>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <a href={`mailto:${lawyer.email}`}>{lawyer.email}</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>{lawyer.address}</span>
            </div>
          </div>
        </div>

        <div className="lawyer-card-footer">
          <button className="btn-contact" onClick={handleBookConsultation}>
            📅 Book Lawyer Visit
          </button>
          <button className="btn-video-consultation" onClick={handleBookVideoConsultation}>
            📹 Book Video Consultation
          </button>
          <button className="btn-chat" onClick={handleStartChat}>
            💬 Start Chat
          </button>
        </div>

        {showConsultationForm && (
          <ConsultationForm
            lawyer={lawyer}
            onClose={handleCloseForm}
            onSubmit={handleSubmitConsultation}
          />
        )}
      </div>
    );
  };

  export default LawyerCard;
