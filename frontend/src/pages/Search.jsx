import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../components/video/VideoCard';
import Skeleton from '../components/ui/Skeleton';
import { getTrending } from '../services/search.service';
import { Search as SearchIcon, AlertCircle, Compass } from 'lucide-react';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      setSuggestedVideos([]);

      if (!query.trim()) {
        try {
          const { data } = await getTrending(10);
          setSuggestedVideos(data?.docs || data || []);
        } catch (err) {
          console.error("Failed to load trending:", err);
        }
        setVideos([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/v1/videos/get-all-videos?query=${encodeURIComponent(query)}`);
        const fetchedVideos = response.data?.data?.docs || response.data?.docs || [];
        setVideos(fetchedVideos);

        // If no videos were found for the query, fetch generic suggestions instead
        if (fetchedVideos.length === 0) {
            const suggestionResponse = await axios.get('/api/v1/videos/get-all-videos?limit=8');
            const placeholderVideos = suggestionResponse.data?.data?.docs || suggestionResponse.data?.docs || [];
            setSuggestedVideos(placeholderVideos);
        }

      } catch (err) {
        console.error("Failed to fetch search results", err);
        setError("Something went wrong while fetching results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="search-page-container">
      {/* Hide the top banner entirely if 0 results match, per user request */}
      {!loading && !error && videos.length > 0 && (
          <div className="search-header-banner">
            <h1 className="search-title">
              Results for <span className="highlight">"{query}"</span>
            </h1>
            <p className="search-count">{videos.length} videos found</p>
          </div>
      )}

      {/* States */}
      {loading ? (
        <div className="video-grid search-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="video-skeleton">
              <Skeleton type="image" className="skeleton-thumb" />
              <div className="skeleton-info">
                <Skeleton type="avatar" className="skeleton-avatar-small" />
                <div className="skeleton-text-container">
                  <Skeleton type="title" />
                  <Skeleton type="text" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="search-empty-state">
           <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
           <h2>Oops!</h2>
           <p className="empty-state-p">{error}</p>
        </div>
      ) : videos.length === 0 ? (
        // The revamped "Empty State" showcasing Suggestions rather than "0 results found"
        <div className="search-suggestions-container">
           <div className="suggestions-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Compass size={28} color="var(--accent-color)" />
              <h2 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  {query.trim() ? "Suggested Videos for you" : "Trending Videos"}
              </h2>
           </div>
           
           <div className="video-grid search-grid">
             {suggestedVideos.map((video) => (
               <VideoCard key={video._id || video.id} video={video} />
             ))}
           </div>
        </div>
      ) : (
        <div className="video-grid search-grid">
          {videos.map((video) => (
            <VideoCard key={video._id || video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
