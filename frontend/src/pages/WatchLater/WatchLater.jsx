import React, { useState, useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { Clock, Search, Loader2, Play, Bookmark, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import VideoCard from '../../components/video/VideoCard';
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

  const navigationType = useNavigationType();

  // Save scroll Y position on scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('wl_scroll_y', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Clear scroll position on fresh PUSH navigation
  useEffect(() => {
    if (navigationType === 'PUSH') {
      sessionStorage.removeItem('wl_scroll_y');
    }
  }, [navigationType]);

  // Restore scroll position when loading completes
  useEffect(() => {
    if (!loading && navigationType === 'POP') {
      const savedScrollY = sessionStorage.getItem('wl_scroll_y');
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollY, 10));
        }, 100);
      }
    }
  }, [loading, navigationType]);

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
          <h1 className="wl-title">Watch Later</h1>
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
          {videos.map((video) => (
            video ? <VideoCard key={video._id} video={video} /> : null
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;
