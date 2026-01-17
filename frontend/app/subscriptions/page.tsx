'use client';

import { useQuery } from '@tanstack/react-query';
import { subscriptionService, videoService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const { data: subscriptionsData } = useQuery({
    queryKey: ['subscribedChannels', user?._id],
    queryFn: () => subscriptionService.getSubscribedChannels(user?._id || ''),
    enabled: isAuthenticated && !!user?._id,
  });

  const { data: videosData } = useQuery({
    queryKey: ['subscriptionVideos'],
    queryFn: () => videoService.getAllVideos({ limit: 20 }),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const channels = subscriptionsData?.data || [];
  const videos = videosData?.data?.docs || [];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Subscriptions</h1>
        
        {channels.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Your Channels</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {channels.map((channel: any) => (
                <Link
                  key={channel._id}
                  href={`/channel/${channel.username}`}
                  className="flex flex-col items-center gap-2 min-w-[100px] hover:opacity-80 transition-opacity"
                >
                  {channel.avatar ? (
                    <Image
                      src={channel.avatar}
                      alt={channel.fullname}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-[#3ea6ff] rounded-full flex items-center justify-center text-white text-2xl font-medium">
                      {channel.fullname?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-sm text-white text-center truncate w-full">
                    {channel.fullname}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-white mb-4">Latest Videos</h2>
        {videos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-gray-400 mb-4">No videos available</p>
              <p className="text-sm text-gray-500">Subscribe to channels to see their videos here</p>
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
