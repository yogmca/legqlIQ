import { Link } from 'react-router-dom';
import Logo from './Logo';
import './AboutUs.css';

const AboutUs = () => {
  const stats = [
    { number: '10,000+', label: 'Verified Lawyers', icon: '⚖️' },
    { number: '50,000+', label: 'Happy Clients', icon: '😊' },
    { number: '100+', label: 'Cities Covered', icon: '🌆' },
    { number: '95%', label: 'Success Rate', icon: '📈' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Our Mission',
      description: 'To democratize access to legal services by connecting clients with verified, experienced lawyers across India through innovative technology.'
    },
    {
      icon: '👁️',
      title: 'Our Vision',
      description: 'To become India\'s most trusted legal platform, making quality legal assistance accessible, affordable, and transparent for everyone.'
    },
    {
      icon: '💎',
      title: 'Our Values',
      description: 'Integrity, transparency, excellence, and client-first approach guide everything we do at LegalIQ.'
    }
  ];

  const features = [
    {
      icon: '✅',
      title: 'Verified Professionals',
      description: 'Every lawyer on our platform is thoroughly verified with Bar Council registration and credentials.'
    },
    {
      icon: '🔒',
      title: 'Secure & Confidential',
      description: 'Your legal matters are protected with bank-grade security and complete confidentiality.'
    },
    {
      icon: '💻',
      title: 'Video Consultations',
      description: 'Connect with lawyers remotely through secure video calls from anywhere in India.'
    },
    {
      icon: '💰',
      title: 'Transparent Pricing',
      description: 'No hidden fees. Know exactly what you\'re paying for before booking a consultation.'
    },
    {
      icon: '⚡',
      title: 'Quick Response',
      description: 'Get connected with lawyers within minutes and receive prompt responses to your queries.'
    },
    {
      icon: '📱',
      title: '24/7 Support',
      description: 'Our support team is available round the clock to assist you with any questions.'
    }
  ];

  const team = [
    {
      name: 'Legal Experts',
      role: 'Curated Network',
      description: 'Handpicked lawyers with proven track records',
      icon: '👨‍⚖️'
    },
    {
      name: 'Tech Team',
      role: 'Innovation',
      description: 'Building cutting-edge legal tech solutions',
      icon: '💻'
    },
    {
      name: 'Support Team',
      role: 'Client Care',
      description: 'Dedicated to your satisfaction',
      icon: '🤝'
    }
  ];

  return (
    <div className="about-us-page">
      {/* Logo Header */}
      <div className="about-page-header">
        <Logo variant="large" />
      </div>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">
            About <span className="gradient-text">LegalIQ</span>
          </h1>
          <p className="about-hero-subtitle">
            Revolutionizing Legal Services in India
          </p>
          <p className="about-hero-description">
            LegalIQ is India's premier online platform connecting clients with verified legal professionals. 
            We're on a mission to make quality legal assistance accessible, affordable, and transparent for everyone.
          </p>
          <div className="hero-buttons">
            <Link to="/lawyers" className="btn-primary">Find a Lawyer</Link>
            <Link to="/video-consultations" className="btn-secondary">Book Video Consultation</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="values-section">
        <div className="section-container">
          <h2 className="section-title">Our Foundation</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="section-container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                LegalIQ was born from a simple observation: finding the right lawyer in India is often 
                complicated, time-consuming, and opaque. We saw countless individuals struggling to access 
                quality legal services, not knowing where to start or whom to trust.
              </p>
              <p>
                Founded in 2024, we set out to change this. By leveraging technology and building a network 
                of verified legal professionals, we've created a platform that makes legal assistance as 
                simple as a few clicks.
              </p>
              <p>
                Today, LegalIQ serves thousands of clients across India, connecting them with experienced 
                lawyers in various specializations. From criminal law to corporate matters, family disputes 
                to property issues, we're here to help.
              </p>
            </div>
            <div className="story-image">
              <div className="story-placeholder">
                <div className="placeholder-icon">⚖️</div>
                <p>Justice Made Accessible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose LegalIQ?</h2>
          <p className="section-subtitle">
            We're more than just a directory. We're your trusted legal partner.
          </p>
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

      {/* Team Section */}
      <section className="team-section">
        <div className="section-container">
          <h2 className="section-title">Our Team</h2>
          <p className="section-subtitle">
            Passionate professionals dedicated to transforming legal services
          </p>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-icon">{member.icon}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied clients who found the right lawyer on LegalIQ</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary">Create Free Account</Link>
            <Link to="/lawyers" className="cta-secondary">Browse Lawyers</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-content">
          <p>&copy; 2024 LegalIQ. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
