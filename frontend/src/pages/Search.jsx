
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => videoService.getAllVideos({ query, limit: 20 }),
    enabled: !!query,
  });

  const videos = data?.data?.docs || [];

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {query && (
          <h1 className="text-xl font-semibold text-white mb-6">
            Search results for "{query}"
          </h1>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton variant="circular" className="w-9 h-9 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-3 w-[60%]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
             icon={SearchIcon}
             title="No videos found"
             description="Try searching for something else."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
