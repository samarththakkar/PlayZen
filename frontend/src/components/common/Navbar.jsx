import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`playzen-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* ── LOGO ── */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          </div>
          <span className="navbar-brand-name">PlayZen</span>
        </Link>

        {/* ── NAV LINKS ── */}
        <div className="navbar-links">
          <Link to="/features"  className={`navbar-link ${location.pathname === '/features'  ? 'active' : ''}`}>Features</Link>
          <Link to="/pricing"   className={`navbar-link ${location.pathname === '/pricing'   ? 'active' : ''}`}>Pricing</Link>
          <Link to="/about"     className={`navbar-link ${location.pathname === '/about'     ? 'active' : ''}`}>About</Link>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div className="navbar-actions">
          <Link to="/login"  className="navbar-btn-ghost">Sign In</Link>
          <Link to="/signup" className="navbar-btn-primary">Get Started</Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;