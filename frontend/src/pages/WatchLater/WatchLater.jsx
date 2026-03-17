import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, Loader2, Play, Bookmark, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './WatchLater.css';

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

const WatchLater = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchWatchLater = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/watch-later?limit=50');
        if (res.data?.data) {
          setVideos(res.data.data.docs || res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch watch later videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchLater();
  }, [user]);

  const handleClear = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await api.delete('/watch-later');
      setVideos([]);
    } catch (err) {
      console.error('Failed to clear watch later:', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="wl-page">

      {/* ── HEADER ── */}
      <div className="wl-header">
        <div className="wl-header-left">
          <div className="wl-header-icon">
            <Bookmark size={22} />
          </div>
          <div>
            <h1 className="wl-title">Watch Later</h1>
            <p className="wl-subtitle">
              {loading ? 'Loading...' : `${videos.length} video${videos.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
        </div>
        {videos.length > 0 && (
          <button
            className="wl-clear-btn"
            onClick={handleClear}
            disabled={clearing}
          >
            {clearing ? <Loader2 size={15} className="spin-icon" /> : <Trash2 size={15} />}
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        )}
      </div>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className="wl-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="wl-card wl-skeleton">
              <div className="wl-card-thumb-wrapper">
                <div className="wl-card-thumb skeleton-pulse" />
              </div>
              <div className="wl-card-info">
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
        <div className="wl-empty">
          <div className="wl-empty-orb" />
          <div className="wl-empty-icon">
            <Clock size={28} />
          </div>
          <h2 className="wl-empty-title">No saved videos yet</h2>
          <p className="wl-empty-text">
            Click "Save" on any video to add it here for later viewing.
          </p>
          <button className="wl-explore-btn" onClick={() => navigate('/')}>
            <Search size={15} />
            Explore Videos
          </button>
        </div>
      )}

      {/* ── VIDEO GRID ── */}
      {!loading && videos.length > 0 && (
        <div className="wl-grid">
          {videos.map((video) => {
            if (!video) return null;
            const owner = video.owner || {};
            const channelName = owner.fullname || owner.username || 'Unknown';

            return (
              <div
                key={video._id}
                className="wl-card"
                onClick={() => navigate(`/watch/${video._id}`)}
              >
                <div className="wl-card-thumb-wrapper">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="wl-card-thumb"
                  />
                  <div className="wl-card-play-overlay">
                    <Play size={22} fill="#fff" />
                  </div>
                  {video.duration && (
                    <span className="wl-card-duration">
                      {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="wl-card-info">
                  <h3 className="wl-card-title">{video.title}</h3>
                  <p className="wl-card-channel">{channelName}</p>
                  <div className="wl-card-meta">
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

export default WatchLater;
