import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Trash2, Clock, Eye, AlertCircle, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarUtils';
import Skeleton from '../../components/ui/Skeleton';
import toast from '../../utils/toast';
import './Playlist.css';

const Playlist = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaylist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/playlists/get-playlist/${playlistId}`);
      if (response.data.success) {
        setPlaylist(response.data.data);
      } else {
        setError("Playlist not found");
      }
    } catch (err) {
      console.error("Error fetching playlist:", err);
      setError("Failed to load playlist details. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleRemoveVideo = async (videoId) => {
    try {
      const response = await api.post(`/playlists/remove-video/${playlistId}/${videoId}`);
      if (response.data.success) {
        setPlaylist(prev => ({
          ...prev,
          videos: prev.videos.filter(vid => vid._id !== videoId)
        }));
      }
    } catch (err) {
      console.error("Failed to remove video:", err);
    }
  };

  const confirmDeletePlaylist = async () => {
    setIsDeleteModalOpen(false);
    try {
      const response = await api.delete(`/playlists/delete-playlist/${playlistId}`);
      if (response.data.success) {
        navigate('/profile', { state: { activeTab: 'Playlists' } });
      }
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  };

  const handleBack = () => {
    const ownerUsername = playlist?.owner?.username;
    if (isOwner) {
      navigate('/profile', { state: { activeTab: 'Playlists' } });
    } else if (ownerUsername) {
      navigate(`/channel/${ownerUsername}`, { state: { activeTab: 'Playlists' } });
    } else {
      navigate(-1);
    }
  };

  const handlePlayAll = () => {
    if (playlist?.videos && playlist.videos.length > 0) {
      navigate(`/watch/${playlist.videos[0]._id}`);
    } else {
      toast.error("No videos in this playlist to play");
    }
  };

  const handleShufflePlay = () => {
    if (playlist?.videos && playlist.videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.videos.length);
      navigate(`/watch/${playlist.videos[randomIndex]._id}`);
    } else {
      toast.error("No videos in this playlist to play");
    }
  };

  const isOwner = user && playlist && String(user._id || user.id) === String(playlist.owner?._id || playlist.owner);
  const videoCount = playlist?.videos?.length || 0;
  const ownerName = playlist?.owner?.fullname || playlist?.owner?.username || "PlayZen Creator";
  const ownerAvatar = getAvatarUrl(playlist?.owner, ownerName);

  const playlistThumbnail = playlist?.thumbnail || 
    (playlist?.videos && playlist.videos[0]?.thumbnail) || 
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  const getDurationText = (secs) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
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

  if (loading) {
    return (
      <div className="playlist-page-container skeleton-loading">
        <div className="playlist-sidebar-meta">
          <Skeleton type="image" className="sidebar-thumb-skel" />
          <Skeleton type="title" style={{ width: '80%', height: '2rem', marginTop: '1.5rem' }} />
          <Skeleton type="text" style={{ width: '40%', height: '1.2rem', marginTop: '1rem' }} />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Skeleton type="button" style={{ width: '100px', height: '36px', borderRadius: '30px' }} />
            <Skeleton type="button" style={{ width: '100px', height: '36px', borderRadius: '30px' }} />
          </div>
        </div>
        <div className="playlist-videos-column">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="playlist-video-row-skeleton" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
              <Skeleton type="text" style={{ width: '20px', height: '20px' }} />
              <Skeleton type="image" style={{ width: '120px', height: '68px', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <Skeleton type="title" style={{ width: '60%', height: '1.2rem' }} />
                <Skeleton type="text" style={{ width: '30%', height: '0.9rem', marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="playlist-error-container">
        <AlertCircle size={48} color="#ef4444" />
        <h2>Failed to load playlist</h2>
        <p>{error || "The playlist does not exist or has been deleted."}</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="playlist-page-container">
      {/* Blurred background matching thumbnail */}
      <div className="playlist-blurred-bg" style={{ backgroundImage: `url(${playlistThumbnail})` }}></div>

      {/* Left/Top Metadata Sidebar */}
      <div className="playlist-sidebar-meta">
        <button className="playlist-back-link-btn" onClick={handleBack}>
          &larr; Back to Channel
        </button>

        <div className="playlist-sidebar-card">
          <div className="playlist-sidebar-img-wrapper">
            <img src={playlistThumbnail} alt={playlist.title} className="playlist-sidebar-img" />
            <div className="playlist-sidebar-overlay">
              <span className="video-count-badge">{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="playlist-info-block">
            <h1 className="playlist-title">{playlist.title}</h1>
            <p className="playlist-desc">{playlist.description || "No description provided."}</p>

            <div className="playlist-creator-row">
              <img src={ownerAvatar} alt={ownerName} className="playlist-creator-avatar" />
              <span className="playlist-creator-name" onClick={handleBack}>
                {ownerName}
              </span>
            </div>

            <div className="playlist-stats-row">
              <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
              <span className="stats-bullet">&bull;</span>
              <span>Updated {getRelativeTime(playlist.updatedAt)}</span>
            </div>

            <div className="playlist-action-btns">
              <button className="play-btn-primary" onClick={handlePlayAll} disabled={videoCount === 0}>
                <Play size={18} fill="currentColor" /> Play All
              </button>
              <button className="play-btn-secondary" onClick={handleShufflePlay} disabled={videoCount === 0}>
                <Shuffle size={18} /> Shuffle
              </button>
              {isOwner && (
                <button className="delete-playlist-btn" onClick={() => setIsDeleteModalOpen(true)} title="Delete Playlist">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right/Bottom Video List */}
      <div className="playlist-videos-column">
        {videoCount === 0 ? (
          <div className="playlist-empty-state">
            <h3>This playlist has no videos yet</h3>
            <p>Go to watch pages to add videos to this playlist.</p>
          </div>
        ) : (
          <div className="playlist-videos-list">
            {playlist.videos.map((vid, index) => {
              const videoId = vid._id || vid.id;
              const videoUploader = vid.owner?.fullname || vid.owner?.username || "Unknown Creator";
              return (
                <div key={videoId} className="playlist-video-row" onClick={() => navigate(`/watch/${videoId}`)}>
                  <div className="video-row-index">{index + 1}</div>
                  
                  <div className="video-row-thumbnail-wrap">
                    <img src={vid.thumbnail} alt={vid.title} className="video-row-thumbnail" />
                    <span className="video-row-duration">{getDurationText(vid.duration)}</span>
                  </div>

                  <div className="video-row-details">
                    <h3 className="video-row-title">{vid.title}</h3>
                    <p className="video-row-channel">
                      {videoUploader}
                    </p>
                    <p className="video-row-meta">
                      {formatViews(vid.views || 0)} views &bull; {getRelativeTime(vid.createdAt)}
                    </p>
                  </div>

                  {isOwner && (
                    <button 
                      className="remove-video-row-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVideo(videoId);
                      }}
                      title="Remove from playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isDeleteModalOpen && (
        <div className="custom-confirm-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="custom-confirm-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Delete playlist</h3>
            </div>
            <div className="confirm-modal-body">
              <p>Are you sure you want to delete <strong>{playlist?.title}</strong>? This action cannot be undone.</p>
            </div>
            <div className="confirm-modal-footer">
              <button className="confirm-cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDeletePlaylist}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;
