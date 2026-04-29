import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './MobileMenu.css';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    closeMenu();
    navigate('/');
    window.location.reload();
  };

  const handleNavigation = (path) => {
    closeMenu();
    navigate(path);
  };

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
      </button>

      {/* Overlay */}
      {isOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}

      {/* Side Drawer */}
      <div className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <img src="/Legaliq.jpg" alt="LegalIQ Logo" className="mobile-logo-image" />
            <h2>LegalIQ</h2>
          </div>
          <button className="mobile-menu-close" onClick={closeMenu} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="mobile-menu-content">
          {/* User Info Section */}
          {user && (
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="mobile-user-details">
                <p className="mobile-user-name">{user.name}</p>
                <p className="mobile-user-email">{user.email}</p>
                {user.role && (
                  <span className="mobile-role-badge">
                    {user.role === 'lawyer' ? 'Lawyer' : 
                     user.role === 'tax-consultant' ? 'Tax Consultant' : 
                     user.role === 'auditor' ? 'Auditor' : 
                     user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mobile-nav-links">
            <div className="mobile-nav-section">
              <h3 className="mobile-nav-section-title">Find Professionals</h3>
              {(!user || (user.role !== 'lawyer' && user.role !== 'tax-consultant' && user.role !== 'auditor' && user.role !== 'admin')) && (
                <>
                  <button onClick={() => handleNavigation('/lawyers')} className="mobile-nav-link">
                    <span className="mobile-nav-icon">⚖️</span>
                    <span>Find Lawyers</span>
                  </button>
                  <button onClick={() => handleNavigation('/lawyers?type=tax-consultant')} className="mobile-nav-link">
                    <span className="mobile-nav-icon">💰</span>
                    <span>Tax Consultants</span>
                  </button>
                  <button onClick={() => handleNavigation('/lawyers?type=auditor')} className="mobile-nav-link">
                    <span className="mobile-nav-icon">📊</span>
                    <span>Auditors</span>
                  </button>
                </>
              )}
            </div>

            {user && (
              <div className="mobile-nav-section">
                <h3 className="mobile-nav-section-title">My Account</h3>
                <button onClick={() => handleNavigation('/profile')} className="mobile-nav-link">
                  <span className="mobile-nav-icon">👤</span>
                  <span>Profile</span>
                </button>
                <button onClick={() => handleNavigation('/appointments')} className="mobile-nav-link">
                  <span className="mobile-nav-icon">📅</span>
                  <span>Appointments</span>
                </button>
                <button onClick={() => handleNavigation('/video-consultations')} className="mobile-nav-link">
                  <span className="mobile-nav-icon">📹</span>
                  <span>Video Calls</span>
                </button>
                <button onClick={() => handleNavigation('/chats')} className="mobile-nav-link">
                  <span className="mobile-nav-icon">💬</span>
                  <span>Messages</span>
                </button>
              </div>
            )}

            {user && user.role === 'admin' && (
              <div className="mobile-nav-section">
                <h3 className="mobile-nav-section-title">Admin</h3>
                <button onClick={() => handleNavigation('/admin/dashboard')} className="mobile-nav-link">
                  <span className="mobile-nav-icon">🛠️</span>
                  <span>Admin Dashboard</span>
                </button>
              </div>
            )}

            {user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor') && (
              <div className="mobile-nav-section">
                <h3 className="mobile-nav-section-title">Professional</h3>
                <button onClick={() => handleNavigation('/submit-article')} className="mobile-nav-link">
                  <span className="mobile-nav-icon">✍️</span>
                  <span>Submit Article</span>
                </button>
              </div>
            )}

            <div className="mobile-nav-section">
              <h3 className="mobile-nav-section-title">Resources</h3>
              <button onClick={() => handleNavigation('/articles')} className="mobile-nav-link">
                <span className="mobile-nav-icon">📖</span>
                <span>Articles</span>
              </button>
              <button onClick={() => handleNavigation('/about')} className="mobile-nav-link">
                <span className="mobile-nav-icon">ℹ️</span>
                <span>About Us</span>
              </button>
              <button onClick={() => handleNavigation('/contact')} className="mobile-nav-link">
                <span className="mobile-nav-icon">📧</span>
                <span>Contact Us</span>
              </button>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="mobile-menu-footer">
            {user ? (
              <button onClick={handleLogout} className="mobile-logout-btn">
                <span className="mobile-nav-icon">🚪</span>
                <span>Logout</span>
              </button>
            ) : (
              <div className="mobile-auth-buttons">
                <button onClick={() => handleNavigation('/login')} className="mobile-login-btn">
                  Login
                </button>
                <button onClick={() => handleNavigation('/register')} className="mobile-signup-btn">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
