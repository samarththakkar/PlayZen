import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, BookmarkPlus, 
  MoreHorizontal, Flag, MessageSquare,
  Link, Facebook, Twitter, BookmarkCheck,
  Play, Pause, Volume2, VolumeX, Volume1, Volume, Maximize, Minimize, Trash2, Settings, Tv
} from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';
import './Watch.css';
import Skeleton from '../../components/ui/Skeleton';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { getSimilarVideos } from '../../services/video.service';
import useLike from '../../hooks/useLike';
import useSubscription from '../../hooks/useSubscription';
import useWatchProgress from '../../hooks/useWatchProgress';
import VideoCard from '../../components/video/VideoCard';
import { useAuth } from '../../hooks/useAuth';

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

const Watch = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guard: unauthenticated users must log in first, then return here
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const [similarVideos, setSimilarVideos] = useState([]);

  const videoRef = useRef(null);
  useWatchProgress(videoId, videoRef);

  const { isLiked, likesCount, toggle: toggleLike } = useLike(videoId, "video", video?.likes || 0);
  
  const ownerId = video?.owner?._id || video?.owner?.id || video?.owner;
  const { isSubscribed: isChannelSubscribed, subscribersCount, toggle: toggleSubscribe } = useSubscription(ownerId);
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // --- Custom Video Player State ---
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [isDisliked, setIsDisliked] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const speedMenuRef = useRef(null);
  const shareMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Customized shortcuts state
  const [playerShortcuts, setPlayerShortcuts] = useState(() => {
    const saved = localStorage.getItem('playzen_keyboard_shortcuts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      playPause: 'k',
      fullscreen: 'f',
      mute: 'm',
      volumeUp: 'ArrowUp',
      volumeDown: 'ArrowDown',
      seekForward: 'ArrowRight',
      seekBackward: 'ArrowLeft',
      pip: 'p',
      speedMenu: 's'
    };
  });

  // Cross-tab storage change sync listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'playzen_keyboard_shortcuts') {
        try {
          if (e.newValue) {
            setPlayerShortcuts(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Playback speed handler
  const handleSpeedChange = (speed) => {
    const rate = Number(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackSpeed(speed);
    }
    setShowSpeedMenu(false);
  };

  // Picture in picture handler
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Picture-in-Picture error:", err);
    }
  };

  // Sync duration changes robustly
  useEffect(() => {
    if (videoRef.current) {
      const videoEl = videoRef.current;
      const checkDuration = () => {
        if (videoEl.duration && videoEl.duration !== Infinity && !isNaN(videoEl.duration)) {
          setDuration(videoEl.duration);
        }
      };
      videoEl.addEventListener("loadedmetadata", checkDuration);
      videoEl.addEventListener("durationchange", checkDuration);
      
      checkDuration();
      
      return () => {
        videoEl.removeEventListener("loadedmetadata", checkDuration);
        videoEl.removeEventListener("durationchange", checkDuration);
      };
    }
  }, [video]);

  // Outside click handlers for Share, Speed, and More Menus
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) {
        setShowSpeedMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Play / Pause handler
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.log(e));
      setIsPlaying(true);
    }
  };

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);

  // Time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && duration !== videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  // Metadata loaded handler
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Seek timeline handler
  const handleSeekChange = (e) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Volume change handler
  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      const nextMuted = val === 0;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Show/Hide controls timer
  useEffect(() => {
    let timeoutId;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      if (isPlaying) {
        timeoutId = setTimeout(() => {
          setShowControls(false);
        }, 2500);
      }
    };
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };
    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      clearTimeout(timeoutId);
    };
  }, [isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable) {
        return;
      }

      const key = e.key;

      const matchesKey = (binding, pressed) => {
        if (!binding) return false;
        if (binding === ' ' && pressed === ' ') return true;
        return binding.toLowerCase() === pressed.toLowerCase();
      };

      if (matchesKey(playerShortcuts.playPause, key) || (playerShortcuts.playPause === 'k' && key === ' ')) {
        e.preventDefault();
        handlePlayPause();
      } else if (matchesKey(playerShortcuts.fullscreen, key)) {
        e.preventDefault();
        toggleFullscreen();
      } else if (matchesKey(playerShortcuts.mute, key)) {
        e.preventDefault();
        toggleMute();
      } else if (matchesKey(playerShortcuts.volumeUp, key)) {
        e.preventDefault();
        setVolume(prev => {
          const next = Math.min(1, prev + 0.1);
          if (videoRef.current) {
            videoRef.current.volume = next;
            videoRef.current.muted = next === 0;
            setIsMuted(next === 0);
          }
          return next;
        });
      } else if (matchesKey(playerShortcuts.volumeDown, key)) {
        e.preventDefault();
        setVolume(prev => {
          const next = Math.max(0, prev - 0.1);
          if (videoRef.current) {
            videoRef.current.volume = next;
            videoRef.current.muted = next === 0;
            setIsMuted(next === 0);
          }
          return next;
        });
      } else if (matchesKey(playerShortcuts.seekForward, key)) {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
        }
      } else if (matchesKey(playerShortcuts.seekBackward, key)) {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
      } else if (matchesKey(playerShortcuts.pip, key)) {
        e.preventDefault();
        togglePictureInPicture();
      } else if (matchesKey(playerShortcuts.speedMenu, key)) {
        e.preventDefault();
        setShowSpeedMenu(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, isMuted, volume, duration, playerShortcuts]);

  // Format Time helper
  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Comments Section State & Logic ---
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async () => {
    if (!videoId) return;
    setLoadingComments(true);
    try {
      const response = await api.get(`/comments/get-comments/${videoId}`);
      if (response.data.success) {
        setComments(response.data.data.docs || []);
        setCommentsCount(response.data.data.totalDocs || response.data.data.docs?.length || 0);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    const commentContent = newComment;
    const tempCommentId = `temp-${Date.now()}`;

    // Create a temporary mock comment to display instantly
    const mockComment = {
      _id: tempCommentId,
      content: commentContent,
      createdAt: new Date().toISOString(),
      owner: {
        _id: user._id || user.id,
        fullname: user.fullname || user.username || "You",
        username: user.username || "you",
        avatar: user.avatar || ""
      }
    };

    // Update state optimistically
    setComments(prev => [mockComment, ...prev]);
    setCommentsCount(prev => prev + 1);
    setNewComment("");
    setIsCommentFocused(false);

    try {
      const response = await api.post(`/comments/add-comment/${videoId}`, { content: commentContent });
      if (response.data.success) {
        toast.success("Comment added successfully!");
        // Fetch to sync real DB data (especially the _id)
        fetchComments();
      } else {
        // Rollback
        setComments(prev => prev.filter(c => c._id !== tempCommentId));
        setCommentsCount(prev => Math.max(0, prev - 1));
        setNewComment(commentContent);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Failed to add comment.");
      // Rollback
      setComments(prev => prev.filter(c => c._id !== tempCommentId));
      setCommentsCount(prev => Math.max(0, prev - 1));
      setNewComment(commentContent);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    const previousComments = comments;
    const previousCount = commentsCount;

    // Optimistically remove comment
    setComments(prev => prev.filter(c => c._id !== commentId));
    setCommentsCount(prev => Math.max(0, prev - 1));

    try {
      const response = await api.delete(`/comments/delete-comment/${commentId}`);
      if (response.data.success) {
        toast.success("Comment deleted successfully!");
      } else {
        // Rollback
        setComments(previousComments);
        setCommentsCount(previousCount);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Failed to delete comment.");
      // Rollback
      setComments(previousComments);
      setCommentsCount(previousCount);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  // Check if video is in watch later
  useEffect(() => {
    if (videoId && user) {
      api.get(`/watch-later/${videoId}`)
        .then(res => setIsSaved(res.data?.data?.saved || false))
        .catch(() => {});
    }
  }, [videoId, user]);

  // Record this video in watch history (fire-and-forget, guarded against StrictMode double-mount)
  const historyRecorded = useRef(null);
  useEffect(() => {
    if (videoId && user && historyRecorded.current !== videoId) {
      historyRecorded.current = videoId;
      api.post('/watch-history', { videoId }).catch(() => {});
    }
  }, [videoId, user]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/videos/get-video/${videoId}`);
        if (response.data.success) {
          const videoData = response.data.data;
          setVideo(videoData);
        } else {
          setError("Failed to load video details.");
        }
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("An error occurred while loading the video.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilar = async () => {
      const { data } = await getSimilarVideos(videoId);
      if (data) setSimilarVideos(data.docs || data || []);
    };

    if (videoId) {
      fetchVideoDetails();
      fetchSimilar();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="watch-page-container">
        <Skeleton type="image" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px' }} />
        <div style={{ marginTop: '1rem' }}>
          <Skeleton type="title" style={{ width: '70%', height: '2rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
             <div style={{ display: 'flex', gap: '1rem' }}>
               <Skeleton type="avatar" />
               <Skeleton type="text" style={{ width: '150px' }} />
             </div>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Skeleton type="button" style={{ width: '100px' }} />
                <Skeleton type="button" style={{ width: '80px' }} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="watch-page-container flex-center">
        <h2>{error || "Video not found"}</h2>
        <button onClick={() => navigate('/')} className="watch-btn btn-primary">Return Home</button>
      </div>
    );
  }

  const owner = video.owner || {};
  const channelName = owner.fullname || owner.username || "Unknown Channel";
  const avatar = getAvatarUrl(owner, channelName);

  // Handlers
  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    }
    toggleLike();
  };
  const handleSubscribe = () => toggleSubscribe();
  
  const handleDislike = () => {
    if (isPlaying) {
      // Just normal toggle
    }
    if (isLiked) {
      toggleLike();
    }
    setIsDisliked(!isDisliked);
  };

  const handleShareClick = () => {
    setShowShareMenu(!showShareMenu);
  };

  const copyUrl = () => {
    copyToClipboard(window.location.href)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy watch link: ", err);
        toast.error("Failed to copy link: " + window.location.href);
      });
    setShowShareMenu(false);
  };

  return (
    <div className="watch-page-container">
      <div className="watch-content">
        
        <div 
          ref={playerContainerRef} 
          className="video-player-wrapper custom-video-player"
        >
          <video 
            ref={videoRef}
            src={video.videoFile} 
            poster={video.thumbnail}
            autoPlay 
            className="main-video-player"
            onClick={handlePlayPause}
            onDoubleClick={toggleFullscreen}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          />
          
          {/* Custom controls overlay */}
          <div className={`video-controls-overlay ${showControls ? 'show' : 'hide'}`}>
            {/* Top gradient shadow */}
            <div className="controls-gradient-top"></div>
            
            {/* Play/Pause Center Indicator */}
            <div className="center-play-indicator" onClick={handlePlayPause}>
              {isPlaying ? <Pause size={48} /> : <Play size={48} />}
            </div>

            {/* Bottom Controls Bar */}
            <div className="controls-bottom-bar">
              {/* Timeline Progress Bar */}
              <div className="video-timeline-container">
                <input 
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="video-timeline-slider"
                  style={{
                    background: `linear-gradient(to right, #ff5555 0%, #ff5555 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              <div className="controls-buttons-row">
                <div className="controls-left-group">
                  <button className="control-btn" onClick={handlePlayPause} title={isPlaying ? "Pause (space)" : "Play (space)"}>
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                  </button>

                  <div className="volume-control-wrapper">
                    <button className="control-btn" onClick={toggleMute} title={isMuted ? "Unmute (m)" : "Mute (m)"}>
                      {isMuted || volume === 0 ? (
                        <VolumeX size={22} />
                      ) : volume < 0.5 ? (
                        <Volume1 size={22} />
                      ) : (
                        <Volume2 size={22} />
                      )}
                    </button>
                    <input 
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-slider"
                      style={{
                        background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                  </div>

                  <span className="video-time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="controls-right-group">
                  {/* Playback Speed settings */}
                  <div style={{ position: 'relative' }} ref={speedMenuRef}>
                    <button 
                      className="control-btn" 
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
                      title="Playback Speed"
                    >
                      <Settings size={22} className={showSpeedMenu ? 'rotate-gear' : ''} />
                    </button>
                    {showSpeedMenu && (
                      <div className="speed-dropdown-menu">
                        {["0.5", "0.75", "1", "1.25", "1.5", "2"].map((speed) => (
                          <button 
                            key={speed}
                            className={`speed-menu-item ${playbackSpeed === speed ? 'active-speed' : ''}`}
                            onClick={() => handleSpeedChange(speed)}
                          >
                            {speed === "1" ? "Normal" : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Picture-in-Picture Button */}
                  <button className="control-btn" onClick={togglePictureInPicture} title="Picture in Picture">
                    <Tv size={22} />
                  </button>

                  <button className="control-btn" onClick={toggleFullscreen} title="Fullscreen (f)">
                    {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info Section */}
        <div className="video-details-section">
          <h1 className="watch-title">{video.title}</h1>
          
          <div className="watch-metadata-row">
            {/* Channel Info */}
            <div className="watch-channel-info">
              <img 
                src={avatar} 
                alt={channelName} 
                className="watch-channel-avatar" 
                onClick={() => navigate(`/channel/${owner.username || owner._id}`)}
              />
              <div className="watch-channel-text">
                <h3>
                  {channelName}
                </h3>
                <span>{subscribersCount} subscribers</span>
              </div>
              <button 
                className={`watch-subscribe-btn ${isChannelSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
              >
                {isChannelSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Actions */}
            <div className="watch-actions">
              <div className="watch-action-group">
                <button 
                  className={`watch-action-btn border-right-btn ${isLiked ? 'active-action' : ''}`}
                  onClick={handleLike}
                >
                  <ThumbsUp size={20} fill={isLiked ? 'currentColor' : 'none'} /> 
                  <span>{likesCount}</span>
                </button>
                <button 
                  className={`watch-action-btn ${isDisliked ? 'active-action' : ''}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={20} fill={isDisliked ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <div style={{ position: 'relative' }} ref={shareMenuRef}>
                <button className="watch-action-btn" onClick={handleShareClick}>
                  <Share2 size={20} /> <span>Share</span>
                </button>
                {showShareMenu && (
                  <div className="action-dropdown-menu">
                    <button className="dropdown-menu-item" onClick={copyUrl}>
                      <Link size={16} /> Copy Link
                    </button>
                    <a className="dropdown-menu-item" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">
                      <MessageSquare size={16} color="#25D366" /> WhatsApp
                    </a>
                    <a className="dropdown-menu-item" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">
                      <Facebook size={16} color="#1877F2" /> Facebook
                    </a>
                    <a className="dropdown-menu-item" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">
                      <Twitter size={16} color="#1DA1F2" /> Twitter
                    </a>
                  </div>
                )}
              </div>
              
              <button 
                className={`watch-action-btn ${isSaved ? 'active-action' : ''}`}
                onClick={() => {
                  if (!user) return;
                  const previousIsSaved = isSaved;
                  const nextIsSaved = !isSaved;
                  
                  setIsSaved(nextIsSaved);
                  if (nextIsSaved) {
                    toast.success("Added to Watch Later");
                  } else {
                    toast.success("Removed from Watch Later");
                  }

                  api.post(`/watch-later/toggle/${videoId}`)
                    .then(res => {
                      const saved = res.data?.data?.saved;
                      if (saved !== undefined && saved !== nextIsSaved) {
                        setIsSaved(saved);
                      }
                    })
                    .catch((err) => {
                      console.error("Error toggling Watch Later:", err);
                      setIsSaved(previousIsSaved);
                      toast.error("Failed to update Watch Later");
                    });
                }}
              >
                {isSaved ? <BookmarkCheck size={20} fill="currentColor" /> : <BookmarkPlus size={20} />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              <div style={{ position: 'relative' }} ref={moreMenuRef}>
                <button 
                  className={`watch-action-btn icon-only-btn ${showMoreMenu ? 'active-action' : ''}`}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <MoreHorizontal size={20} />
                </button>
                {showMoreMenu && (
                  <div className="action-dropdown-menu">
                    <button className="dropdown-menu-item" onClick={() => { toast.success("Video reported."); setShowMoreMenu(false); }}>
                      <Flag size={16} /> Report Video
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div 
            className={`watch-description-box ${isDescExpanded ? 'expanded' : 'collapsed'}`}
            onClick={() => { if (!isDescExpanded) setIsDescExpanded(true); }}
            style={{ cursor: !isDescExpanded ? 'pointer' : 'default' }}
          >
            <div className="watch-stats">
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="watch-description-content">
              <p className="watch-description-text">
                {video.description || "No description available."}
              </p>
            </div>
            {video.description && (
              <button 
                className="watch-desc-toggle-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded(!isDescExpanded);
                }}
              >
                {isDescExpanded ? "Show less" : "...Show more"}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="watch-comments-section">
            <div className="comments-header">
              <h3>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</h3>
            </div>
            
            {/* Comment Input */}
            <div className="comment-input-wrapper">
              <img src={avatar} alt="You" className="comment-avatar" />
              <form onSubmit={handleAddComment} className="comment-form">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="comment-input" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setIsCommentFocused(true)}
                />
                {isCommentFocused && (
                  <div className="comment-action-buttons">
                    <button 
                      type="button" 
                      className="comment-cancel-btn"
                      onClick={() => {
                        setNewComment("");
                        setIsCommentFocused(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="comment-submit-btn"
                      disabled={!newComment.trim()}
                    >
                      Comment
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Comments List */}
            <div className="comments-list">
              {loadingComments ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <Skeleton type="text" style={{ width: '80%' }} />
                  <Skeleton type="text" style={{ width: '60%' }} />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const commentOwner = comment.owner || {};
                  const commentOwnerName = commentOwner.fullname || commentOwner.username || "Anonymous";
                  const commentAvatar = getAvatarUrl(commentOwner, commentOwnerName);
                  const isOwnComment = user && (user._id === commentOwner._id || user.id === commentOwner._id || user._id === commentOwner.id || user.id === commentOwner.id);

                  return (
                    <div key={comment._id} className="comment-item">
                      <img src={commentAvatar} alt={commentOwnerName} className="comment-avatar" />
                      <div className="comment-content-wrapper">
                        <div className="comment-user-info">
                          <span className="comment-username">{commentOwnerName}</span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                      {isOwnComment && (
                        <button 
                          className="delete-comment-btn" 
                          onClick={() => handleDeleteComment(comment._id)}
                          title="Delete comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="no-comments-text">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Recommended Videos Sidebar */}
      <div className="watch-sidebar">
        <h3>Up next</h3>
        <div className="similar-videos-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
          {similarVideos.length > 0 ? (
            similarVideos.map(simVideo => (
              <VideoCard key={simVideo._id || simVideo.id} video={simVideo} />
            ))
          ) : (
            <p className="sidebar-placeholder-text">No recommended videos found.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Watch;
