import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, PlusSquare, 
  MoreHorizontal, Flag, MessageSquare,
  Link, Facebook, Twitter
} from 'lucide-react';
import api from '../../services/api';
import './Watch.css';
import Skeleton from '../../components/ui/Skeleton';
import { getAvatarUrl } from '../../utils/avatarUtils';

const Watch = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive States
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  
  const [likeStatus, setLikeStatus] = useState(null); // 'liked', 'disliked', or null
  const [likeCount, setLikeCount] = useState(0);
  
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/videos/get-video/${videoId}`);
        if (response.data.success) {
          const videoData = response.data.data;
          setVideo(videoData);
          setLikeCount(videoData.likes || 0);
          
          if (videoData.owner) {
             setSubscriberCount(videoData.owner.subscribersCount || 0);
             // In a real app, you'd check if the current user is subscribed here
          }
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

    if (videoId) {
      fetchVideoDetails();
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
  const handleSubscribe = () => {
    if (isSubscribed) {
      setSubscriberCount(prev => Math.max(0, prev - 1));
    } else {
      setSubscriberCount(prev => prev + 1);
    }
    setIsSubscribed(!isSubscribed);
  };

  const handleLike = () => {
    if (likeStatus === 'liked') {
      setLikeStatus(null);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      setLikeStatus('liked');
      setLikeCount(prev => likeStatus === null ? prev + 1 : prev + 1); // If jumping from dislike to like, just add 1 relative to base, logic can be complex
    }
  };

  const handleDislike = () => {
    if (likeStatus === 'liked') {
      setLikeCount(prev => Math.max(0, prev - 1));
    }
    setLikeStatus(likeStatus === 'disliked' ? null : 'disliked');
  };

  const handleShareClick = () => {
    setShowShareMenu(!showShareMenu);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
    alert("URL Copied to clipboard!");
  };

  return (
    <div className="watch-page-container">
      <div className="watch-content">
        
        {/* Main Video Player */}
        <div className="video-player-wrapper">
          <video 
            src={video.videoFile} 
            poster={video.thumbnail}
            controls 
            autoPlay 
            className="main-video-player"
          />
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
                <h3 onClick={() => navigate(`/channel/${owner.username || owner._id}`)}>
                  {channelName}
                </h3>
                <span>{subscriberCount} subscribers</span>
              </div>
              <button 
                className={`watch-subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Actions */}
            <div className="watch-actions">
              <div className="watch-action-group">
                <button 
                  className={`watch-action-btn border-right-btn ${likeStatus === 'liked' ? 'active-action' : ''}`}
                  onClick={handleLike}
                >
                  <ThumbsUp size={20} fill={likeStatus === 'liked' ? 'currentColor' : 'none'} /> 
                  <span>{likeCount}</span>
                </button>
                <button 
                  className={`watch-action-btn ${likeStatus === 'disliked' ? 'active-action' : ''}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={20} fill={likeStatus === 'disliked' ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <div style={{ position: 'relative' }}>
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
              
              <button className="watch-action-btn">
                <PlusSquare size={20} /> <span>Save</span>
              </button>
              
              <button className="watch-action-btn icon-only-btn">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="watch-description-box">
            <div className="watch-stats">
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="watch-description-text">
              {video.description || "No description available."}
            </p>
          </div>

          {/* Comments Section Placeholder */}
          <div className="watch-comments-section">
            <div className="comments-header">
              <h3>23 Comments</h3>
              <button className="sort-comments-btn"><MessageSquare size={18}/> Sort by</button>
            </div>
            <div className="comment-input-wrapper">
              <img src={avatar} alt="You" className="comment-avatar" />
              <input type="text" placeholder="Add a comment..." className="comment-input" />
            </div>
          </div>

        </div>
      </div>

      {/* Recommended Videos Sidebar (Placeholder) */}
      <div className="watch-sidebar">
        <h3>Up next</h3>
        <p className="sidebar-placeholder-text">Recommended videos will appear here.</p>
      </div>

    </div>
  );
};

export default Watch;
