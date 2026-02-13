
import { Link } from "react-router-dom"
import { MoreVertical, Clock, ListPlus, Ban, Flag, Play, Trash2, Edit2, Globe, Lock } from "lucide-react"
import { useState } from "react"
import AddToPlaylistModal from "./AddToPlaylistModal"
import EditVideoModal from "./EditVideoModal"
import { useAuthStore } from "@/store/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { videoService } from "@/lib/api-services"
import toast from "react-hot-toast"

export default function VideoCard({ video }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Handle different data structures (owner might be populated or ID)
  const owner = typeof video.owner === "object" ? video.owner : { fullname: "Unknown", avatar: null }
  
  const isOwner = user?._id === (owner._id || video.owner)

  const deleteMutation = useMutation({
    mutationFn: () => videoService.deleteVideo(video._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['videos'])
      queryClient.invalidateQueries(['userVideos'])
      toast.success('Video deleted')
    },
    onError: () => toast.error('Failed to delete video')
  })

  const togglePublishMutation = useMutation({
    mutationFn: () => videoService.togglePublish(video._id),
    onSuccess: () => {
       queryClient.invalidateQueries(['videos'])
       queryClient.invalidateQueries(['userVideos'])
       toast.success('Video visibility updated')
    },
    onError: () => toast.error('Failed to update visibility')
  })
  
  const duration = video.duration || 0
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const formatViews = (views) => {
    if (!views) return "0"
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const formatTimeAgo = (date) => {
    if (!date) return ""
    const now = new Date()
    const videoDate = new Date(date)
    const diffInSeconds = Math.floor((now - videoDate) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  return (
    <div 
      className="group flex flex-col gap-3 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/watch/${video._id}`} className="relative isolate">
        {/* Thumbnail Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-hover">
          {/* Main Image */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
             {isHovered && <Play className="w-8 h-8 text-white fill-current" />}
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs font-medium text-white">
            {durationStr}
          </div>

          {/* Private Badge */}
          {!video.isPublished && (
             <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 rounded flex items-center gap-1 text-xs font-medium text-white">
                <Lock className="w-3 h-3" />
                Private
             </div>
          )}

          {/* Progress Bar */}
          {video.watchProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-bg-active">
              <div 
                className="h-full bg-brand-red" 
                style={{ width: `${video.watchProgress}%` }} 
              />
            </div>
          )}
        </div>
      </Link>

      {/* Info Section */}
      <div className="flex gap-3 items-start pr-6 relative">
        {/* Avatar */}
        <Link to={`/channel/${owner?.username}`} className="flex-shrink-0">
           {owner?.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.fullname}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
              {owner?.fullname?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </Link>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-text-primary text-base font-medium leading-tight line-clamp-2 mb-1 group-hover:text-brand-blue transition-colors">
              {video.title}
            </h3>
          </Link>
          
          <div className="text-text-secondary text-sm">
            <Link 
              to={`/channel/${owner?.username}`}
              className="hover:text-text-primary transition-colors block"
            >
              {owner?.fullname}
            </Link>
            <div className="flex items-center gap-1">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="absolute top-0 right-0">
          <button 
            onClick={(e) => {
              e.preventDefault()
              setShowMenu(!showMenu)
            }}
            className="p-1 text-transparent group-hover:text-text-primary hover:bg-bg-hover rounded-full transition-all focus:outline-none"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
             <>
               <div className="fixed inset-0 z-40" onClick={(e) => {
                 e.stopPropagation()
                 setShowMenu(false)
               }} />
               <div className="absolute right-0 top-8 w-48 bg-surface-secondary rounded-xl shadow-xl py-2 z-50 flex flex-col border border-border-default">
                  {isOwner ? (
                     <>
                        <button 
                           onClick={() => togglePublishMutation.mutate()}
                           className="flex items-center gap-3 px-4 py-2 hover:bg-bg-active text-text-primary text-sm text-left"
                        >
                           {video.isPublished ? <Lock className="w-5 h-5 text-text-secondary" /> : <Globe className="w-5 h-5 text-brand-blue" />}
                           {video.isPublished ? 'Make Private' : 'Make Public'}
                        </button>
                        <button 
                           onClick={() => {
                               setShowMenu(false)
                               setShowEditModal(true)
                           }}
                           className="flex items-center gap-3 px-4 py-2 hover:bg-bg-active text-text-primary text-sm text-left"
                        >
                           <Edit2 className="w-5 h-5" />
                           Edit
                        </button>
                        <button 
                           onClick={() => deleteMutation.mutate()}
                           className="flex items-center gap-3 px-4 py-2 hover:bg-bg-active text-brand-red text-sm text-left"
                        >
                           <Trash2 className="w-5 h-5" />
                           Delete
                        </button>
                        <div className="my-1 border-t border-border-default" />
                     </>
                  ) : null}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      setShowMenu(false)
                      setShowPlaylistModal(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-bg-active text-text-primary text-sm text-left"
                  >
                    <ListPlus className="w-5 h-5" />
                    Save to playlist
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 hover:bg-bg-active text-text-primary text-sm text-left">
                    <Ban className="w-5 h-5" />
                    Not interested
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 hover:bg-bg-active text-text-primary text-sm text-left">
                    <Flag className="w-5 h-5" />
                    Report
                  </button>
               </div>
             </>
          )}
        </div>
      </div>

      <AddToPlaylistModal 
        isOpen={showPlaylistModal} 
        onClose={() => setShowPlaylistModal(false)} 
        videoId={video._id} 
      />
      
      <EditVideoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        video={video}
      />
    </div>
  )
}