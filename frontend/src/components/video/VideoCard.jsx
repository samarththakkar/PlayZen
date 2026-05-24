import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  CheckCircle, MoreVertical, Clock, ListPlus,
  Share2, Ban, Flag, PlaySquare, Play, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarUtils';
import api from '../../services/api';
import toast from '../../utils/toast';
import './VideoCard.css';

/* ── helpers (unchanged from original) ── */
const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error("execCommand failed"));
      }
      textArea.remove();
    });
  }
};
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
  const [isHidden, setIsHidden]     = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const hoverTimerRef = useRef(null);
  const videoRef      = useRef(null);
  const menuRef       = useRef(null);

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

  /* Custom event listener to hide all videos from a channel when it is blocked */
  useEffect(() => {
    const handleChannelBlocked = (e) => {
      const blockedId = e.detail.channelId;
      const myChannelId = effectiveOwner?._id || effectiveOwner?.id;
      if (blockedId && myChannelId && String(blockedId) === String(myChannelId)) {
        setIsHidden(true);
      }
    };
    window.addEventListener('channel-blocked', handleChannelBlocked);
    return () => window.removeEventListener('channel-blocked', handleChannelBlocked);
  }, [effectiveOwner]);

  /* Hover preview — desktop only, 3s delay */
  const handleMouseEnter = () => {
    if (window.innerWidth < 768) return;
    
    // Check user preferences
    const settingsStr = localStorage.getItem("settings");
    let hoverAutoplay = true;
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings.playback?.hoverAutoplay !== undefined) {
          hoverAutoplay = settings.playback.hoverAutoplay;
        }
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
    
    if (!hoverAutoplay) return;

    hoverTimerRef.current = setTimeout(() => {
      setIsPlaying(true);
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.muted = false;
        videoEl.play()
          .catch((err) => {
            console.log("Unmuted autoplay failed, falling back to muted:", err);
            videoEl.muted = true;
            return videoEl.play();
          })
          .catch((err) => {
            console.error("Muted autoplay also failed:", err);
          });
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
    }
  };

  /* Navigation */
  const handleVideoClick = () => {
    const videoId = video._id || video.id;
    if (!videoId) return;
    if (!user) {
      navigate('/login', { state: { from: `/watch/${videoId}` } });
      return;
    }
    navigate(`/watch/${videoId}`);
  };

  const handleChannelClick = (e) => {
    e.stopPropagation();
    // Use the correct populated owner fields from the backend
    const username = video.owner?.username || video.channelId || video.uploaderUsername;
    if (username) {
      navigate(`/channel/${username}`);
    } else if (video.owner?._id) {
      navigate(`/profile/${video.owner._id}`);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    const videoId = video._id || video.id;
    const url = `${window.location.origin}/watch/${videoId}`;
    copyToClipboard(url)
      .then(() => {
        toast.success("Watch link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy watch link: ", err);
        toast.error("Failed to copy link: " + url);
      });
  };

  const handleNotInterested = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (!user) { navigate('/login'); return; }
    const videoId = video._id || video.id;
    api.post(`/recommendations/not-interested/${videoId}`)
      .then(() => {
        setIsHidden(true);
        toast.success("Video hidden from recommendations");
      })
      .catch((err) => {
        console.error("Error setting not interested:", err);
        toast.error("Failed to hide video");
      });
  };

  const handleBlockChannel = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (!user) { navigate('/login'); return; }
    const channelId = effectiveOwner?._id || effectiveOwner?.id;
    if (!channelId) {
      toast.error("Channel identifier not found");
      return;
    }
    api.post(`/recommendations/block-channel/${channelId}`)
      .then(() => {
        setIsHidden(true);
        toast.success("Channel blocked and hidden");
        // Notify other video cards of the same channel on this page
        const event = new CustomEvent('channel-blocked', { detail: { channelId } });
        window.dispatchEvent(event);
      })
      .catch((err) => {
        console.error("Error blocking channel:", err);
        toast.error("Failed to block channel");
      });
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (!user) { navigate('/login'); return; }
    setIsReportModalOpen(true);
  };

  const handleSaveToPlaylistClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (!user) { navigate('/login'); return; }
    setIsPlaylistModalOpen(true);
  };

  if (isHidden) return null;

  return (
    <div className="video-card" onMouseLeave={() => setIsMenuOpen(false)}>

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
          loop
          playsInline
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
              <CheckCircle size={12} color="#ff5555" strokeWidth={2.5} />
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
                toast.success("Watch Later status updated");
                api.post(`/watch-later/toggle/${vid}`)
                  .catch((err) => {
                    console.error("Error toggling Watch Later:", err);
                    toast.error("Failed to update Watch Later");
                  });
                setIsMenuOpen(false);
              }}>
                <Clock size={15} /> Save to Watch Later
              </button>
              <button className="video-dropdown-item" onClick={handleSaveToPlaylistClick}>
                <ListPlus size={15} /> Save to Playlist
              </button>
              <button className="video-dropdown-item" onClick={handleShare}>
                <Share2 size={15} /> Share
              </button>
              <div className="video-dropdown-divider" />
              <button className="video-dropdown-item" onClick={handleNotInterested}>
                <Ban size={15} /> Not Interested
              </button>
              <button className="video-dropdown-item" onClick={handleBlockChannel}>
                <PlaySquare size={15} /> Don't Recommend Channel
              </button>
              <button className="video-dropdown-item" onClick={handleReport}>
                <Flag size={15} /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {isPlaylistModalOpen && (
        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          videoId={video._id || video.id}
          user={user}
        />
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        videoId={video._id || video.id}
        onReportSubmitted={() => setIsHidden(true)}
      />
    </div>
  );
};

