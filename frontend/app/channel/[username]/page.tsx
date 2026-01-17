'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { videoService, subscriptionService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { Bell, Settings, PlaySquare, Clock, ThumbsUp, User, Home, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'Home' | 'Videos' | 'Shorts' | 'Playlists' | 'About';

export default function ChannelPage() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('Videos');

  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ['userVideos', username],
    queryFn: () => videoService.getUserVideos(username as string),
    enabled: !!username,
  });

  const { data: subscribersData } = useQuery({
    queryKey: ['subscribers', username],
    queryFn: () => {
      // We'll need to get channel owner first, then fetch subscribers
      return Promise.resolve({ data: { docs: [], totalDocs: 0 } });
    },
    enabled: false, // Disabled for now until we have the endpoint
  });

  const videos = videosData?.data || [];
  const channelOwner = videos[0]?.owner && typeof videos[0].owner === 'object' ? videos[0].owner : null;
  const isOwnChannel = channelOwner?._id === user?._id;

  // Calculate total views
  const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0);

  // Check subscription status
  const { data: subscribedChannelsData } = useQuery({
    queryKey: ['subscribedChannels', user?._id],
    queryFn: () => subscriptionService.getSubscribedChannels(user?._id || ''),
    enabled: isAuthenticated && !!user?._id && !!channelOwner,
    select: (data) => {
      const channels = data?.data || [];
      return channels.some((ch: any) => ch._id === channelOwner?._id);
    },
  });

  const isCurrentlySubscribed = subscribedChannelsData || false;

  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionService.toggleSubscription(channelOwner?._id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribedChannels', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['userVideos', username] });
      toast.success(isCurrentlySubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update subscription');
    },
  });

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }
    subscribeMutation.mutate();
  };

  const tabs: TabType[] = ['Home', 'Videos', 'Shorts', 'Playlists', 'About'];

  if (videosLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-yt-black">
          {/* Banner Skeleton */}
          <div className="h-[120px] md:h-[200px] bg-yt-gray animate-pulse" />
          
          {/* Channel Info Skeleton */}
          <div className="px-6 py-4 bg-yt-black">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-20 h-20 md:w-40 md:h-40 rounded-full bg-yt-gray -mt-10 md:-mt-16 border-4 border-yt-black animate-pulse" />
              <div className="flex-1 mt-2 md:mt-0 space-y-3">
                <div className="h-8 md:h-10 w-48 md:w-64 bg-yt-gray rounded animate-pulse" />
                <div className="h-4 w-64 md:w-80 bg-yt-gray rounded animate-pulse" />
                <div className="h-4 w-48 bg-yt-gray rounded animate-pulse" />
                <div className="h-10 w-32 bg-yt-gray rounded animate-pulse mt-4" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="border-b border-yt-border bg-yt-black px-6">
            <div className="flex gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-16 bg-yt-gray rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Videos Grid Skeleton */}
          <div className="px-6 pb-8 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-video bg-yt-gray rounded-xl mb-3" />
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-yt-gray rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-yt-gray rounded mb-2" />
                      <div className="h-3 bg-yt-gray rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (videosError || !channelOwner) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-yt-text-secondary mb-4 text-lg">Channel not found</p>
            <p className="text-yt-text-muted text-sm mb-6">The channel you're looking for doesn't exist or is private.</p>
            <a href="/" className="px-4 py-2 bg-yt-blue hover:bg-yt-blue-dark rounded-full font-medium transition-colors inline-block">
              Go Home
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-yt-black">
        {/* Channel Banner */}
        <div className="relative h-[120px] md:h-[200px] bg-gradient-to-r from-yt-gray via-yt-dark to-yt-gray overflow-hidden">
          {channelOwner.coverImage ? (
            <Image
              src={channelOwner.coverImage}
              alt="Channel banner"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yt-gray via-yt-dark to-yt-gray" />
          )}
        </div>

        {/* Channel Info Section */}
        <div className="px-6 py-4 bg-yt-black">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-40 md:h-40 rounded-full overflow-hidden bg-yt-dark flex-shrink-0 -mt-10 md:-mt-16 border-4 border-yt-black relative z-10">
              {channelOwner.avatar ? (
                <Image
                  src={channelOwner.avatar}
                  alt={channelOwner.fullname}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-yt-blue flex items-center justify-center text-yt-white text-4xl md:text-6xl font-medium">
                  {channelOwner.fullname?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1 min-w-0 mt-2 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-4xl font-bold text-yt-white mb-1">
                    {channelOwner.fullname || 'Unknown Channel'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-yt-text-secondary">
                    <span>@{channelOwner.username || 'unknown'}</span>
                    <span>•</span>
                    <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
                    {totalViews > 0 && (
                      <>
                        <span>•</span>
                        <span>{totalViews.toLocaleString()} views</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-yt-text-secondary mt-2 line-clamp-1">
                    Welcome to {channelOwner.fullname}'s channel! Subscribe to stay updated with the latest videos.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 mt-4 md:mt-0">
                  {isOwnChannel ? (
                    <Link
                      href="/studio"
                      className="px-4 py-2 bg-yt-gray hover:bg-yt-gray-hover rounded-full text-sm font-medium transition-colors flex items-center gap-2 text-yt-white"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Customize Channel</span>
                    </Link>
                  ) : (
                    <>
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={handleSubscribe}
                            disabled={subscribeMutation.isPending}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                              isCurrentlySubscribed
                                ? "bg-yt-gray text-yt-white hover:bg-yt-gray-hover"
                                : "bg-yt-white text-yt-black hover:bg-gray-200",
                              subscribeMutation.isPending && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {subscribeMutation.isPending ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                {isCurrentlySubscribed ? 'Subscribed' : 'Subscribe'}
                              </>
                            )}
                          </button>
                          {isCurrentlySubscribed && (
                            <button className="p-2 bg-yt-gray hover:bg-yt-gray-hover rounded-full transition-colors">
                              <Bell className="w-5 h-5 text-yt-white" />
                            </button>
                          )}
                        </>
                      ) : (
                        <Link
                          href="/login"
                          className="px-4 py-2 bg-yt-white text-yt-black hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                        >
                          Subscribe
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="border-b border-yt-border bg-yt-black sticky top-14 z-30">
          <div className="px-6">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative",
                    activeTab === tab
                      ? "text-yt-white border-yt-white"
                      : "text-yt-text-secondary border-transparent hover:text-yt-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 pb-8">
          {activeTab === 'Home' && (
            <div className="mt-4">
              {/* Featured Video */}
              {videos.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-yt-white mb-4">Latest Video</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-8">
                    <div className="lg:col-span-2">
                      <VideoCard video={videos[0]} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                      {videos.slice(1, 4).map((video: any) => (
                        <VideoCard key={video._id} video={video} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All Videos */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-yt-white mb-4">Videos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video: any) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Videos' && (
            <div className="mt-4">
              {videos.length === 0 ? (
                <div className="text-center py-16">
                  <PlaySquare className="w-16 h-16 text-yt-text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-yt-text-secondary text-lg mb-2 font-medium">No videos yet</p>
                  <p className="text-yt-text-muted text-sm">
                    {isOwnChannel ? 'Upload your first video to get started!' : 'This channel hasn\'t uploaded any videos.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {videos.map((video: any) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Shorts' && (
            <div className="mt-4">
              <div className="text-center py-16">
                <PlaySquare className="w-16 h-16 text-yt-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-yt-text-secondary text-lg mb-2 font-medium">No Shorts yet</p>
                <p className="text-yt-text-muted text-sm">This channel hasn't uploaded any Shorts.</p>
              </div>
            </div>
          )}

          {activeTab === 'Playlists' && (
            <div className="mt-4">
              <div className="text-center py-16">
                <PlaySquare className="w-16 h-16 text-yt-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-yt-text-secondary text-lg mb-2 font-medium">No playlists yet</p>
                <p className="text-yt-text-muted text-sm">This channel hasn't created any playlists.</p>
              </div>
            </div>
          )}

          {activeTab === 'About' && (
            <div className="mt-4 max-w-3xl">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-yt-white mb-3">Description</h3>
                  <p className="text-yt-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                    Welcome to {channelOwner.fullname}'s channel! Subscribe to stay updated with the latest content.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-yt-text-secondary mb-4 uppercase tracking-wide">Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-yt-border">
                        <span className="text-yt-text-secondary text-sm">Joined</span>
                        <span className="text-yt-white text-sm font-medium">Recently</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-yt-border">
                        <span className="text-yt-text-secondary text-sm">Total views</span>
                        <span className="text-yt-white text-sm font-medium">{totalViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-yt-border">
                        <span className="text-yt-text-secondary text-sm">Videos</span>
                        <span className="text-yt-white text-sm font-medium">{videos.length}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-yt-text-secondary mb-4 uppercase tracking-wide">Links</h3>
                    <p className="text-yt-text-muted text-sm">No links available</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
