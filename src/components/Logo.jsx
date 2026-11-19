import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = () => {
  return (
    <Link to="/" className="logo-link">
      <img src="/Legaliq.jpg" alt="LegalIQ" className="logo-image" />
    </Link>
  );
};

export default Logo;
