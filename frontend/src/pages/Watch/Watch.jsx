import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, BookmarkPlus, 
  MoreHorizontal, Flag, MessageSquare,
  Link, Facebook, Twitter, BookmarkCheck
} from 'lucide-react';
import api from '../../services/api';
import './Watch.css';
import Skeleton from '../../components/ui/Skeleton';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { getSimilarVideos } from '../../services/video.service';
import useLike from '../../hooks/useLike';
import useSubscription from '../../hooks/useSubscription';
import useWatchProgress from '../../hooks/useWatchProgress';
import VideoCard from '../../components/video/VideoCard';
import { useAuth } from '../../hooks/useAuth';

const Watch = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [similarVideos, setSimilarVideos] = useState([]);

  const videoRef = useRef(null);
  useWatchProgress(videoId, videoRef);

  const { isLiked, likesCount, toggle: toggleLike } = useLike(videoId, "video", video?.likes || 0);
  
  const ownerId = video?.owner?._id || video?.owner?.id || video?.owner;
  const { isSubscribed: isChannelSubscribed, subscribersCount, toggle: toggleSubscribe } = useSubscription(ownerId);
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
  const handleLike = () => toggleLike();
  const handleSubscribe = () => toggleSubscribe();
  
  const handleDislike = () => {
    // Left as stub since useLike only handles like
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
        
        <div className="video-player-wrapper">
          <video 
            ref={videoRef}
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
                  className={`watch-action-btn`}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={20} fill={'none'} />
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
              
              <button 
                className={`watch-action-btn ${isSaved ? 'active-action' : ''}`}
                onClick={() => {
                  if (!user) return;
                  api.post(`/watch-later/toggle/${videoId}`)
                    .then(res => setIsSaved(res.data?.data?.saved ?? !isSaved))
                    .catch(() => {});
                }}
              >
                {isSaved ? <BookmarkCheck size={20} fill="currentColor" /> : <BookmarkPlus size={20} />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
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
