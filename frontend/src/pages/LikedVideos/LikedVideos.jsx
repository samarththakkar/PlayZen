import React, { useState, useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { ThumbsUp, Clock, Search, Loader2, Play, Heart } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import VideoCard from '../../components/video/VideoCard';
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

  const navigationType = useNavigationType();

  // Save scroll Y position on scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('liked_scroll_y', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Clear scroll position on fresh PUSH navigation
  useEffect(() => {
    if (navigationType === 'PUSH') {
      sessionStorage.removeItem('liked_scroll_y');
    }
  }, [navigationType]);

  // Restore scroll position when loading completes
  useEffect(() => {
    if (!loading && navigationType === 'POP') {
      const savedScrollY = sessionStorage.getItem('liked_scroll_y');
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollY, 10));
        }, 100);
      }
    }
  }, [loading, navigationType]);

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
          <h1 className="liked-title">Liked Videos</h1>
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
          {videos.map((video) => (
            video ? <VideoCard key={video._id} video={video} /> : null
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
