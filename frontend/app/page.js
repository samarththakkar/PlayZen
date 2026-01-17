'use client';

import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/lib/api-services';
import VideoCard from '@/components/VideoCard';
import MainLayout from '@/components/MainLayout';
import { FilterChips } from '@/components/FilterChips';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import './home.css';

export default function Home() {
  const searchParams = useSearchParams();
  const { fetchCurrentUser } = useAuthStore();
  
  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      toast.success('Successfully logged in with Google!');
      fetchCurrentUser();
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, fetchCurrentUser]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.getAllVideos({ limit: 20 }),
  });

  const videos = data?.data?.docs || [];

  return (
    <MainLayout>
      <div className="home-container">
        <div className="filter-chips-container">
          <FilterChips />
        </div>
        <div className="home-content">
          {isLoading ? (
            <div className="loading-skeleton">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-thumbnail"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-subtitle"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-content">
                <p className="error-message">Error loading videos</p>
                <button
                  onClick={() => window.location.reload()}
                  className="retry-button"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="empty-container">
              <div className="empty-content">
                <p className="empty-title">No videos available</p>
                <p className="empty-subtitle">Upload your first video to get started!</p>
              </div>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}