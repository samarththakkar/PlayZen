'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';

export default function SearchPage() {
  const searchParams = useSearchParams();
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
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-video bg-[#272727] rounded-lg mb-2"></div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-[#272727] rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[#272727] rounded mb-2"></div>
                    <div className="h-3 bg-[#272727] rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-gray-400 mb-4">No videos found</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video: any) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
