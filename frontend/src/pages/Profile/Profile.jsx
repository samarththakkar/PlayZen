import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useNavigationType, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api'; // Or axios directly depending on your setup
import VideoCard from '../../components/video/VideoCard';
import Skeleton from '../../components/ui/Skeleton';
import { getAvatarUrl } from '../../utils/avatarUtils';
import useSubscription from '../../hooks/useSubscription';
import './Profile.css';

const Profile = () => {
  const { username } = useParams(); // If viewing someone else /channel/:username
  const { user } = useAuth(); // Current logged-in user
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('Videos');
  const [profileData, setProfileData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState(null);

  const navigationType = useNavigationType();

  // Reset or restore active tab based on navigation type
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    } else if (navigationType === 'PUSH') {
      sessionStorage.removeItem('profile_scroll_y');
      sessionStorage.removeItem('profile_active_tab');
    } else if (navigationType === 'POP') {
      const savedTab = sessionStorage.getItem('profile_active_tab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, [navigationType, location]);

  // Save active tab on change
  useEffect(() => {
    sessionStorage.setItem('profile_active_tab', activeTab);
  }, [activeTab]);

  // Save scroll Y position on scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('profile_scroll_y', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Restore scroll position when loading is done
  useEffect(() => {
    if (!loading && navigationType === 'POP') {
      const savedScrollY = sessionStorage.getItem('profile_scroll_y');
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollY, 10));
        }, 100);
      }
    }
  }, [loading, navigationType]);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !username || (user && user.username === username);

  useEffect(() => {
    const fetchProfileAndVideos = async () => {
      setLoading(true);
      try {
        // Fetch channel profile data from backend
        const searchUsername = username || user?.username;
        if (!searchUsername) {
          throw new Error("No username found to fetch profile");
        }

        const channelResponse = await api.get(`/users/channel/${searchUsername}`);
        if (channelResponse.data.success) {
          setProfileData(channelResponse.data.data);
        }

        // Fetch videos for this specific user.
        const targetUsername = searchUsername;
        if (targetUsername) {
          const response = await api.get(`/videos/user-videos/${targetUsername}`);
          if (response.data.success) {
            // The user-videos endpoint usually returns the array directly or inside data.docs
            const userVids = response.data.data.docs || response.data.data || [];
            setVideos(userVids);
          }
        }
      } catch (error) {
        console.error("Error fetching profile details", error);
        setProfileData({
           fullname: "Error Loading Profile",
           username: "error",
           subscribersCount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndVideos();
  }, [username, user, isOwnProfile]);

  // Fetch user playlists when tab is Playlists
  useEffect(() => {
    if (activeTab !== 'Playlists' || !profileData?._id) return;
    
    let isMounted = true;
    setPlaylistsLoading(true);
    setPlaylistsError(null);
    
    api.get(`/playlists/user-playlists/${profileData._id}`)
      .then(res => {
        if (isMounted) {
          setPlaylists(res.data?.data || []);
          setPlaylistsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          if (err.response?.status === 404) {
            setPlaylists([]);
          } else {
            console.error("Failed to load user playlists:", err);
            setPlaylistsError("Failed to load playlists");
          }
          setPlaylistsLoading(false);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [activeTab, profileData?._id]);

  const { isSubscribed: isChannelSubscribed, subscribersCount: subCountHook, toggle: toggleSubscribe } = useSubscription(profileData?._id || profileData?.username);

  const handleSubscribe = () => {
    toggleSubscribe();
  };

  const currentSubscribersCount = subCountHook || profileData?.subscribersCount || 0;
  const isCurrentlySubscribed = isChannelSubscribed || profileData?.isSubscribed;

  const avatarSrc = getAvatarUrl(profileData, profileData?.fullname || "Unknown User");

  return (
    <div className="profile-container">
      
      {/* Cover Section */}
      <section className="profile-cover-section">
        {loading ? (
            <Skeleton type="image" style={{ width: '100%', height: '100%', margin: 0 }} />
        ) : profileData?.coverImage ? (
            <img src={profileData.coverImage} alt="Cover" className="profile-cover-img" />
        ) : (
            <div className="profile-cover-placeholder"></div>
        )}
      </section>

      {/* Header Info Section */}
      <section className="profile-header-info">
        <div className="profile-avatar-wrapper">
            {loading ? (
                <Skeleton type="avatar" style={{ width: '100%', height: '100%', margin: 0 }} />
            ) : (
                <img src={avatarSrc} alt="Avatar" className="profile-avatar-img" />
            )}
        </div>

        <div className="profile-details">
            {loading ? (
                <>
                    <Skeleton type="title" style={{ width: '250px', height: '2rem', marginBottom: '0.5rem' }} />
                    <Skeleton type="text" style={{ width: '150px', height: '1rem', marginBottom: '1rem' }} />
                    <Skeleton type="button" style={{ width: '120px', height: '36px', borderRadius: '30px', marginTop: '1rem' }} />
                </>
            ) : (
                <>
                    <h1 className="profile-name">{profileData?.fullname}</h1>
                    <div className="profile-meta">
                        <span className="profile-handle">@{profileData?.username}</span>
                        <div className="profile-stats">
                            <span><strong>{currentSubscribersCount}</strong> subscribers</span>
                            <span><strong>{videos.length || 0}</strong> videos</span>
                        </div>
                    </div>
                    <div className="profile-actions-wrapper">
                        {isOwnProfile ? (
                            <button className="profile-btn profile-btn-edit" onClick={() => navigate('/settings')}>
                                Edit Profile
                            </button>
                        ) : (
                            <button 
                                className={`profile-btn ${isCurrentlySubscribed ? 'profile-btn-edit' : 'profile-btn-subscribe'}`}
                                onClick={handleSubscribe}
                            >
                                {isCurrentlySubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
      </section>

      {/* Tabs */}
      <section className="profile-tabs-wrapper">
          <div className="profile-tabs">
              {['Videos', 'Playlists', 'About'].map((tab) => (
                  <div 
                      key={tab}
                      className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                  >
                      {tab}
                  </div>
              ))}
          </div>
      </section>

      {/* Content Area */}
      <section className="profile-content-area">
          {activeTab === 'Videos' && (
              <div className="profile-grid-container">
                  {loading ? (
                       [...Array(6)].map((_, i) => (
                        <div key={i} className="card video-skeleton" style={{ padding: 0 }}>
                          <Skeleton type="image" className="skeleton-thumb" style={{ borderRadius: '12px 12px 0 0' }} />
                          <div className="card-info" style={{ display: 'flex', gap: '0.75rem', padding: '1rem' }}>
                            <Skeleton type="avatar" className="skeleton-avatar-small" />
                            <div className="skeleton-text-container" style={{ flex: 1, paddingTop: '0' }}>
                              <Skeleton type="title" style={{ width: '90%', height: '1.2rem', marginBottom: '0.5rem' }} />
                              <Skeleton type="text" style={{ width: '60%', height: '0.9rem', marginBottom: 0 }} />
                            </div>
                          </div>
                        </div>
                      ))
                  ) : videos.length > 0 ? (
                      videos.map((video) => (
                          <VideoCard key={video._id} video={video} />
                      ))
                  ) : (
                      <div className="profile-empty-state">
                          <h3>No videos found</h3>
                          <p>This channel hasn't uploaded any videos yet.</p>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'Playlists' && (
              playlistsLoading ? (
                  <div className="profile-playlists-loading">Loading playlists...</div>
              ) : playlistsError ? (
                  <div className="profile-empty-state">
                      <h3>Error loading playlists</h3>
                      <p>{playlistsError}</p>
                  </div>
              ) : playlists.length > 0 ? (
                  <div className="profile-playlists-grid">
                      {playlists.map((playlist) => {
                          const videoCount = (playlist.videos || []).length;
                          const thumbnailSrc = playlist.thumbnail || 
                                               (playlist.videos && playlist.videos[0]?.thumbnail) || 
                                               "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
                            return (
                              <div 
                                  key={playlist._id} 
                                  className="playlist-grid-card"
                                  onClick={() => navigate(`/playlist/${playlist._id}`)}
                              >
                                  <div className="playlist-card-thumbnail-container">
                                      <div className="playlist-card-stack-back"></div>
                                      <div className="playlist-card-stack-mid"></div>
                                      <div className="playlist-card-thumbnail-wrapper">
                                          <img 
                                              src={thumbnailSrc} 
                                              alt={playlist.title} 
                                              className="playlist-card-thumbnail" 
                                          />
                                          <div className="playlist-card-overlay">
                                              <span className="playlist-video-count">{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <h3 className="playlist-card-title">{playlist.title}</h3>
                                  <p className="playlist-card-desc">{playlist.description}</p>
                              </div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="profile-empty-state">
                      <h3>No Playlists</h3>
                      <p>{isOwnProfile ? "You haven't created any playlists yet." : "This channel hasn't created any playlists yet."}</p>
                  </div>
              )
          )}

          {activeTab === 'About' && (
              <div className="profile-empty-state" style={{ textAlign: 'left', padding: '2rem' }}>
                  <h3>About {profileData?.fullname}</h3>
                  <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                      Welcome to my channel! Here you will find all the videos I've uploaded to PlayHub. 
                      Stay tuned for more amazing content.
                  </p>
                  <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Joined March 2026</p>
              </div>
          )}
      </section>
    </div>
  );
};

export default Profile;
