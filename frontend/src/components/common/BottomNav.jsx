import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlaySquare, Plus, History, User } from 'lucide-react';
import './BottomNav.css';

const NAV_ITEMS = [
  { to: '/',        icon: Home,       label: 'Home'    },
  { to: '/shorts',  icon: PlaySquare, label: 'Shorts'  },
  null, // center upload button placeholder
  { to: '/history', icon: History,    label: 'History' },
  { to: '/profile', icon: User,       label: 'Profile' },
];

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="global-bottom-nav">
      {NAV_ITEMS.map((item, idx) => {
        // Center upload button
        if (item === null) {
          return (
            <button
              key="upload"
              className="bottom-nav-item"
              onClick={() => navigate('/upload')}
              aria-label="Upload video"
            >
              <div className="bottom-nav-upload">
                <Plus size={22} strokeWidth={2.5} />
              </div>
            </button>
          );
        }

        const { to, icon: Icon, label } = item;
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              isActive ? 'bottom-nav-item active' : 'bottom-nav-item'
            }
            aria-label={label}
          >
            <Icon className="bottom-nav-icon" size={22} strokeWidth={1.7} />
            <span className="bottom-nav-text">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;