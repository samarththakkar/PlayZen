
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/lib/api-services';
import { useAuthStore } from '@/store/auth-store';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';
import { Link } from 'react-router-dom';
import { Upload, Video } from 'lucide-react';
import StudioStats from '@/components/StudioStats';
import EmptyState from '@/components/common/EmptyState';

export default function Studio() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['studioVideos', user?.username],
    queryFn: () => videoService.getStudioVideos(),
    enabled: !!user?.username,
  });

  const videos = data?.data?.docs || [];

  const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
  const totalLikes = videos.reduce((acc, video) => acc + (video.likesCount || 0), 0);

  return (
    <MainLayout>
      <div className="bg-[#0f0f0f] min-h-screen px-6 pt-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Your Videos</h1>
          <Link 
            to="/upload" 
            className="flex items-center gap-2 bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload</span>
          </Link>
        </div>

        <StudioStats 
           videos={videos} 
           totalViews={totalViews} 
           totalLikes={totalLikes} 
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No videos uploaded yet"
            description="Upload your first video to start your journey as a creator."
            action={
              <Link 
                to="/upload" 
                className="inline-flex items-center gap-2 bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 text-black px-6 py-2.5 rounded-full font-medium transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Video</span>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
