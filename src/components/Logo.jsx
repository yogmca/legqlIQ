import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ variant = 'default' }) => {
  return (
    <Link to="/" className={`logo-link ${variant}`}>
      <div className="logo-container">
        <div className="logo-icon">
          <img src="/Legaliq.jpg" alt="LegalIQ Logo" className="logo-image" />
        </div>
        <span className="logo-text">LegalIQ</span>
      </div>
    </Link>
  );
};

export default Logo;
