import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, Search, Upload, Bell, ArrowLeft, User, LogOut, Video, Settings, PlusCircle, Plus, Clock, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useSearch from '../../hooks/useSearch';
import useNotifications from '../../hooks/useNotifications';
import { getAvatarUrl } from '../../utils/avatarUtils';
import './Header.css';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Search state
  const { query: searchQuery, setQuery: setSearchQuery, suggestions: liveSuggestions, loading: searchLoading } = useSearch();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Load search history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('playzen_search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Fetch live suggestions when user types is now handled by useSearch

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(user?._id || user?.id);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
    navigate('/login');
  };

  const saveToHistory = (query) => {
    if (!query.trim()) return;
    let history = [...searchHistory];
    // Remove if exists to push to front
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    history.unshift(query.trim());
    // Keep max 10
    if (history.length > 10) history.pop();
    setSearchHistory(history);
    localStorage.setItem('playzen_search_history', JSON.stringify(history));
  };
  
  const removeHistoryItem = (e, queryToRemove) => {
    e.stopPropagation(); // Prevent triggering search
    const newHistory = searchHistory.filter(item => item !== queryToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('playzen_search_history', JSON.stringify(newHistory));
  };

  const handleSearchSubmit = (e, query = searchQuery) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      saveToHistory(query);
      setSearchQuery(query);
      setIsSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsMobileSearchOpen(false);
    }
  };

  const currentUser = user || {
    fullname: "Guest User",
    email: "",
    avatar: ""
  };
  
  const displayAvatar = getAvatarUrl(currentUser, currentUser.fullname || currentUser.username || "Guest");

  return (
    <header className="global-header">
      
      {/* --- Mobile Search Overlay --- */}
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay">
          <button className="header-icon-btn" onClick={() => setIsMobileSearchOpen(false)}>
            <ArrowLeft size={20} />
          </button>
          <div className="mobile-search-wrapper" style={{ flex: 1, position: 'relative' }}>
            <form className="desktop-search-form" style={{ display: 'flex', width: '100%' }} onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                className="mobile-search-input" 
                placeholder="Search PlayZen..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="header-icon-btn">
                <Search size={20} />
              </button>
            </form>
            
            {/* Mobile Auto-Complete Suggestions */}
            {searchQuery.trim() && liveSuggestions.length > 0 && (
              <div className="search-autocomplete-dropdown mobile-suggestions">
                {liveSuggestions.map(video => (
                  <div 
                    key={video._id} 
                    className="autocomplete-item"
                    onClick={() => handleSearchSubmit(null, video.title)}
                  >
                    <Search size={16} className="autocomplete-icon" />
                    <span className="autocomplete-text">{video.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 1. Left Section --- */}
      <div className="header-left">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <Link to="/" className="brand-link">
          <div className="brand-logo-icon">
             <img src="/logo.png" alt="PlayZen Logo" style={{ width: '45px', height: '35px', objectFit: 'contain' }} />
          </div>
          <span className="brand-name">PlayZen</span>
        </Link>
      </div>

      {/* --- 2. Center Section (Search) --- */}
      <div className="header-center" ref={searchRef}>
        <div className="search-container-relative" style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <form className="desktop-search-form" onSubmit={(e) => handleSearchSubmit(e)}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search videos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            <button type="submit" className="search-icon-btn" aria-label="Search">
              <Search size={20} className="search-icon-svg" />
            </button>
          </form>

          {/* Desktop Autocomplete Dropdown */}
          {isSearchFocused && (searchQuery.trim() ? liveSuggestions.length > 0 : searchHistory.length > 0) && (
            <div className="search-autocomplete-dropdown">
              
              {!searchQuery.trim() && searchHistory.map((historyItem, index) => (
                <div 
                  key={`hist-${index}`} 
                  className="autocomplete-item history-item"
                  onClick={() => handleSearchSubmit(null, historyItem)}
                >
                  <div className="autocomplete-item-content">
                    <Clock size={16} className="autocomplete-icon" />
                    <span className="autocomplete-text">{historyItem}</span>
                  </div>
                  <button 
                    className="autocomplete-remove-btn" 
                    onClick={(e) => removeHistoryItem(e, historyItem)}
                    aria-label="Remove from history"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {searchQuery.trim() && liveSuggestions.map(video => (
                <div 
                  key={video._id} 
                  className="autocomplete-item"
                  onClick={() => handleSearchSubmit(null, video.title)}
                >
                  <div className="autocomplete-item-content">
                    <Search size={16} className="autocomplete-icon" />
                    <span className="autocomplete-text">{video.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- 3. Right Section --- */}
      <div className="header-right">
        {/* Mobile search button */}
        <button className="header-icon-btn mobile-search-btn" onClick={() => setIsMobileSearchOpen(true)}>
          <Search size={22} />
        </button>

        {/* Mobile Upload Icon */}
        <button className="header-icon-btn mobile-upload-btn" onClick={() => navigate('/upload')}>
          <Upload size={20} />
        </button>

        {/* Desktop Upload button */}
        <button className="desktop-upload-btn" onClick={() => navigate('/upload')}>
          <Upload size={18} />
          <span>Upload</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button className="header-icon-btn" onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}>
            <Bell size={22} />
            {/* Notification Badge */}
            {unreadCount > 0 && (
  <span className="notif-badge">
    {unreadCount > 9 ? '9+' : unreadCount}
  </span>
)}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu notification-dropdown">
              <div className="dropdown-header notif-header">
                <span className="dropdown-name">Notifications</span>
                <button className="mark-all-read-btn">Mark all read</button>
              </div>
              <div className="notif-empty-state">
                <div className="notif-empty-icon">
                  <Bell size={32} />
                </div>
                <p className="notif-empty-title">All caught up!</p>
                <p className="notif-empty-text">No new notifications at the moment.</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown / Login Button */}
        <div className="relative" ref={profileRef}>
          {user ? (
            <button className="profile-avatar-btn" onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}>
                <img 
                  src={displayAvatar} 
                  alt="User Avatar" 
                  className="header-avatar-img"
                />
            </button>
          ) : (
            <button 
              className="desktop-upload-btn" 
              style={{ display: 'flex' }}
              onClick={() => navigate('/login')}
            >
              <User size={18} />
              <span>Sign In</span>
            </button>
          )}

          {isProfileOpen && user && (
            <div className="dropdown-menu profile-dropdown">
              <div className="dropdown-header profile-header">
                <div className="profile-avatar-gradient">
                  <img src={displayAvatar} alt="Profile" className="dropdown-large-avatar" />
                </div>
                <div className="dropdown-header-info">
                  <span className="dropdown-name">{currentUser.fullname || currentUser.username || "User"}</span>
                  <span className="dropdown-email">{currentUser.email || "No email provided"}</span>
                </div>
              </div>

              <div className="dropdown-body profile-body">
                <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                  <User size={17} /> <span>Profile</span>
                </Link>
                <button className="dropdown-item" onClick={() => { setIsProfileOpen(false); navigate('/login'); }}>
                  <Plus size={17} /> <span>Add Account</span>
                </button>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={17} /> <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
