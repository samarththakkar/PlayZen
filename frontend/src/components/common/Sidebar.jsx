import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, Compass, Tv, PlaySquare, Clock, ThumbsUp, 
  History, Settings, HelpCircle, Gamepad2, Trophy, Flame, Music
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  
  // Mobile devices use a different prop class structure than desktops.
  // On desktop (`isOpen === true` means expanded, `isOpen === false` means collapsed).
  // On mobile (`isOpen === true` means overlay open, `isOpen === false` means hidden).
  
  // To keep CSS simple, we assume >1024px uses 'collapsed' class. 
  // <1024px uses 'mobile-open'. MainLayout handles the window sizes.
  
  const isMobile = window.innerWidth < 1024;
  const sidebarClass = isMobile 
    ? (isOpen ? 'global-sidebar mobile-open' : 'global-sidebar') 
    : (isOpen ? 'global-sidebar' : 'global-sidebar collapsed');

  return (
    <aside className={sidebarClass}>
      
      <div className="sidebar-section">
        <NavLink to="/" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Home className="sidebar-icon" size={22} />
          <span className="sidebar-text">Home</span>
        </NavLink>
        <NavLink to="/shorts" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <PlaySquare className="sidebar-icon" size={22} />
          <span className="sidebar-text">Shorts</span>
        </NavLink>
        
        {user && (
          <NavLink to="/subscriptions" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Tv className="sidebar-icon" size={22} />
            <span className="sidebar-text">Subscriptions</span>
          </NavLink>
        )}
      </div>

      {user && (
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">You</h3>
          <NavLink to="/channel" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <PlaySquare className="sidebar-icon" size={22} />
            <span className="sidebar-text">Your Channel</span>
          </NavLink>
          <NavLink to="/history" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <History className="sidebar-icon" size={22} />
            <span className="sidebar-text">History</span>
          </NavLink>
          <NavLink to="/watch-later" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Clock className="sidebar-icon" size={22} />
            <span className="sidebar-text">Watch Later</span>
          </NavLink>
          <NavLink to="/liked-videos" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <ThumbsUp className="sidebar-icon" size={22} />
            <span className="sidebar-text">Liked Videos</span>
          </NavLink>
        </div>
      )}

      <div className="sidebar-section">
        <NavLink to="/settings" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Settings className="sidebar-icon" size={22} />
          <span className="sidebar-text">Settings</span>
        </NavLink>
      </div>

    </aside>
  );
};

export default Sidebar;
