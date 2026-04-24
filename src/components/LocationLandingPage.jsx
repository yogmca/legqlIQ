import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './LocationLandingPage.css';

const LocationLandingPage = () => {
  const { professionalType, city } = useParams();
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format city name for display
  const formatCityName = (citySlug) => {
    return citySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format professional type for display
  const formatProfessionalType = (type) => {
    const types = {
      'lawyers': 'Lawyers',
      'tax-consultants': 'Tax Consultants',
      'auditors': 'Auditors'
    };
    return types[type] || type;
  };

  const cityName = formatCityName(city);
  const profType = formatProfessionalType(professionalType);

  // SEO metadata
  const pageTitle = `Best ${profType} in ${cityName} | Online Consultation | LegalIQ`;
  const pageDescription = `Find verified ${profType.toLowerCase()} in ${cityName}. Book online consultations with experienced professionals. Video calls, instant appointments. 500+ verified ${profType.toLowerCase()} across ${cityName}. Get expert help now!`;
  const pageKeywords = `${profType.toLowerCase()} in ${cityName}, find ${profType.toLowerCase()} ${cityName}, best ${profType.toLowerCase()} ${cityName}, online consultation ${cityName}, book ${profType.toLowerCase()} appointment ${cityName}`;

  useEffect(() => {
    fetchProfessionals();
  }, [professionalType, city]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      // Map URL professional type to database role
      const roleMap = {
        'lawyers': 'lawyer',
        'tax-consultants': 'tax_consultant',
        'auditors': 'auditor'
      };
      
      const role = roleMap[professionalType];
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/lawyers?professionalType=${role}&city=${cityName}&limit=50`
      );
      
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.lawyers || []);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Structured data for local SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${profType} in ${cityName}`,
    "description": pageDescription,
    "numberOfItems": professionals.length,
    "itemListElement": professionals.slice(0, 10).map((prof, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": prof.name,
        "description": prof.bio || `Professional ${profType.toLowerCase().slice(0, -1)} in ${cityName}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName,
          "addressRegion": prof.state,
          "addressCountry": "IN"
        },
        "aggregateRating": prof.rating ? {
          "@type": "AggregateRating",
          "ratingValue": prof.rating,
          "reviewCount": prof.reviewCount || 10
        } : undefined
      }
    }))
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://legaliq.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": profType,
        "item": `https://legaliq.in/${professionalType}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cityName,
        "item": `https://legaliq.in/${professionalType}/${city}`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <link rel="canonical" href={`https://legaliq.in/${professionalType}/${city}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://legaliq.in/${professionalType}/${city}`} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <div className="location-landing-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Find Best {profType} in {cityName}</h1>
            <p className="hero-subtitle">
              Connect with verified {profType.toLowerCase()} in {cityName}. Book online consultations instantly.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{professionals.length}+</span>
                <span className="stat-label">Verified {profType}</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href={`/${professionalType}`}>{profType}</a></li>
            <li aria-current="page">{cityName}</li>
          </ol>
        </nav>

        {/* Main Content */}
        <section className="professionals-section">
          <h2>Top {profType} in {cityName}</h2>
          
          {loading ? (
            <div className="loading">Loading professionals...</div>
          ) : professionals.length > 0 ? (
            <div className="professionals-grid">
              {professionals.map((prof) => (
                <div key={prof._id} className="professional-card">
                  <div className="prof-header">
                    <img 
                      src={prof.profilePicture || '/default-avatar.png'} 
                      alt={prof.name}
                      className="prof-avatar"
                    />
                    <div className="prof-info">
                      <h3>{prof.name}</h3>
                      <p className="prof-specialization">{prof.specialization || profType.slice(0, -1)}</p>
                      <p className="prof-location">{cityName}, {prof.state}</p>
                    </div>
                  </div>
                  
                  {prof.bio && (
                    <p className="prof-bio">{prof.bio.substring(0, 150)}...</p>
                  )}
                  
                  <div className="prof-details">
                    {prof.experience && (
                      <span className="detail-badge">
                        <i className="icon-experience"></i> {prof.experience} years
                      </span>
                    )}
                    {prof.rating && (
                      <span className="detail-badge">
                        <i className="icon-star"></i> {prof.rating} ★
                      </span>
                    )}
                  </div>
                  
                  <button 
                    className="btn-book"
                    onClick={() => navigate(`/profile/${prof._id}`)}
                  >
                    View Profile & Book
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No {profType.toLowerCase()} found in {cityName} yet.</p>
              <button onClick={() => navigate('/')} className="btn-home">
                Browse All Professionals
              </button>
            </div>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="seo-content">
          <h2>Why Choose {profType} in {cityName} on LegalIQ?</h2>
          
          <div className="benefits-grid">
            <div className="benefit">
              <h3>✓ Verified Professionals</h3>
              <p>All {profType.toLowerCase()} are verified with proper credentials and licenses.</p>
            </div>
            <div className="benefit">
              <h3>✓ Online Consultation</h3>
              <p>Book video consultations from the comfort of your home.</p>
            </div>
            <div className="benefit">
              <h3>✓ Instant Booking</h3>
              <p>Get appointments within 24 hours. No waiting, no hassle.</p>
            </div>
            <div className="benefit">
              <h3>✓ Secure & Confidential</h3>
              <p>Your information is protected with bank-level security.</p>
            </div>
          </div>

          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>How do I find the best {profType.toLowerCase().slice(0, -1)} in {cityName}?</h3>
              <p>
                LegalIQ makes it easy to find verified {profType.toLowerCase()} in {cityName}. 
                Browse profiles, check ratings and reviews, compare experience, and book consultations 
                instantly. All professionals are verified for credentials.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I book online consultations with {profType.toLowerCase()} in {cityName}?</h3>
              <p>
                Yes! All {profType.toLowerCase()} on LegalIQ offer online video consultations. 
                You can book appointments and consult from anywhere, anytime.
              </p>
            </div>

            <div className="faq-item">
              <h3>What are the consultation fees for {profType.toLowerCase()} in {cityName}?</h3>
              <p>
                Consultation fees vary by professional and specialization. You can view fees 
                on each professional's profile before booking. Most consultations range from 
                ₹500 to ₹5000 depending on expertise and service type.
              </p>
            </div>

            <div className="faq-item">
              <h3>Are the {profType.toLowerCase()} on LegalIQ verified?</h3>
              <p>
                Yes, all professionals on LegalIQ are thoroughly verified. We check their 
                credentials, licenses, and professional registrations before listing them 
                on our platform.
              </p>
            </div>
          </div>

          <div className="city-info">
            <h2>About {profType} Services in {cityName}</h2>
            <p>
              {cityName} is home to numerous experienced {profType.toLowerCase()} who provide 
              expert services across various specializations. Whether you need legal advice, 
              tax planning, audit services, or professional consultation, you can find qualified 
              professionals on LegalIQ.
            </p>
            <p>
              Our platform connects you with verified {profType.toLowerCase()} in {cityName} 
              who offer both in-person and online consultations. Book appointments instantly, 
              chat with professionals, and get expert help when you need it.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Get Expert Help?</h2>
          <p>Connect with verified {profType.toLowerCase()} in {cityName} today</p>
          <button onClick={() => navigate('/register')} className="btn-cta">
            Get Started - It's Free
          </button>
        </section>
      </div>
    </>
  );
};

export default LocationLandingPage;
