import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Clock, Trash2, Search, Loader2, Play } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarUtils';
import './History.css';

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

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/watch-history/${user._id}`);
        if (res.data?.data) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch watch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleClear = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await api.delete('/watch-history/clear');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="history-page">

      {/* ── HEADER ── */}
      <div className="history-header">
        <div className="history-header-left">
          <div className="history-header-icon">
            <HistoryIcon size={22} />
          </div>
          <div>
            <h1 className="history-title">Watch History</h1>
            <p className="history-subtitle">
              {loading ? 'Loading...' : `${history.length} video${history.length !== 1 ? 's' : ''} watched`}
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            className="history-clear-btn"
            onClick={handleClear}
            disabled={clearing}
          >
            {clearing ? <Loader2 size={15} className="spin-icon" /> : <Trash2 size={15} />}
            {clearing ? 'Clearing...' : 'Clear History'}
          </button>
        )}
      </div>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className="history-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="history-card history-skeleton">
              <div className="history-card-thumb-wrapper"><div className="history-card-thumb skeleton-pulse" /></div>
              <div className="history-card-info">
                <div className="skeleton-pulse" style={{ width: '85%', height: 14, borderRadius: 6 }} />
                <div className="skeleton-pulse" style={{ width: '55%', height: 12, borderRadius: 6, marginTop: 8 }} />
                <div className="skeleton-pulse" style={{ width: '40%', height: 11, borderRadius: 6, marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && history.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-orb" />
          <div className="history-empty-icon">
            <Clock size={28} />
          </div>
          <h2 className="history-empty-title">No watch history yet</h2>
          <p className="history-empty-text">
            Videos you watch will appear here so you can easily pick up where you left off.
          </p>
          <button className="history-explore-btn" onClick={() => navigate('/')}>
            <Search size={15} />
            Explore Videos
          </button>
        </div>
      )}

      {/* ── HISTORY GRID ── */}
      {!loading && history.length > 0 && (
        <div className="history-grid">
          {history.map((entry) => {
            const video = entry.video;
            if (!video) return null;
            const owner = video.owner || {};
            const channelName = owner.fullname || owner.username || 'Unknown';

            return (
              <div
                key={entry._id}
                className="history-card"
                onClick={() => navigate(`/watch/${video._id}`)}
              >
                <div className="history-card-thumb-wrapper">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="history-card-thumb"
                  />
                  <div className="history-card-play-overlay">
                    <Play size={22} fill="#fff" />
                  </div>
                  {video.duration && (
                    <span className="history-card-duration">
                      {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="history-card-info">
                  <h3 className="history-card-title">{video.title}</h3>
                  <p className="history-card-channel">{channelName}</p>
                  <div className="history-card-meta">
                    <span>{formatViews(video.views)}</span>
                    <span className="meta-dot">•</span>
                    <span>{formatTimeAgo(entry.watchedAt)}</span>
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

export default History;