import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlaySquare, PlusCircle, History, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="global-bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
        <Home className="bottom-nav-icon" size={24} />
        <span className="bottom-nav-text">Home</span>
      </NavLink>

      <NavLink to="/shorts" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
        <PlaySquare className="bottom-nav-icon" size={24} />
        <span className="bottom-nav-text">Shorts</span>
      </NavLink>

      <button className="bottom-nav-item" onClick={() => navigate('/upload')}>
        <PlusCircle className="bottom-nav-icon" size={32} style={{ color: 'var(--text-primary)' }} strokeWidth={1.5} />
      </button>

      <NavLink to="/history" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
        <History className="bottom-nav-icon" size={24} />
        <span className="bottom-nav-text">History</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
        <User className="bottom-nav-icon" size={24} />
        <span className="bottom-nav-text">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;