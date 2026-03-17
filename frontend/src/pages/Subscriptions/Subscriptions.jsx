import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, AlertCircle, RefreshCw, CheckCircle2, Dot } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { getAvatarUrl } from '../../utils/avatarUtils';
import VideoCard from '../../components/video/VideoCard';
import { VideoGridSkeleton } from '../../components/ui/Skeleton';
import './Subscriptions.css';

const Subscriptions = () => {
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [videos,        setVideos]        = useState([]);
  const [channels,      setChannels]      = useState([]);
  const [activeChannel, setActiveChannel] = useState(null); // null = All
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [totalDocs,     setTotalDocs]     = useState(0);
  const [showAllCh,     setShowAllCh]     = useState(false);

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/v1/videos/subscriptions-feed');
      const payload  = data?.data || {};
      setVideos(payload.docs      || []);
      setChannels(payload.channels || []);
      setTotalDocs(payload.totalDocs || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription feed.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const displayedVideos = activeChannel
    ? videos.filter(v => String(v.owner?._id) === activeChannel)
    : videos;

  const INITIAL_CH   = 8;
  const visibleCh    = showAllCh ? channels : channels.slice(0, INITIAL_CH);

  /* ── NOT LOGGED IN ── */
  if (!user) {
    return (
      <div className="subs-page">
        <div className="subs-empty">
          <div className="subs-empty-orb" />
          <div className="subs-empty-icon"><Bell size={28} /></div>
          <h2 className="subs-empty-title">Sign in to see subscriptions</h2>
          <p className="subs-empty-text">
            Your subscribed channels and their latest videos appear here once you're signed in.
          </p>
          <button className="subs-explore-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subs-page">

      {/* ── TOP HEADER ── */}
      <div className="subs-header">
        <div className="subs-header-left">
          <div className="subs-header-icon"><Bell size={19} /></div>
          <div>
            <h1 className="subs-title">Subscriptions</h1>
            <p className="subs-subtitle">
              {totalDocs > 0
                ? `${totalDocs} video${totalDocs !== 1 ? 's' : ''} from channels you follow`
                : 'Latest from channels you follow'}
            </p>
          </div>
        </div>
        <div className="subs-header-actions">
          <button className="subs-refresh-btn" onClick={fetchFeed} disabled={loading} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button className="subs-find-btn" onClick={() => navigate('/search')}>
            <Search size={14} />
            Find Channels
          </button>
        </div>
      </div>

      {/* ── BODY: sidebar + grid ── */}
      <div className="subs-body">

        {/* ══ LEFT: CHANNEL LIST ══ */}
        {channels.length > 0 && (
          <aside className="subs-sidebar">
            <div className="subs-sidebar-inner">

              {/* ALL button */}
              <button
                className={`subs-ch-row ${!activeChannel ? 'active' : ''}`}
                onClick={() => setActiveChannel(null)}
              >
                <div className="subs-ch-all-icon">
                  <Bell size={13} />
                </div>
                <span className="subs-ch-label">All</span>
                {!activeChannel && <span className="subs-ch-active-bar" />}
              </button>

              {/* Channel rows */}
              {visibleCh.map(({ _id, channel, hasNew }) => {
                if (!channel) return null;
                const avatar   = getAvatarUrl(channel, channel.fullname || channel.username || 'C');
                const isActive = activeChannel === String(channel._id);
                return (
                  <button
                    key={_id}
                    className={`subs-ch-row ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveChannel(isActive ? null : String(channel._id))}
                    title={channel.fullname || channel.username}
                  >
                    <div className="subs-ch-avatar-wrap">
                      <img src={avatar} alt="" className="subs-ch-avatar" />
                      {hasNew && <span className="subs-ch-dot" />}
                    </div>
                    <span className="subs-ch-label">
                      {channel.fullname || channel.username}
                    </span>
                    {isActive && <span className="subs-ch-active-bar" />}
                  </button>
                );
              })}

              {/* Show more / less */}
              {channels.length > INITIAL_CH && (
                <button
                  className="subs-ch-more-btn"
                  onClick={() => setShowAllCh(p => !p)}
                >
                  {showAllCh
                    ? '↑ Show less'
                    : `↓ Show ${channels.length - INITIAL_CH} more`}
                </button>
              )}

            </div>
          </aside>
        )}

        {/* ══ RIGHT: VIDEO GRID ══ */}
        <div className="subs-content">

          {loading ? (
            <VideoGridSkeleton count={6} />

          ) : error ? (
            <div className="subs-state-card">
              <AlertCircle size={26} style={{ color: '#F87171' }} />
              <h2 className="subs-state-title">Couldn't load feed</h2>
              <p className="subs-state-text">{error}</p>
              <button className="subs-explore-btn" onClick={fetchFeed}>Try Again</button>
            </div>

          ) : channels.length === 0 ? (
            <div className="subs-empty">
              <div className="subs-empty-orb" />
              <div className="subs-empty-icon"><Bell size={28} /></div>
              <h2 className="subs-empty-title">No subscriptions yet</h2>
              <p className="subs-empty-text">
                Subscribe to channels and their latest videos will appear here.
              </p>
              <button className="subs-explore-btn" onClick={() => navigate('/')}>
                Browse Channels
              </button>
            </div>

          ) : displayedVideos.length === 0 ? (
            <div className="subs-state-card">
              <CheckCircle2 size={26} style={{ color: '#818CF8' }} />
              <h2 className="subs-state-title">All caught up!</h2>
              <p className="subs-state-text">
                No videos from this channel yet.
              </p>
              <button className="subs-explore-btn" onClick={() => setActiveChannel(null)}>
                View All
              </button>
            </div>

          ) : (
            <>
              <div className="subs-section-label">
                <span className="subs-section-dot" />
                {activeChannel
                  ? channels.find(c => String(c.channel?._id) === activeChannel)?.channel?.fullname
                    || 'Channel Videos'
                  : 'Latest'}
              </div>
              <div className="subs-video-grid">
                {displayedVideos.map(video => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Subscriptions;