import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Navbar() {
  return (
    <header className="navbar">
      <Logo />
      <nav className="nav-links">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#how">How It Works</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="nav-actions">
        <Link className="btn btn-ghost" to="/login">Login</Link>
        <Link className="btn btn-primary" to="/register">Register</Link>
      </div>
    </header>
  );
}
