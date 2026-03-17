import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home, PlaySquare, Tv, History, Clock,
  ThumbsUp, Settings, Flame, Music, Gamepad2,
  ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { getAvatarUrl } from '../../utils/avatarUtils';
import './Sidebar.css';

/* ── Nav config ── */
const NAV_MAIN = [
  { to: '/',              icon: Home,       label: 'Home'          },
  { to: '/shorts',        icon: PlaySquare, label: 'Shorts'        },
  { to: '/subscriptions', icon: Tv,         label: 'Subscriptions', authRequired: true },
];

const NAV_YOU = [
  { to: '/channel',      icon: PlaySquare, label: 'Your Channel' },
  { to: '/history',      icon: History,    label: 'History'      },
  { to: '/watch-later',  icon: Clock,      label: 'Watch Later'  },
  { to: '/liked-videos', icon: ThumbsUp,   label: 'Liked Videos' },
];

const NAV_EXPLORE = [
  { to: '/trending', icon: Flame,    label: 'Trending' },
  { to: '/music',    icon: Music,    label: 'Music'    },
  { to: '/gaming',   icon: Gamepad2, label: 'Gaming'   },
];

/* ── Single nav link ── */
const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    data-label={label}
    className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
  >
    <Icon className="sidebar-icon" size={20} strokeWidth={1.7} />
    <span className="sidebar-text">{label}</span>
  </NavLink>
);

const SectionTitle = ({ children }) => (
  <h3 className="sidebar-section-title">{children}</h3>
);

/* ── Subscribed channel row ── */
const ChannelItem = ({ channel, hasNew, collapsed }) => {
  const navigate  = useNavigate();
  const avatarUrl = getAvatarUrl(channel, channel.fullname || channel.username || 'C');

  return (
    <button
      className="sidebar-channel-item"
      data-label={channel.fullname || channel.username}
      onClick={() => navigate(`/channel/${channel.username || channel._id}`)}
      title={channel.fullname || channel.username}
    >
      <div className="sidebar-channel-avatar-wrap">
        <img
          src={avatarUrl}
          alt={channel.username}
          className="sidebar-channel-avatar"
        />
        {hasNew && <span className="sidebar-channel-dot" />}
      </div>
      <span className="sidebar-text sidebar-channel-name">
        {channel.fullname || channel.username}
      </span>
    </button>
  );
};

/* ══════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════ */
const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 1024);
  const [channels,   setChannels]   = useState([]);
  const [showAll,    setShowAll]    = useState(false);

  /* Responsive listener */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Fetch subscribed channels */
  const fetchChannels = useCallback(async () => {
    if (!user) { setChannels([]); return; }
    try {
      const { data } = await axios.get('/api/v1/subscriptions/channels?limit=50');
      // docs is array of { _id, channel: { _id, username, fullname, avatar }, createdAt }
      // We also need hasNew — reuse the feed endpoint's channel list if available,
      // otherwise fall back to subscription list (no hasNew dot)
      try {
        const feed = await axios.get('/api/v1/videos/subscriptions-feed?limit=1');
        const feedChannels = feed.data?.data?.channels || [];
        if (feedChannels.length) {
          setChannels(feedChannels);
          return;
        }
      } catch (_) { /* feed not available, fall back */ }

      // Fallback — map subscription docs to sidebar format
      const docs = data?.data?.docs || [];
      setChannels(docs.map(d => ({ _id: d._id, channel: d.channel, hasNew: false })));
    } catch (_) {
      setChannels([]);
    }
  }, [user]);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  /* CSS class */
  const sidebarClass = isMobile
    ? `global-sidebar${isOpen ? ' mobile-open' : ''}`
    : `global-sidebar${isOpen ? '' : ' collapsed'}`;

  /* Show max 6 channels, expand on "Show more" */
  const INITIAL_SHOW = 6;
  const visibleChannels = showAll ? channels : channels.slice(0, INITIAL_SHOW);

  return (
    <aside className={sidebarClass}>

      {/* ── MAIN ── */}
      <div className="sidebar-section">
        {NAV_MAIN.map(({ to, icon, label, authRequired }) =>
          authRequired && !user ? null : (
            <NavItem key={to} to={to} icon={icon} label={label} />
          )
        )}
      </div>

      {/* ── YOU ── */}
      {user && (
        <div className="sidebar-section">
          <SectionTitle>You</SectionTitle>
          {NAV_YOU.map(({ to, icon, label }) => (
            <NavItem key={to} to={to} icon={icon} label={label} />
          ))}
        </div>
      )}

      {/* ── SUBSCRIPTIONS channel list (YouTube-style) ── */}
      {user && channels.length > 0 && (
        <div className="sidebar-section">
          <SectionTitle>Subscriptions</SectionTitle>

          {visibleChannels.map(({ _id, channel, hasNew }) =>
            channel ? (
              <ChannelItem
                key={_id}
                channel={channel}
                hasNew={hasNew}
              />
            ) : null
          )}

          {/* Show more / Show less toggle */}
          {channels.length > INITIAL_SHOW && (
            <button
              className="sidebar-show-more"
              onClick={() => setShowAll(p => !p)}
            >
              {showAll
                ? <><ChevronUp  size={16} /> Show less</>
                : <><ChevronDown size={16} /> Show {channels.length - INITIAL_SHOW} more</>
              }
            </button>
          )}
        </div>
      )}

      {/* ── EXPLORE ── */}
      <div className="sidebar-section">
        <SectionTitle>Explore</SectionTitle>
        {NAV_EXPLORE.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} />
        ))}
      </div>

      {/* ── SETTINGS ── */}
      <div className="sidebar-section">
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>

    </aside>
  );
};

export default Sidebar;