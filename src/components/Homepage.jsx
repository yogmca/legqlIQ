import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import MobileMenu from './MobileMenu';
import './Homepage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Homepage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const user = authService.getUser();

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await fetch(`${API_URL}/articles/featured`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Error fetching featured articles:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Detect professional type from search query
      let professionalType = 'lawyer'; // default
      if (query.includes('tax') || query.includes('gst') || query.includes('income tax')) {
        professionalType = 'tax-consultant';
      } else if (query.includes('audit') || query.includes('auditor')) {
        professionalType = 'auditor';
      }
      
      // Navigate with appropriate type parameter
      if (professionalType === 'lawyer') {
        navigate(`/lawyers?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/lawyers?type=${professionalType}&search=${encodeURIComponent(searchQuery)}`);
      }
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
      title: 'Find Verified Professionals',
      description: 'Search from thousands of verified lawyers, tax consultants, and auditors across India'
    },
    {
      icon: '📅',
      title: 'Book Consultations',
      description: 'Schedule appointments at your convenience with instant confirmation'
    },
    {
      icon: '💻',
      title: 'Video Consultations',
      description: 'Connect with professionals remotely through secure video calls'
    },
    {
      icon: '📱',
      title: '24/7 Support',
      description: 'Get legal, tax, and financial assistance anytime, anywhere with our round-the-clock service'
    }
  ];

  return (
    <div className="homepage">
      {/* Mobile Menu - Only visible on mobile */}
      <MobileMenu />
      
      {/* Header */}
      <header className="homepage-header">
        <div className="header-container">
          <Link to="/" className="logo-section">
            <img src="/Legaliq.jpg" alt="LegalIQ Logo" className="logo-image" />
            <h1 className="logo-text">LegalIQ</h1>
          </Link>

          <nav className="header-nav">
            {(!user || (user.role !== 'lawyer' && user.role !== 'tax-consultant' && user.role !== 'auditor' && user.role !== 'admin')) && (
              <>
                <Link to="/lawyers" className="nav-link">Find Lawyers</Link>
                <Link to="/lawyers?type=tax-consultant" className="nav-link">Tax Consultants</Link>
                <Link to="/lawyers?type=auditor" className="nav-link">Auditors</Link>
              </>
            )}
            <Link to="/articles" className="nav-link">Articles</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
            )}
            {user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor') && (
              <Link to="/submit-article" className="nav-link">Submit Article</Link>
            )}
            {user && <Link to="/appointments" className="nav-link">Appointments</Link>}
            {user && <Link to="/video-consultations" className="nav-link">Video Calls</Link>}
            {user && <Link to="/chats" className="nav-link">💬 Messages</Link>}
            {user && <Link to="/profile" className="nav-link">Profile</Link>}
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            
            {user ? (
              <div className="user-menu">
                <span className="user-name">Hi, {user.name}</span>
                {user.role === 'admin' && (
                  <span className="role-badge">Admin</span>
                )}
                {(user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor') && (
                  <span className="role-badge">
                    {user.role === 'lawyer' ? 'Lawyer' : user.role === 'tax-consultant' ? 'Tax Consultant' : 'Auditor'}
                  </span>
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
              Find the Right Professional
              <span className="gradient-text"> for Your Legal, Tax & Financial Needs</span>
            </h1>
            <p className="hero-subtitle">
              Connect with verified lawyers, tax consultants, and auditors across India. Book consultations, get expert advice, and resolve your legal and financial matters with confidence.
            </p>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for lawyers, tax consultants, auditors by name, specialization, or location..."
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
                <span>Verified Professionals</span>
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

      {/* Top Articles Section - Only show if articles exist */}
      {featuredArticles.length > 0 && (
        <section className="top-articles-section">
          <div className="section-container">
            <h2 className="section-title">📖 Read Top Articles from Legal Experts</h2>
            <p className="section-subtitle">Stay informed with expert insights on legal, tax, and audit matters</p>

            <div className="top-articles-grid">
              {featuredArticles.slice(0, 2).map((article) => (
                <div
                  key={article._id}
                  className="top-article-card"
                  onClick={() => navigate(`/articles/${article._id}`)}
                >
                  {article.image && (
                    <div className="top-article-image">
                      <img
                        src={article.image?.data ? `data:${article.image.contentType};base64,${article.image.data}` : '/placeholder-image.png'}
                        alt={article.title}
                      />
                    </div>
                  )}
                  <div className="top-article-content">
                    <div className="top-article-category">{article.category}</div>
                    <h3 className="top-article-title">{article.title}</h3>
                    <p className="top-article-summary">{article.summary}</p>
                    <div className="top-article-meta">
                      <div className="article-author-info">
                        <span className="author-name">By {article.author.name}</span>
                        {article.author.profession !== 'admin' && (
                          <span className="author-profession"> • {article.author.profession}</span>
                        )}
                      </div>
                      <span className="read-time">⏱️ {article.readTime} min read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="see-articles-button-container">
              <Link to="/articles" className="see-articles-button">
                See All Articles →
              </Link>
            </div>
          </div>
        </section>
      )}

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
          <h2>Ready to Get Professional Help?</h2>
          <p>Join thousands of satisfied clients who found the right professional on LegalIQ</p>
          <div className="cta-buttons">
            <Link to="/lawyers" className="cta-primary">Find Professionals</Link>
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
              <img src="/Legaliq.jpg" alt="LegalIQ Logo" className="logo-image" />
              <span>LegalIQ</span>
            </div>
            <p>Your trusted partner for finding verified lawyers, tax consultants, and auditors across India.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/lawyers">Find Lawyers</Link>
            <Link to="/lawyers?type=tax-consultant">Find Tax Consultants</Link>
            <Link to="/lawyers?type=auditor">Find Auditors</Link>
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
