import React, { useState, useEffect } from 'react';
import { Play, Info, Flame, Music, Video, Laptop, GraduationCap, Radio, Mic } from 'lucide-react';
import VideoCard from '../components/video/VideoCard';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';
import { getPersonalizedFeed, getContinueWatching } from '../services/video.service';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState([]);
  const { user } = useAuth();
  const [dynamicCategories, setDynamicCategories] = useState([
    { name: "All", icon: <Flame size={16} /> }
  ]);

  const getIconForCategory = (name) => {
    const icons = {
      "Music": <Music size={16} />,
      "Vlogs": <Video size={16} />,
      "Technology": <Laptop size={16} />,
      "Education": <GraduationCap size={16} />,
      "News": <Radio size={16} />,
      "Podcasts": <Mic size={16} />,
    };
    return icons[name] || <Play size={16} />;
  };

  const fetchVideos = async (category = "All") => {
    setLoading(true);
    try {
      let fetchedVideos = [];
      if (category === "All" && user) {
        const { data, error } = await getPersonalizedFeed();
        if (!error && data) {
          fetchedVideos = data.docs || data || [];
        }
      }
      
      // Fallback to public feed if personalized feed returned nothing (e.g. 401 or empty)
      if (fetchedVideos.length === 0) {
        const url = category === "All" 
          ? '/videos/get-all-videos' 
          : `/videos/get-all-videos?category=${encodeURIComponent(category)}`;
        
        const response = await api.get(url);
        if (response.data.success) {
          fetchedVideos = response.data.data.docs || [];
        }
      }
      
      setVideos(fetchedVideos);

      // Derive categories from the "All" feed to populate the filter bar
      if (category === "All") {
        const uniqueCats = [...new Set(fetchedVideos.map(v => v.category))].filter(Boolean);
          const newCats = [
            { name: "All", icon: <Flame size={16} /> },
            ...uniqueCats.map(name => ({
              name,
              icon: getIconForCategory(name)
            }))
          ];
          setDynamicCategories(newCats);
        }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(activeCategory);
  }, [activeCategory, user]);

  useEffect(() => {
    if (user) {
      const fetchContinue = async () => {
        const { data } = await getContinueWatching();
        if (data) {
          setContinueWatching(data.docs || data || []);
        }
      };
      fetchContinue();
    } else {
      setContinueWatching([]);
    }
  }, [user]);

  return (
    <div className="home-container">

      {/* Main Feed Container: Wraps both categories and content to ensure solid dark background on scroll */}
      <div className="home-feed-container">
        {/* 2. Categories Scroller */}
        <div className="categories-section">
          <div className="categories-scroll-container">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton 
                  key={`cat-skel-${i}`} 
                  type="text" 
                  style={{ minWidth: '100px', height: '36px', borderRadius: '30px', margin: 0, flexShrink: 0 }} 
                />
              ))
            ) : (
              dynamicCategories.map((cat, idx) => (
                <button 
                  key={idx} 
                  className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 3. Continue Watching & Featured Content Grid */}
        <div className="content-section">
          {continueWatching.length > 0 && activeCategory === "All" && (
            <div className="continue-watching-section mb-6">
              <h2 className="text-xl font-bold mb-4" style={{display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '1rem'}}>
                <Play size={20} fill="currentColor" /> Continue Watching
              </h2>
              <div className="continue-watching-scroll" style={{display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem', paddingLeft: '1rem'}}>
                {continueWatching.map(video => (
                  <div key={video._id} style={{minWidth: '280px', flex: '0 0 auto'}}>
                    <VideoCard video={video.video || video} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid-container">
            {loading ? (
              [...Array(12)].map((_, i) => (
                <div key={i} className="card video-skeleton" style={{ padding: 0 }}>
                  <Skeleton type="image" className="skeleton-thumb" style={{ borderRadius: '12px 12px 0 0' }} />
                  <div className="card-info" style={{ display: 'flex', gap: '0.75rem', padding: '1rem' }}>
                    <Skeleton type="avatar" className="skeleton-avatar-small" />
                    <div className="skeleton-text-container" style={{ flex: 1, paddingTop: '0' }}>
                      <Skeleton type="title" style={{ width: '90%', height: '1.2rem', margin: '0 0 0.5rem 0' }} />
                      <Skeleton type="text" style={{ width: '60%', height: '0.9rem', margin: 0 }} />
                    </div>
                  </div>
                </div>
              ))
            ) : videos.length > 0 ? (
              videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>No videos uploaded yet. Be the first!</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Mobile Bottom Nav removed from here. It is now handled globally by MainLayout.jsx */}
      
    </div>
  );
};

export default Home;
