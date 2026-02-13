
import { useQuery } from '@tanstack/react-query';
import { playlistService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import { useAuthStore } from '@/store/auth-store';
import PlaylistCard from '@/components/PlaylistCard';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { ListVideo } from 'lucide-react';
import Button from '@/components/common/Button';
import { Link } from 'react-router-dom';

export default function Playlists() {
  const { user, isAuthenticated } = useAuthStore();

  const { data: playlistsData, isLoading } = useQuery({
    queryKey: ['userPlaylists', user?._id],
    queryFn: () => playlistService.getUserPlaylists(user?._id),
    enabled: isAuthenticated && !!user?._id,
  });

  const playlists = playlistsData?.data || [];

  if (!isAuthenticated) {
     return (
        <MainLayout>
           <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
              <ListVideo className="w-16 h-16 text-gray-600 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Keep your playlists here</h2>
              <p className="text-gray-400 mb-6 max-w-sm">
                 Playlists are a great way to save videos you want to watch again. Sign in to see your playlists.
              </p>
              <Link to="/login">
                 <Button variant="primary" className="rounded-full px-6">Sign in</Button>
              </Link>
           </div>
        </MainLayout>
     )
  }

  return (
    <MainLayout>
      <div className="p-6 bg-[#0f0f0f] min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6">Playlists</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-3 w-[40%]" />
                </div>
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <EmptyState
            icon={ListVideo}
            title="No playlists yet"
            description="Create playlists to organize your favorite videos."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
