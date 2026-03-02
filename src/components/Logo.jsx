import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ variant = 'default' }) => {
  return (
    <Link to="/" className={`logo-link ${variant}`}>
      <img src="/LegalIQ-Combined.png" alt="LegalIQ" className="combined-logo" />
    </Link>
  );
};

export default Logo;
