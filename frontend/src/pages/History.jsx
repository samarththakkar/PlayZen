
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { History as HistoryIcon } from 'lucide-react';

export default function History() {
  const { data, isLoading } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: () => authService.getWatchHistory(),
  });

  const videos = data?.data || [];

  return (
    <MainLayout>
      <div className="bg-[#0f0f0f] min-h-screen px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-6">Watch History</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                 <Skeleton height="200px" width="100%" variant="rectangular" />
                 <div className="flex gap-2">
                    <Skeleton height="36px" width="36px" variant="circular" />
                    <div className="flex-1 space-y-2">
                       <Skeleton height="20px" width="80%" />
                       <Skeleton height="16px" width="60%" />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No watch history"
            description="Videos you watch will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
