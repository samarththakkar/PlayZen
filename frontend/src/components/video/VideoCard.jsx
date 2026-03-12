import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, MoreVertical, Clock, ListPlus, 
  Share2, Ban, Flag, PlaySquare, Play, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './VideoCard.css';
import { getAvatarUrl } from '../../utils/avatarUtils';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const hoverTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const menuRef = useRef(null);

  // Close kebab menu if user clicks anywhere else
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Handle Thumbnail Hover Logic (Play after 2 seconds)
  const handleMouseEnter = () => {
    setIsHovering(true);
    // Don't auto-play on mobile touch devices
    if (window.innerWidth >= 768) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsPlaying(true);
        if (videoRef.current) {
          videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
      }, 2000); // Wait 2 seconds
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsPlaying(false);
    clearTimeout(hoverTimeoutRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video to start
    }
  };

  const handleVideoClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/watch/${video.id || video._id}`);
    }
  };

  const handleChannelClick = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/channel/${video.channelId || video.uploaderUsername}`);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Safely parse properties from MongoDB populated "owner"
  const title = video.title || "Untitled Video";
  const thumbnail = video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
  
  // Determine Real-Time ownership to broadcast live Avatar/Name updates globally without refresh
  const isOwner = user && video.owner && (String(user._id) === String(video.owner?._id) || String(user.id) === String(video.owner?._id) || String(user._id) === String(video.owner));
  
  const isOwnerDocPopulated = video.owner && typeof video.owner === 'object' && video.owner.username;
  
  let channelName = "Unknown Channel";
  let rawAvatarUrl = null;

  // Prioritize DB truth if MongoDB populated the owner document (handles Postman external adjustments).
  // If it's freshly uploaded and not populated, fallback to AuthContext session data if they own it.
  
  let effectiveOwner = video.owner;
  
  if (isOwnerDocPopulated) {
      channelName = video.owner.fullname || video.owner.username || "Unknown Channel";
  } else if (isOwner) {
      channelName = user.fullname || user.username || "Unknown Channel";
      effectiveOwner = user; // Use session user details for generation
  }

  const avatar = getAvatarUrl(effectiveOwner, channelName);
  
  const views = video.views || 0;
  
  // Convert absolute date to relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    interval = seconds / 86400;
    if (interval >= 1) {
        const days = Math.floor(interval);
        if (days >= 7) {
            const weeks = Math.floor(days / 7);
            return weeks + (weeks === 1 ? " week ago" : " weeks ago");
        }
        return days + (days === 1 ? " day ago" : " days ago");
    }
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
    return "Just now";
  };
  const timeAgo = getRelativeTime(video.createdAt);
  
  // Format float duration returned from cloudinary
  const formatDuration = (secs) => {
    if (!secs) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const duration = formatDuration(video.duration);
  
  // Use the actual uploaded video URL for the hover preview playback
  const previewVideoUrl = video.videoFile || ""; 

  return (
    <div className="video-card">
      
      {/* 1. Thumbnail / Hover Player Area */}
      <div 
        className={`video-thumbnail-container ${isPlaying ? 'playing' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleVideoClick}
      >
        <img src={thumbnail} alt={title} className="video-thumbnail-img" />
        
        {/* Render the silent embedded player for hover 
            (We use muted autoplay loop for preview effect) */}
        <video 
          ref={videoRef}
          src={previewVideoUrl}
          className="video-hover-player"
          muted 
          loop 
          playsInline
        />
        
        {/* Center play button overlay on hover */}
        <div className="play-overlay">
          <Play fill="white" size={32} />
        </div>

        <span className="video-duration">{duration}</span>
      </div>

      {/* 2. Info Area */}
      <div className="video-info-container">
        <img 
          src={avatar} 
          alt={channelName} 
          className="video-avatar" 
          onClick={handleChannelClick}
        />
        
        <div className="video-text-content">
          <h3 className="video-title" onClick={handleVideoClick}>{title}</h3>
          <p className="video-channel" onClick={handleChannelClick}>
            {channelName} 
            {video.verified && <CheckCircle size={12} color="var(--accent-color)" strokeWidth={2.5} />}
          </p>
          <p className="video-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} /> {views} views • {timeAgo}
          </p>
        </div>

        {/* 3. Kebab Menu Container */}
        <div className="kebab-menu-container" ref={menuRef}>
          <button className="kebab-btn" onClick={toggleMenu} aria-label="More options">
            <MoreVertical size={18} />
          </button>
          
          {isMenuOpen && (
            <div className="video-dropdown-menu">
              <button className="video-dropdown-item"><Clock size={16} /> Save to Watch later</button>
              <button className="video-dropdown-item"><ListPlus size={16} /> Save to playlist</button>
              <button className="video-dropdown-item"><Share2 size={16} /> Share</button>
              <div className="video-dropdown-divider"></div>
              <button className="video-dropdown-item"><Ban size={16} /> Not interested</button>
              <button className="video-dropdown-item"><PlaySquare size={16} /> Don't recommend channel</button>
              <button className="video-dropdown-item"><Flag size={16} /> Report</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VideoCard;