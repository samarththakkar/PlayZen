import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, Clock, Search, Loader2, Play, Heart } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './LikedVideos.css';

const formatTimeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const formatViews = (views) => {
  if (!views) return '0 views';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
};

const LikedVideos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/likes/liked-videos?limit=50');
        if (res.data?.data) {
          setVideos(res.data.data.docs || res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch liked videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, [user]);

  return (
    <div className="liked-page">

      {/* ── HEADER ── */}
      <div className="liked-header">
        <div className="liked-header-left">
          <div className="liked-header-icon">
            <ThumbsUp size={22} />
          </div>
          <div>
            <h1 className="liked-title">Liked Videos</h1>
            <p className="liked-subtitle">
              {loading ? 'Loading...' : `${videos.length} video${videos.length !== 1 ? 's' : ''} liked`}
            </p>
          </div>
        </div>
      </div>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className="liked-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="liked-card liked-skeleton">
              <div className="liked-card-thumb-wrapper">
                <div className="liked-card-thumb skeleton-pulse" />
              </div>
              <div className="liked-card-info">
                <div className="skeleton-pulse" style={{ width: '85%', height: 14, borderRadius: 6 }} />
                <div className="skeleton-pulse" style={{ width: '55%', height: 12, borderRadius: 6, marginTop: 8 }} />
                <div className="skeleton-pulse" style={{ width: '40%', height: 11, borderRadius: 6, marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && videos.length === 0 && (
        <div className="liked-empty">
          <div className="liked-empty-orb" />
          <div className="liked-empty-icon">
            <Heart size={28} />
          </div>
          <h2 className="liked-empty-title">No liked videos yet</h2>
          <p className="liked-empty-text">
            Videos you like will appear here so you can easily find them again.
          </p>
          <button className="liked-explore-btn" onClick={() => navigate('/')}>
            <Search size={15} />
            Explore Videos
          </button>
        </div>
      )}

      {/* ── VIDEO GRID ── */}
      {!loading && videos.length > 0 && (
        <div className="liked-grid">
          {videos.map((video) => {
            if (!video) return null;
            const owner = video.owner || {};
            const channelName = owner.fullname || owner.username || 'Unknown';

            return (
              <div
                key={video._id}
                className="liked-card"
                onClick={() => navigate(`/watch/${video._id}`)}
              >
                <div className="liked-card-thumb-wrapper">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="liked-card-thumb"
                  />
                  <div className="liked-card-play-overlay">
                    <Play size={22} fill="#fff" />
                  </div>
                  {video.duration && (
                    <span className="liked-card-duration">
                      {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="liked-card-info">
                  <h3 className="liked-card-title">{video.title}</h3>
                  <p className="liked-card-channel">{channelName}</p>
                  <div className="liked-card-meta">
                    <span>{formatViews(video.views)}</span>
                    <span className="meta-dot">•</span>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
