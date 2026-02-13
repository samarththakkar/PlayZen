
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/lib/api-services';
import VideoCard from '@/components/VideoCard';
import MainLayout from '@/components/MainLayout';
import { FilterChips } from '@/components/FilterChips';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { RefreshCcw } from 'lucide-react';

export default function Home() {
  const [searchParams] = useSearchParams();
  const { fetchCurrentUser } = useAuthStore();
  
  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      toast.success('Successfully logged in with Google!');
      fetchCurrentUser();
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, fetchCurrentUser]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.getAllVideos({ limit: 20 }),
  });

  const videos = data?.data?.docs || [];

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-[#0f0f0f]">
        {/* Filters */}
        <FilterChips />
        
        {/* Content */}
        <div className="p-4 sm:p-6 pb-20">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-8 gap-x-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <div className="flex gap-3">
                      <Skeleton className="w-9 h-9 flex-shrink-0" variant="circular" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-3 w-[60%]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-center">
                  <p className="text-white text-xl font-medium mb-2">Something went wrong</p>
                  <p className="text-gray-400 mb-6">We couldn't load the videos. Please try again.</p>
                  <Button onClick={() => refetch()} variant="primary" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Retry
                  </Button>
                </div>
              </div>
            ) : videos.length === 0 ? (
                <EmptyState
                  title="No videos found"
                  description="Be the first to upload a video!"
                />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-8 gap-x-4">
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
