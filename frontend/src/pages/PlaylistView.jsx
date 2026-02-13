
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { playlistService } from "@/lib/api-services"
import MainLayout from "@/components/MainLayout"
import { useAuthStore } from "@/store/auth-store"
import Skeleton from "@/components/common/Skeleton"
import Button from "@/components/common/Button"
import EmptyState from "@/components/common/EmptyState"
import { Play, Shuffle, MoreVertical, Trash2, Globe, Lock, Share2, ListVideo } from "lucide-react"
import VideoCard from "@/components/VideoCard"
import toast from "react-hot-toast"
import { useState } from "react"

export default function PlaylistView() {
  const { playlistId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showMenu, setShowMenu] = useState(false)

  const { data: playlistData, isLoading, error } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => playlistService.getPlaylist(playlistId),
  })

  // Mutation to delete playlist
  const deletePlaylistMutation = useMutation({
    mutationFn: () => playlistService.deletePlaylist(playlistId),
    onSuccess: () => {
      toast.success('Playlist deleted')
      navigate('/playlists')
    },
    onError: () => toast.error('Failed to delete playlist'),
  })

  // Mutation to remove video from playlist
  const removeVideoMutation = useMutation({
    mutationFn: (videoId) => playlistService.removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', playlistId])
      toast.success('Removed from playlist')
    },
    onError: () => toast.error('Failed to remove video'),
  })

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1280px] mx-auto min-h-screen">
            {/* Left Sidebar Skeleton */}
            <div className="w-full lg:w-[360px] flex flex-col gap-4">
               <Skeleton className="aspect-video w-full rounded-xl" />
               <Skeleton className="h-8 w-[80%]" />
               <Skeleton className="h-4 w-[60%]" />
               <div className="flex gap-2 mt-4">
                  <Skeleton className="h-10 flex-1 rounded-full" />
                  <Skeleton className="h-10 flex-1 rounded-full" />
               </div>
            </div>
             {/* Right Content Skeleton */}
            <div className="flex-1 flex flex-col gap-4">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                     <Skeleton className="w-40 h-24 rounded-xl" />
                     <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-3 w-[50%]" />
                     </div>
                  </div>
               ))}
            </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !playlistData?.data) {
     return (
        <MainLayout>
           <div className="flex flex-col items-center justify-center min-h-screen text-center">
              <h2 className="text-xl font-bold text-white mb-2">Playlist not found</h2>
              <p className="text-gray-400 mb-6">The playlist you are looking for does not exist or is private.</p>
              <Link to="/playlists">
                 <Button variant="primary">Go to Playlists</Button>
              </Link>
           </div>
        </MainLayout>
     )
  }

  const playlist = playlistData.data
  const isOwner = user?._id === playlist.owner?._id
  const videos = playlist.videos || []
  const firstVideo = videos[0]

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1280px] mx-auto min-h-screen">
        {/* Left Sidebar (Playlist Info) */}
        <div className="w-full lg:w-[360px] lg:fixed lg:h-[calc(100vh-100px)] lg:overflow-y-auto pr-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#272727]">
           <div className="bg-gradient-to-b from-[#272727]/50 to-[#0f0f0f] p-6 rounded-2xl h-full flex flex-col">
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-6 shadow-2xl">
                 {firstVideo?.thumbnail ? (
                    <img src={firstVideo.thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-[#1f1f1f] flex items-center justify-center text-gray-500">
                       No videos
                    </div>
                 )}
              </div>

              {/* Info */}
              <h1 className="text-2xl font-bold text-white mb-2">{playlist.name}</h1>
              <div className="flex flex-col gap-1 text-sm text-gray-400 font-medium mb-4">
                 <span className="text-white text-base">{playlist.owner?.fullname}</span>
                 <div className="flex items-center gap-1">
                    <span>{videos.length} videos</span>
                    <span>•</span>
                    <span>No views</span>
                    <span>•</span>
                    <span>Updated today</span>
                 </div>
                 {playlist.description && (
                    <p className="mt-2 text-gray-400 line-clamp-4">{playlist.description}</p>
                 )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                 <button 
                   className="flex-1 bg-white text-black hover:bg-white/90 font-medium rounded-full py-2 px-4 flex items-center justify-center gap-2 transition-colors"
                   disabled={videos.length === 0}
                 >
                    <Play className="w-5 h-5 fill-current" />
                    Play all
                 </button>
                 <button 
                  className="flex-1 bg-[#ffffff1a] text-white hover:bg-[#ffffff33] font-medium rounded-full py-2 px-4 flex items-center justify-center gap-2 transition-colors"
                  disabled={videos.length === 0}
                 >
                    <Shuffle className="w-5 h-5" />
                    Shuffle
                 </button>
              </div>

              {/* Owner Actions */}
              <div className="flex gap-2">
                 {isOwner && (
                    <>
                       <button 
                          onClick={() => deletePlaylistMutation.mutate()}
                          className="p-2 rounded-full hover:bg-[#ffffff1a] text-gray-400 hover:text-white transition-colors"
                          title="Delete playlist"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                       <button className="p-2 rounded-full hover:bg-[#ffffff1a] text-gray-400 hover:text-white transition-colors">
                          <Share2 className="w-5 h-5" />
                       </button>
                       <div className="flex-1" />
                       {playlist.isPublished ? (
                          <div className="bg-[#272727] px-2 py-1 rounded text-xs text-gray-400 font-medium flex items-center gap-1">
                             <Globe className="w-3 h-3" /> Public
                          </div>
                       ) : (
                          <div className="bg-[#272727] px-2 py-1 rounded text-xs text-gray-400 font-medium flex items-center gap-1">
                             <Lock className="w-3 h-3" /> Private
                          </div>
                       )}
                    </>
                 )}
              </div>
           </div>
        </div>

        {/* Right Content (Videos List) - Added margin-left to offset fixed sidebar on large screens */}
        <div className="flex-1 lg:ml-[380px]">
           {videos.length === 0 ? (
              <EmptyState
                icon={ListVideo}
                title="No videos in this playlist"
                description="Add videos to this playlist to see them here."
                className="min-h-[50vh] border-none"
              />
           ) : (
              <div className="flex flex-col gap-2">
                 {videos.map((video, index) => (
                    <div key={video._id} className="group flex gap-4 p-2 rounded-xl hover:bg-[#272727] transition-colors cursor-pointer relative">
                       <div className="hidden sm:flex items-center justify-center w-6 text-gray-500 font-medium group-hover:hidden">
                          {index + 1}
                       </div>
                       <div className="hidden sm:flex items-center justify-center w-6 text-white text-opacity-0 group-hover:text-opacity-100">
                          <Play className="w-4 h-4 fill-current" />
                       </div>

                       <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-[#1f1f1f] flex-shrink-0">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                       </div>

                       <div className="flex-1 min-w-0 pr-8">
                          <h3 className="text-white font-medium line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                             {video.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                             <span>{video.owner?.fullname}</span>
                             <span>•</span>
                             <span>{video.views} views</span>
                             <span>•</span>
                             <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>

                       {isOwner && (
                          <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                removeVideoMutation.mutate(video._id);
                             }}
                             className="absolute right-2 top-2 p-2 rounded-full hover:bg-[#3f3f3f] text-transparent group-hover:text-gray-400 hover:text-red-500 transition-all"
                             title="Remove from playlist"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       )}
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </MainLayout>
  )
}
