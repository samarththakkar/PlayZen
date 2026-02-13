
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { videoService, commentService, likeService, subscriptionService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Share2, MoreVertical, ListPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';
import VideoCard from '@/components/VideoCard';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import './Watch.css';

export default function Watch() {
  const { videoId } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: videoData, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoService.getVideoById(videoId),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentService.getComments(videoId),
    enabled: isAuthenticated,
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ['relatedVideos'],
    queryFn: () => videoService.getAllVideos({ limit: 10 }),
  });

  const video = videoData?.data;
  const comments = Array.isArray(commentsData?.data) ? commentsData.data : [];
  const owner = video && typeof video.owner === 'object' ? video.owner : null;
  const isOwner = owner?._id === user?._id;

  const likeMutation = useMutation({
    mutationFn: () => likeService.toggleVideoLike(videoId),
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
    mutationFn: (content) => commentService.addComment(videoId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      setCommentText('');
      toast.success('Comment added');
    },
  });

  const handleAddComment = (e) => {
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
        <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 max-w-[1800px] mx-auto min-h-screen">
          <div className="flex-1 min-w-0">
             <Skeleton className="w-full aspect-video rounded-xl mb-4" />
             <Skeleton className="h-8 w-[70%] mb-4" />
             <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-[30%]" />
                <div className="flex gap-2">
                   <Skeleton className="h-10 w-24 rounded-full" />
                   <Skeleton className="h-10 w-24 rounded-full" />
                   <Skeleton className="h-10 w-24 rounded-full" />
                </div>
             </div>
             <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="xl:w-96 space-y-4">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-2">
                   <Skeleton className="h-24 w-40 rounded-xl" />
                   <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[90%]" />
                      <Skeleton className="h-3 w-[60%]" />
                   </div>
                </div>
             ))}
          </div>
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
      <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 max-w-[1800px] mx-auto">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          <div className="w-full max-w-[1280px] aspect-video bg-black rounded-lg overflow-hidden mb-4">
            {video.videoFile ? (
              <>
                <video
                  src={video.videoFile}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                  crossOrigin="anonymous"
                  onLoadedData={() => console.log('Video loaded successfully')}
                >
                  <source src={video.videoFile} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                No video URL available
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-yt-white mb-3">{video.title}</h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-yt-text-secondary">
                  {video.views?.toLocaleString() || 0} views •{' '}
                  {video.createdAt && !isNaN(new Date(video.createdAt).getTime()) 
                    ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
                    : 'Recently'
                  }
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => likeMutation.mutate()}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors"
                  disabled={!isAuthenticated}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm">{video.likesCount || 0}</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors"
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
                <button 
                  onClick={() => setShowPlaylistModal(true)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-yt-gray rounded-full transition-colors"
                >
                  <ListPlus className="w-5 h-5" />
                  <span className="text-sm">Save</span>
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
                    <img
                      src={owner.avatar}
                      alt={owner.fullname}
                      className="rounded-full w-12 h-12 object-cover"
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
                    <img
                      src={user.avatar}
                      alt={user.fullname}
                      className="rounded-full w-10 h-10 object-cover flex-shrink-0"
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
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 rounded-full font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="space-y-4">
                {comments.length === 0 ? (
                   <EmptyState
                     title="No comments yet"
                     description="Be the first to comment on this video."
                     className="border-none bg-transparent py-8"
                   />
                ) : (
                  comments.map((comment) => {
                    const commentOwner = typeof comment.owner === 'object' ? comment.owner : null;
                    return (
                      <div key={comment._id} className="flex gap-3">

                      {commentOwner?.avatar ? (
                        <img
                          src={commentOwner.avatar}
                          alt={commentOwner.fullname}
                          className="rounded-full w-10 h-10 object-cover flex-shrink-0"
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
                          {comment.createdAt && !isNaN(new Date(comment.createdAt).getTime())
                            ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                            : 'Recently'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-yt-text-secondary mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-yt-text-secondary hover:text-yt-white transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">{comment.likesCount || 0}</span>
                        </button>
                        <button className="text-yt-text-secondary hover:text-yt-white transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        </div>
                      </div>
                    </div>
                  );
                })
                 )}
              </div>
            )}
          </div>
        </div>

          {/* Sidebar - Related Videos */}
        <div className="xl:w-96 xl:flex-shrink-0 space-y-4">
          <h3 className="text-lg font-semibold text-yt-white">Up Next</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            {relatedVideos?.data?.docs
              ?.filter((v) => v._id !== videoId)
              .slice(0, 10)
              .map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
          </div>
        </div>
      </div>
      <AddToPlaylistModal 
        isOpen={showPlaylistModal} 
        onClose={() => setShowPlaylistModal(false)} 
        videoId={videoId} 
      />
    </MainLayout>
  );
}
