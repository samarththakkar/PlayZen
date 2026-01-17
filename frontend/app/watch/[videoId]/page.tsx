'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { videoService, commentService, likeService, subscriptionService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import ReactPlayer from 'react-player';
import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ThumbUp, ThumbDown, Share2, MoreVertical, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import VideoCard from '@/components/VideoCard';

export default function WatchPage() {
  const { videoId } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: videoData, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoService.getVideoById(videoId as string),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentService.getComments(videoId as string),
    enabled: isAuthenticated,
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ['relatedVideos'],
    queryFn: () => videoService.getAllVideos({ limit: 10 }),
  });

  const video = videoData?.data;
  const comments = commentsData?.data || [];
  const owner = video && typeof video.owner === 'object' ? video.owner : null;
  const isOwner = owner?._id === user?._id;

  const likeMutation = useMutation({
    mutationFn: () => likeService.toggleVideoLike(videoId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      toast.success('Like updated');
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionService.toggleSubscription(owner?._id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      toast.success('Subscription updated');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => commentService.addComment(videoId as string, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      setCommentText('');
      toast.success('Comment added');
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </MainLayout>
    );
  }

  if (!video) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">Video not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <ReactPlayer
              url={video.videoFile}
              controls
              width="100%"
              height="100%"
              playing
            />
          </div>

          {/* Video Info */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-yt-white mb-3">{video.title}</h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-yt-text-secondary">
                  {video.views?.toLocaleString() || 0} views •{' '}
                  {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => likeMutation.mutate()}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors"
                  disabled={!isAuthenticated}
                >
                  <ThumbUp className="w-5 h-5" />
                  <span className="text-sm">{video.likesCount || 0}</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors"
                >
                  <ThumbDown className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
                <button className="p-2 hover:bg-yt-gray rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Channel Info */}
          {owner && (
            <div className="border-t border-yt-border pt-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {owner.avatar ? (
                    <Image
                      src={owner.avatar}
                      alt={owner.fullname}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yt-blue rounded-full flex items-center justify-center text-yt-white font-medium">
                      {owner.fullname?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                  <div className="font-semibold text-yt-white">{owner.fullname}</div>
                  <div className="text-sm text-yt-text-secondary">{owner.username}</div>
                  </div>
                </div>
                {!isOwner && (
                  <button
                    onClick={() => subscribeMutation.mutate()}
                    className="px-4 py-2 bg-yt-blue hover:bg-yt-blue-dark rounded-full font-medium transition-colors"
                  >
                    Subscribe
                  </button>
                )}
              </div>
              <div className="bg-yt-gray rounded-lg p-4">
                <p className="text-sm text-yt-white whitespace-pre-wrap">{video.description}</p>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="border-t border-yt-border pt-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                {isAuthenticated ? `${comments.length} Comments` : 'Comments'}
              </h2>
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.fullname}
                      width={40}
                      height={40}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#3ea6ff] rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {user?.fullname?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-yt-border pb-2 text-yt-white outline-none focus:border-yt-white transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yt-blue hover:bg-yt-blue-dark rounded-full font-medium transition-colors"
                  >
                    Comment
                  </button>
                </form>
              ) : (
                <div className="mb-6 flex items-center justify-between bg-[#181818] border border-[#272727] rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white font-medium">Sign in to view and add comments</p>
                    <p className="text-sm text-gray-400">Comments are available for signed-in users.</p>
                  </div>
                  <button
                    onClick={() => (window.location.href = '/login')}
                    className="px-4 py-2 bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 rounded-full font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="space-y-4">
                {comments.map((comment: any) => {
                  const commentOwner = typeof comment.owner === 'object' ? comment.owner : null;
                  return (
                    <div key={comment._id} className="flex gap-3">
                      {commentOwner?.avatar ? (
                        <Image
                          src={commentOwner.avatar}
                          alt={commentOwner.fullname}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#3ea6ff] rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                          {commentOwner?.fullname?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-yt-white">
                          {commentOwner?.fullname || 'Unknown'}
                        </span>
                        <span className="text-xs text-yt-text-secondary">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-yt-text-secondary mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-yt-text-secondary hover:text-yt-white transition-colors">
                          <ThumbUp className="w-4 h-4" />
                          <span className="text-xs">{comment.likesCount || 0}</span>
                        </button>
                        <button className="text-yt-text-secondary hover:text-yt-white transition-colors">
                          <ThumbDown className="w-4 h-4" />
                        </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

          {/* Sidebar - Related Videos */}
        <div className="lg:w-96 space-y-4">
          <h3 className="text-lg font-semibold text-yt-white">Up Next</h3>
          {relatedVideos?.data?.docs
            ?.filter((v: any) => v._id !== videoId)
            .slice(0, 10)
            .map((video: any) => (
              <VideoCard key={video._id} video={video} />
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
