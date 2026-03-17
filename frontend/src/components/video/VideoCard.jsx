import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, MoreVertical, Clock, ListPlus,
  Share2, Ban, Flag, PlaySquare, Play, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarUtils';
import api from '../../services/api';
import './VideoCard.css';

/* ── helpers (unchanged from original) ── */
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'],
    [604800,  'week'],  [86400,   'day'],
    [3600,    'hour'],  [60,      'minute'],
  ];
  for (const [secs, label] of intervals) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n !== 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

const formatDuration = (secs) => {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoCard = ({ video }) => {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hoverTimerRef = useRef(null);
  const videoRef      = useRef(null);
  const menuRef       = useRef(null);

  /* Close menu on outside click */
  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  /* Hover preview — desktop only, 2s delay */
  const handleMouseEnter = () => {
    if (window.innerWidth < 768) return;
    hoverTimerRef.current = setTimeout(() => {
      setIsPlaying(true);
      videoRef.current?.play().catch(() => {});
    }, 2000);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  /* Navigation */
  const handleVideoClick = () =>
    user ? navigate(`/watch/${video.id || video._id}`) : navigate('/login');

  const handleChannelClick = (e) => {
    e.stopPropagation();
    user
      ? navigate(`/channel/${video.channelId || video.uploaderUsername}`)
      : navigate('/login');
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  /* Derived values */
  const title    = video.title     || 'Untitled Video';
  const thumbnail = video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
  const views    = video.views     || 0;
  const timeAgo  = getRelativeTime(video.createdAt);
  const duration = formatDuration(video.duration);
  const previewUrl = video.videoFile || '';

  /* Owner / avatar resolution (unchanged logic) */
  const isOwnerDocPopulated = video.owner && typeof video.owner === 'object' && video.owner.username;
  const isOwner = user && video.owner && (
    String(user._id) === String(video.owner?._id) ||
    String(user.id)  === String(video.owner?._id) ||
    String(user._id) === String(video.owner)
  );

  let channelName   = 'Unknown Channel';
  let effectiveOwner = video.owner;

  if (isOwnerDocPopulated) {
    channelName = video.owner.fullname || video.owner.username || 'Unknown Channel';
  } else if (isOwner) {
    channelName    = user.fullname || user.username || 'Unknown Channel';
    effectiveOwner = user;
  }

  const avatar = getAvatarUrl(effectiveOwner, channelName);

  return (
    <div className="video-card">

      {/* ── THUMBNAIL ── */}
      <div
        className={`video-thumbnail-container ${isPlaying ? 'playing' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleVideoClick}
      >
        <img
          src={thumbnail}
          alt={title}
          className="video-thumbnail-img"
          loading="lazy"
        />

        <video
          ref={videoRef}
          src={previewUrl}
          className="video-hover-player"
          //i want on hover video will auto play with voice 
          autoPlay muted loop playsInline
        />

        <div className="play-overlay">
          <Play fill="white" size={22} />
        </div>

        <span className="video-duration">{duration}</span>
      </div>

      {/* ── INFO ── */}
      <div className="video-info-container">
        <img
          src={avatar}
          alt={channelName}
          className="video-avatar"
          onClick={handleChannelClick}
          loading="lazy"
        />

        <div className="video-text-content">
          <h3 className="video-title" onClick={handleVideoClick}>
            {title}
          </h3>
          <p className="video-channel" onClick={handleChannelClick}>
            {channelName}
            {video.verified && (
              <CheckCircle size={12} color="#818CF8" strokeWidth={2.5} />
            )}
          </p>
          <p className="video-meta">
            <Eye size={12} />
            {views} views · {timeAgo}
          </p>
        </div>

        {/* ── KEBAB MENU ── */}
        <div className="kebab-menu-container" ref={menuRef}>
          <button className="kebab-btn" onClick={toggleMenu} aria-label="More options">
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="video-dropdown-menu">
              <button className="video-dropdown-item" onClick={(e) => {
                e.stopPropagation();
                const vid = video._id || video.id;
                if (!user) { navigate('/login'); return; }
                api.post(`/watch-later/toggle/${vid}`)
                  .then(res => {
                    const saved = res.data?.data?.saved;
                    alert(saved ? 'Added to Watch Later' : 'Removed from Watch Later');
                  })
                  .catch(() => alert('Failed to update Watch Later'));
                setIsMenuOpen(false);
              }}>
                <Clock size={15} /> Save to Watch Later
              </button>
              <button className="video-dropdown-item">
                <ListPlus size={15} /> Save to Playlist
              </button>
              <button className="video-dropdown-item">
                <Share2 size={15} /> Share
              </button>
              <div className="video-dropdown-divider" />
              <button className="video-dropdown-item">
                <Ban size={15} /> Not Interested
              </button>
              <button className="video-dropdown-item">
                <PlaySquare size={15} /> Don't Recommend Channel
              </button>
              <button className="video-dropdown-item">
                <Flag size={15} /> Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;