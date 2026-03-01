import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SearchBar from './components/SearchBar';
import FilterSection from './components/FilterSection';
import LawyerCard from './components/LawyerCard';
import AppointmentManager from './components/AppointmentManager';
import VideoConsultationList from './components/VideoConsultationList';
import VideoConsultation from './components/VideoConsultation';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Logo from './components/Logo';
import LegalChatbot from './components/LegalChatbot';
import { lawyerService } from './services/lawyerService';
import authService from './services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Lawyers Directory Component
function LawyersDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [lawyers, setLawyers] = useState([]);
  const [totalLawyers, setTotalLawyers] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchInitialLawyers();
  }, []);

  useEffect(() => {
    if (searchTerm || selectedSpecialization !== 'All Specializations' || selectedLocation !== 'All Locations') {
      performSearch();
    }
  }, [searchTerm, selectedSpecialization, selectedLocation]);

  const fetchInitialLawyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await lawyerService.fetchInitialLawyers(limit);
      console.log('Fetched initial lawyers:', result);
      if (result && result.data && Array.isArray(result.data)) {
        setLawyers(result.data);
        setTotalLawyers(result.total || 0);
        setHasMore(result.hasMore || false);
        setOffset(limit);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      setError(error.message || 'Failed to load lawyers');
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await lawyerService.searchLawyers(
        searchTerm,
        selectedSpecialization,
        selectedLocation,
        0,
        limit
      );
      console.log('Search results:', result);
      if (result && result.data && Array.isArray(result.data)) {
        setLawyers(result.data);
        setTotalLawyers(result.total || 0);
        setHasMore(result.hasMore || false);
        setOffset(limit);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error searching lawyers:', error);
      setError(error.message || 'Failed to search lawyers');
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await lawyerService.searchLawyers(
        searchTerm,
        selectedSpecialization,
        selectedLocation,
        offset,
        limit
      );
      
      console.log('Load more results:', result);
      
      if (result && result.data && Array.isArray(result.data)) {
        // Filter out duplicates by checking if lawyer ID already exists
        const newLawyers = result.data.filter(newLawyer => {
          const newId = String(newLawyer.id || newLawyer._id || '');
          if (!newId) return false;
          return !lawyers.some(existingLawyer => {
            const existingId = String(existingLawyer.id || existingLawyer._id || '');
            return existingId === newId;
          });
        });
        
        setLawyers(prev => [...prev, ...newLawyers]);
        setHasMore(result.hasMore || false);
        setOffset(prev => prev + limit);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error loading more lawyers:', error);
      setError(error.message || 'Failed to load more lawyers');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedSpecialization('All Specializations');
    setSelectedLocation('All Locations');
    fetchInitialLawyers();
  };

  return (
    <div className="app">
      <div className="app-logo-header">
        <Logo />
      </div>
      
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Lawyer Directory</h1>
          <p className="app-subtitle">Find and Connect with Legal Professionals</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <FilterSection
            selectedSpecialization={selectedSpecialization}
            selectedLocation={selectedLocation}
            onSpecializationChange={setSelectedSpecialization}
            onLocationChange={setSelectedLocation}
            onReset={handleReset}
          />

          <div className="results-info">
            <p className="results-count">
              Showing <strong>{lawyers.length}</strong> of <strong>{totalLawyers}</strong> {totalLawyers === 1 ? 'lawyer' : 'lawyers'}
            </p>
          </div>

          {error ? (
            <div className="no-results">
              <div className="no-results-icon">⚠️</div>
              <h3>Error Loading Lawyers</h3>
              <p>{error}</p>
              <button className="reset-btn-large" onClick={fetchInitialLawyers}>
                Try Again
              </button>
            </div>
          ) : loading && lawyers.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading lawyers...</p>
            </div>
          ) : lawyers.length > 0 ? (
            <>
              <div className="lawyers-grid">
                {lawyers.map((lawyer, index) => (
                  <LawyerCard key={lawyer.id || lawyer._id || `lawyer-${index}`} lawyer={lawyer} />
                ))}
              </div>
              
              {hasMore && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Lawyers'}
                  </button>
                  <p className="load-more-text">
                    {totalLawyers - lawyers.length} more lawyers available
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No lawyers found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button className="reset-btn-large" onClick={handleReset}>
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 LegalIQ. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Video Consultation Room Component
function VideoConsultationRoom() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Temporary: Show consultation ID immediately
  console.log('VideoConsultationRoom mounted with ID:', id);

  useEffect(() => {
    fetchConsultation();
  }, [id]);

  const fetchConsultation = async () => {
    try {
      console.log('Fetching consultation:', id);
      const response = await fetch(`${API_URL}/consultations/${id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Consultation data:', data);
        setConsultation(data.consultation);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Failed to load consultation: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async (callData) => {
    try {
      await fetch(`${API_URL}/consultations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          status: 'completed',
          videoCallData: callData
        })
      });
      
      navigate('/appointments');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
        <div className="loading-spinner"></div>
        <div>Loading consultation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Error Loading Consultation</div>
        <div>{error}</div>
        <button onClick={() => navigate('/video-consultations')} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Back to Consultations
        </button>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>📅</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Consultation Not Found</div>
        <div>The consultation you're looking for doesn't exist or has been removed.</div>
        <button onClick={() => navigate('/video-consultations')} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Back to Consultations
        </button>
      </div>
    );
  }

  return (
    <VideoConsultation
      consultation={consultation}
      onClose={() => navigate('/appointments')}
      onEndCall={handleEndCall}
    />
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword onLogin={handleLogin} />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/lawyers" element={<LawyersDirectory />} />
        <Route
          path="/video-consultations"
          element={
            <ProtectedRoute>
              <VideoConsultationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-consultation/:id"
          element={
            <ProtectedRoute>
              <VideoConsultationRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentManager userEmail={user?.email || 'user@example.com'} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* AI Legal Chatbot - Available on all pages */}
      <LegalChatbot />
    </Router>
  );
}

export default App;
