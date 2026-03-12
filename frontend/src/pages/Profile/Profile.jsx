import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api'; // Or axios directly depending on your setup
import VideoCard from '../../components/video/VideoCard';
import Skeleton from '../../components/ui/Skeleton';
import { getAvatarUrl } from '../../utils/avatarUtils';
import './Profile.css';

const Profile = () => {
  const { username } = useParams(); // If viewing someone else /channel/:username
  const { user } = useAuth(); // Current logged-in user
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Videos');
  const [profileData, setProfileData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !username || (user && user.username === username);

  useEffect(() => {
    const fetchProfileAndVideos = async () => {
      setLoading(true);
      try {
        // Mocking the profile data logic for now
        // In a real scenario, we would hit /api/v1/users/channel/:username
        // Or if own profile, we just use the user object directly.
        
        let targetUser = null;
        if (isOwnProfile && user) {
          targetUser = {
            fullname: user.fullname || "My Profile",
            username: user.username || "me",
            avatar: user.avatar || "",
            coverImage: user.coverImage || "",
            subscribersCount: user.subscribersCount || 0,
            isSubscribed: false
          };
        } else {
          // Attempt to fetch public channel info
          // Fallback dummy for now to prevent breaking React
          targetUser = {
            fullname: username || "User Profile",
            username: username || "user",
            avatar: "",
            coverImage: "",
            subscribersCount: 120,
            isSubscribed: false
          };
        }
        setProfileData(targetUser);

        // Fetch videos for this specific user.
        const targetUsername = targetUser.username;
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

  const handleSubscribe = () => {
    // API logic to subscribe/unsubscribe goes here
    if (profileData) {
      setProfileData({ ...profileData, isSubscribed: !profileData.isSubscribed });
    }
  };

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
                </>
            ) : (
                <>
                    <h1 className="profile-name">{profileData?.fullname}</h1>
                    <div className="profile-meta">
                        <span className="profile-handle">@{profileData?.username}</span>
                        <div className="profile-stats">
                            <span><strong>{profileData?.subscribersCount || 0}</strong> subscribers</span>
                            <span><strong>{videos.length || 0}</strong> videos</span>
                        </div>
                    </div>
                </>
            )}
        </div>

        <div className="profile-actions">
            {!loading && (
                isOwnProfile ? (
                    <button className="profile-btn profile-btn-edit">
                        Edit Profile
                    </button>
                ) : (
                    <button 
                        className={`profile-btn ${profileData?.isSubscribed ? 'profile-btn-edit' : 'profile-btn-subscribe'}`}
                        onClick={handleSubscribe}
                    >
                        {profileData?.isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                )
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
              <div className="profile-empty-state">
                  <h3>No Playlists</h3>
                  <p>Playlists functionality coming soon.</p>
              </div>
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
