
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { videoService, subscriptionService, channelService, tweetService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import VideoCard from '@/components/VideoCard';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import { Bell, Settings, PlaySquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import TweetCard from '@/components/TweetCard';
import CreateTweet from '@/components/CreateTweet';
import EmptyState from '@/components/common/EmptyState';
import Skeleton from '@/components/common/Skeleton';

export default function Channel() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Videos');

  const { data: channelProfileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['channelProfile', username],
    queryFn: () => channelService.getChannelProfile(username),
    enabled: !!username,
  });

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['userVideos', username],
    queryFn: () => videoService.getUserVideos(username),
    enabled: !!username,
  });

  const channelOwner = channelProfileData?.data;
  const videos = videosData?.data?.docs || [];
  const isOwnChannel = user?._id === channelOwner?._id;

  // Calculate total views
  const totalViews = Array.isArray(videos) ? videos.reduce((sum, video) => sum + (video.views || 0), 0) : 0;

  // Check subscription status
  const { data: subscribedChannelsData } = useQuery({
    queryKey: ['subscribedChannels', user?._id],
    queryFn: () => subscriptionService.getSubscribedChannels(user?._id || ''),
    enabled: isAuthenticated && !!user?._id && !!channelOwner,
    select: (data) => {
      const channels = data?.data || [];
      return channels.some((ch) => ch._id === channelOwner?._id);
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
    onError: (error) => {
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

  const tabs = ['Home', 'Videos', 'Shorts', 'Playlists', 'Community', 'About'];

  if (profileLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0f0f0f]">
          {/* Banner Skeleton */}
          <Skeleton className="h-[120px] md:h-[200px] w-full" />
          
          {/* Channel Info Skeleton */}
          <div className="px-6 py-4 bg-[#0f0f0f]">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Skeleton variant="circular" className="w-20 h-20 md:w-40 md:h-40 -mt-10 md:-mt-16 border-4 border-[#0f0f0f]" />
              <div className="flex-1 mt-2 md:mt-0 space-y-3">
                <Skeleton className="h-8 md:h-10 w-48 md:w-64" />
                <Skeleton className="h-4 w-64 md:w-80" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-32 mt-4 rounded-full" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="border-b border-gray-700 bg-[#0f0f0f] px-6 mt-4">
            <div className="flex gap-8">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>

          {/* Videos Grid Skeleton */}
          <div className="px-6 pb-8 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
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
          </div>
        </div>
      </MainLayout>
    );
  }

  if (profileError || !channelOwner) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-400 mb-4 text-lg">Channel not found</p>
            <p className="text-gray-500 text-sm mb-6">The channel you're looking for doesn't exist.</p>
            <Link to="/" className="px-4 py-2 bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 rounded-full font-medium transition-colors inline-block text-black">
              Go Home
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0f0f0f]">
        {/* Channel Banner */}
        <div className="relative h-[120px] md:h-[200px] overflow-hidden" style={{ background: 'linear-gradient(to right, #272727, #181818, #272727)' }}>
          {channelOwner.coverImage && (
            <img
              src={channelOwner.coverImage}
              alt="Channel banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Channel Info Section */}
        <div className="px-6 py-4 bg-[#0f0f0f]">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-40 md:h-40 rounded-full overflow-hidden bg-[#181818] flex-shrink-0 -mt-10 md:-mt-16 border-4 border-[#0f0f0f] relative z-10">
              {channelOwner.avatar ? (
                <img
                  src={channelOwner.avatar}
                  alt={channelOwner.fullname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#3ea6ff] flex items-center justify-center text-white text-4xl md:text-6xl font-medium">
                  {channelOwner.fullname?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1 min-w-0 mt-2 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">
                    {channelOwner.fullname || 'Unknown Channel'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
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
                  <p className="text-sm text-gray-400 mt-2 line-clamp-1">
                    Welcome to {channelOwner.fullname}'s channel! Subscribe to stay updated with the latest videos.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 mt-4 md:mt-0">
                  {isOwnChannel ? (
                    <Link
                      to="/studio"
                      className="px-4 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm font-medium transition-colors flex items-center gap-2 text-white"
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
                                ? "bg-[#272727] text-white hover:bg-[#3f3f3f]"
                                : "bg-white text-black hover:bg-gray-200",
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
                            <button className="p-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full transition-colors">
                              <Bell className="w-5 h-5 text-white" />
                            </button>
                          )}
                        </>
                      ) : (
                        <Link
                          to="/login"
                          className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
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
        <div className="border-b border-gray-700 bg-[#0f0f0f] sticky top-14 z-30">
          <div className="px-6">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative",
                    activeTab === tab
                      ? "text-white border-white"
                      : "text-gray-400 border-transparent hover:text-white"
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
                  <h2 className="text-lg font-semibold text-white mb-4">Latest Video</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-8">
                    <div className="lg:col-span-2">
                      <VideoCard video={videos[0]} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                      {videos.slice(1, 4).map((video) => (
                        <VideoCard key={video._id} video={video} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All Videos */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Videos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video) => (
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
                <EmptyState
                  icon={PlaySquare}
                  title="No videos yet"
                  description={isOwnChannel ? 'Upload your first video to get started!' : 'This channel hasn\'t uploaded any videos.'}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Shorts' && (
            <div className="mt-4">
              <EmptyState
                icon={PlaySquare}
                title="No Shorts yet"
                description="This channel hasn't uploaded any Shorts."
              />
            </div>
          )}

          {activeTab === 'Playlists' && (
            <div className="mt-4">
              <EmptyState
                icon={PlaySquare}
                title="No playlists yet"
                description="This channel hasn't created any playlists."
              />
            </div>
          )}

          {activeTab === 'Community' && (
            <div className="mt-4 max-w-3xl mx-auto">
               {isOwnChannel && <CreateTweet />}
               <div className="space-y-4">
                  {tweetsData?.data?.length === 0 ? (
                     <EmptyState
                       title="No posts yet"
                       description="This channel hasn't posted any updates."
                       className="border-none bg-transparent"
                     />
                  ) : (
                     tweetsData?.data?.map((tweet) => (
                        <TweetCard key={tweet._id} tweet={tweet} />
                     ))
                  )}
               </div>
            </div>
          )}

          {activeTab === 'About' && (
            <div className="mt-4 max-w-3xl">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                    Welcome to {channelOwner.fullname}'s channel! Subscribe to stay updated with the latest content.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400 text-sm">Joined</span>
                        <span className="text-white text-sm font-medium">Recently</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400 text-sm">Total views</span>
                        <span className="text-white text-sm font-medium">{totalViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400 text-sm">Videos</span>
                        <span className="text-white text-sm font-medium">{videos.length}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Links</h3>
                    <p className="text-gray-500 text-sm">No links available</p>
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
