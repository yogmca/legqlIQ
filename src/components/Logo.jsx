import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ variant = 'default' }) => {
  return (
    <Link to="/" className={`logo-link ${variant}`}>
      <div className="logo-container">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
            <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
          </svg>
        </div>
        <span className="logo-text">LegalIQ</span>
      </div>
    </Link>
  );
};

export default Logo;
