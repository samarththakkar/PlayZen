
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';

export default function Shorts() {
  const { data, isLoading } = useQuery({
    queryKey: ['shorts'],
    queryFn: () => videoService.getAllShorts({ limit: 20 }),
  });

  const shorts = data?.data?.docs || [];

  return (
    <MainLayout>
      <div className="bg-[#0f0f0f] min-h-screen px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-6">Shorts</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : shorts.length === 0 ? (
          <div className="text-center p-8 bg-gray-800/30 rounded-xl">
            <p className="text-white text-xl mb-2">No shorts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {shorts.map((short) => (
              <VideoCard key={short._id} video={short} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
