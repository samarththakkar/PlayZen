
import { Link } from "react-router-dom"
import { ListVideo, Lock, Globe, Play } from "lucide-react"

export default function PlaylistCard({ playlist }) {
  const firstVideo = playlist.videos?.[0]
  const videoCount = playlist.videos?.length || 0

  return (
    <Link to={`/playlist/${playlist._id}`} className="group cursor-pointer">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#272727] mb-3">
        {firstVideo?.thumbnail ? (
          <img
            src={firstVideo.thumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3f3f3f]">
            <ListVideo className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Right Overlay with Count */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <span className="font-bold text-lg mb-1">{videoCount}</span>
          <ListVideo className="w-6 h-6" />
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex items-center gap-2 text-white font-medium uppercase tracking-wide text-sm">
                <Play className="w-4 h-4 fill-current" />
                Play All
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white text-base font-medium leading-tight line-clamp-2 title-hover group-hover:text-white transition-colors">
          {playlist.name}
        </h3>
        <div className="flex items-center gap-2 text-[#aaaaaa] text-sm">
           <span className="font-medium text-[#aaaaaa] hover:text-white transition-colors">
             {playlist.owner?.fullname || 'You'}
           </span>
        </div>
        <div className="flex items-center gap-2 text-[#aaaaaa] text-xs">
           {playlist.isPublished ? (
             <span className="bg-[#272727] px-1.5 py-0.5 rounded text-xs text-gray-400 font-medium">Public</span>
           ) : (
             <span className="bg-[#272727] px-1.5 py-0.5 rounded text-xs text-gray-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
             </span>
           )}
           <span>•</span>
           <span>Playlist</span>
        </div>
      </div>
    </Link>
  )
}
