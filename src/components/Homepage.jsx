import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const user = authService.getUser();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/lawyers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const specializations = [
    { name: 'Criminal Law', icon: '⚖️', color: '#FF6B6B' },
    { name: 'Family Law', icon: '👨‍👩‍👧', color: '#4ECDC4' },
    { name: 'Corporate Law', icon: '🏢', color: '#45B7D1' },
    { name: 'Property Law', icon: '🏠', color: '#96CEB4' },
    { name: 'Tax Law', icon: '💰', color: '#FFEAA7' },
    { name: 'Civil Law', icon: '📋', color: '#DDA15E' },
    { name: 'Labour Law', icon: '👷', color: '#BC6C25' },
    { name: 'Consumer Law', icon: '🛒', color: '#6C5CE7' }
  ];

  const features = [
    {
      icon: '🔍',
      title: 'Find Verified Lawyers',
      description: 'Search from thousands of verified legal professionals across India'
    },
    {
      icon: '📅',
      title: 'Book Consultations',
      description: 'Schedule appointments at your convenience with instant confirmation'
    },
    {
      icon: '💻',
      title: 'Video Consultations',
      description: 'Connect with lawyers remotely through secure video calls'
    },
    {
      icon: '📱',
      title: '24/7 Support',
      description: 'Get legal assistance anytime, anywhere with our round-the-clock service'
    }
  ];

  return (
    <div className="homepage">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
                <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
              </svg>
            </div>
            <h1 className="logo-text">LegalIQ</h1>
          </div>

          <nav className="header-nav">
            {(!user || user.role !== 'lawyer') && (
              <>
                <Link to="/lawyers" className="nav-link">Find Lawyers</Link>
                <Link to="/video-consultations" className="nav-link">Video Consultation</Link>
              </>
            )}
            {user && <Link to="/appointments" className="nav-link">Appointments</Link>}
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            
            {user ? (
              <div className="user-menu">
                <span className="user-name">Hi, {user.name}</span>
                {user.role === 'lawyer' && (
                  <span className="role-badge">Lawyer</span>
                )}
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/register" className="signup-btn">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find the Right Lawyer
              <span className="gradient-text"> for Your Legal Needs</span>
            </h1>
            <p className="hero-subtitle">
              Connect with verified legal professionals across India. Book consultations, get expert advice, and resolve your legal matters with confidence.
            </p>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for lawyers by name, specialization, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>

            <div className="quick-stats">
              <div className="stat">
                <strong>10,000+</strong>
                <span>Verified Lawyers</span>
              </div>
              <div className="stat">
                <strong>50,000+</strong>
                <span>Happy Clients</span>
              </div>
              <div className="stat">
                <strong>100+</strong>
                <span>Cities Covered</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="card-icon">⚖️</div>
              <div className="card-content">
                <h4>Expert Legal Advice</h4>
                <p>Get professional guidance</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">✓</div>
              <div className="card-content">
                <h4>Verified Professionals</h4>
                <p>All lawyers are verified</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">💻</div>
              <div className="card-content">
                <h4>Online Consultations</h4>
                <p>Connect from anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="specializations-section">
        <div className="section-container">
          <h2 className="section-title">Browse by Specialization</h2>
          <p className="section-subtitle">Find lawyers specialized in your legal matter</p>

          <div className="specializations-grid">
            {specializations.map((spec, index) => (
              <Link
                key={index}
                to={`/lawyers?specialization=${encodeURIComponent(spec.name)}`}
                className="specialization-card"
                style={{ '--card-color': spec.color }}
              >
                <div className="spec-icon">{spec.icon}</div>
                <h3>{spec.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose LegalIQ?</h2>
          <p className="section-subtitle">Your trusted partner for all legal matters</p>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Legal Help?</h2>
          <p>Join thousands of satisfied clients who found the right lawyer on LegalIQ</p>
          <div className="cta-buttons">
            <Link to="/lawyers" className="cta-primary">Find a Lawyer</Link>
            <Link to="/video-consultations" className="cta-secondary">Book Video Consultation</Link>
            {!user && <Link to="/register" className="cta-secondary">Create Account</Link>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
                  <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
                </svg>
              </div>
              <span>LegalIQ</span>
            </div>
            <p>Your trusted legal partner for finding verified lawyers across India.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/lawyers">Find Lawyers</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@legaliq.in</p>
            <p>Phone: +91 1800-123-4567</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 LegalIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