/* ── PLAYLIST MODAL COMPONENT ── */
const PlaylistModal = ({ isOpen, onClose, videoId, user }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    const userId = user._id || user.id;
    api.get(`/playlists/user-playlists/${userId}`)
      .then(res => {
        setPlaylists(res.data?.data || []);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setPlaylists([]);
        } else {
          console.error(err);
          setError("Failed to load playlists");
        }
        setIsLoading(false);
      });
  }, [isOpen, user, videoId]);

  if (!isOpen) return null;

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error("Playlist title is required");
      return;
    }
    setIsCreating(true);
    try {
      const desc = newPlaylistDesc.trim() || "My playlist";
      const createRes = await api.post('/playlists/create-playlist', {
        title: newPlaylistName.trim(),
        description: desc
      });
      
      const newPlaylist = createRes.data?.data;
      if (!newPlaylist?._id) {
        throw new Error("Failed to retrieve new playlist ID");
      }

      const addRes = await api.post(`/playlists/add-video/${newPlaylist._id}/${videoId}`);
      const updatedPlaylist = addRes.data?.data || {
        ...newPlaylist,
        videos: [videoId]
      };

      setPlaylists(prev => [...prev, updatedPlaylist]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setIsCreating(false);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create playlist: ", err);
      toast.error("Failed to create playlist");
      setIsCreating(false);
    }
  };

  const handleTogglePlaylist = async (playlistId, isChecked) => {
    try {
      if (isChecked) {
        await api.post(`/playlists/remove-video/${playlistId}/${videoId}`);
        setPlaylists(prev => prev.map(p => {
          if (p._id === playlistId) {
            return {
              ...p,
              videos: (p.videos || []).filter(vidId => String(vidId) !== String(videoId))
            };
          }
          return p;
        }));
      } else {
        await api.post(`/playlists/add-video/${playlistId}/${videoId}`);
        setPlaylists(prev => prev.map(p => {
          if (p._id === playlistId) {
            return {
              ...p,
              videos: [...(p.videos || []), videoId]
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Failed to update playlist: ", err);
      toast.error("Failed to update playlist");
    }
  };

  return createPortal(
    <div className="playlist-modal-overlay" onClick={onClose}>
      <div className="playlist-modal-content" onClick={e => e.stopPropagation()}>
        <div className="playlist-modal-header">
          <h3>Save to...</h3>
          <button className="close-modal-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="playlist-modal-body">
          {isLoading ? (
            <div className="playlist-modal-loading">Loading playlists...</div>
          ) : error ? (
            <div className="playlist-modal-error">{error}</div>
          ) : (
            <div className="playlists-checklist">
              {playlists.length === 0 ? (
                <div className="no-playlists-msg">No playlists found. Create one below!</div>
              ) : (
                playlists.map(p => {
                  const isChecked = (p.videos || []).some(vidId => String(vidId) === String(videoId));
                  return (
                    <label key={p._id} className="playlist-check-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePlaylist(p._id, isChecked)}
                      />
                      <span className="playlist-name">{p.title || p.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="playlist-modal-footer">
          {!showCreateForm ? (
            <button 
              className="toggle-create-form-btn" 
              onClick={() => setShowCreateForm(true)}
            >
              + Create new playlist
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
              <input
                type="text"
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                maxLength={40}
                required
                className="new-playlist-input"
              />
              <input
                type="text"
                placeholder="Enter description (optional)..."
                value={newPlaylistDesc}
                onChange={e => setNewPlaylistDesc(e.target.value)}
                maxLength={100}
                className="new-playlist-input"
              />
              <div className="form-action-row">
                <button 
                  type="button" 
                  className="cancel-create-btn" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating} 
                  className="submit-create-btn"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── REPORT MODAL COMPONENT ── */
const ReportModal = ({ isOpen, onClose, videoId, onReportSubmitted }) => {
  const [selectedReason, setSelectedReason] = useState("Inappropriate content");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    "Inappropriate content",
    "Spam or misleading",
    "Harassment or hate speech",
    "Violent content",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!finalReason) {
      toast.error("Please enter a reason");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/recommendations/report/${videoId}`, { reason: finalReason });
      onReportSubmitted();
      toast.success("Video reported successfully");
      onClose();
    } catch (err) {
      console.error("Failed to report video:", err);
      toast.error("Failed to report video");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="playlist-modal-overlay" onClick={onClose}>
      <div className="playlist-modal-content report-modal-content" onClick={e => e.stopPropagation()}>
        <div className="playlist-modal-header">
          <h3>Report Video</h3>
          <button className="close-modal-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="playlist-modal-body report-modal-body">
            <p className="report-modal-desc">Why are you reporting this video? Your feedback helps us keep the platform safe.</p>
            <div className="report-reasons-list">
              {reasons.map((r, idx) => (
                <label key={idx} className="report-reason-item">
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            {selectedReason === "Other" && (
              <textarea
                className="report-custom-input"
                placeholder="Please describe the issue..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={200}
                required
              />
            )}
          </div>
          <div className="playlist-modal-footer">
            <div className="form-action-row">
              <button type="button" className="cancel-create-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="submit-create-btn">
                {isSubmitting ? "Submitting..." : "Report"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default VideoCard;