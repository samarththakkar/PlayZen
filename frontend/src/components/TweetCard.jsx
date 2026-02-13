
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical, Trash2, Edit2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Button from "./common/Button"
import Input from "./common/Input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tweetService } from "@/lib/api-services"
import toast from "react-hot-toast"

export default function TweetCard({ tweet }) {
  const { user } = useAuthStore()
  const isOwner = user?._id === tweet.owner?._id
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(tweet.content)
  const queryClient = useQueryClient()

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => tweetService.toggleLike(tweet._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['channelTweets'])
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => tweetService.deleteTweet(tweet._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['channelTweets'])
      toast.success('Post deleted')
    },
    onError: () => toast.error('Failed to delete post'),
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: () => tweetService.updateTweet(tweet._id, editContent),
    onSuccess: () => {
      queryClient.invalidateQueries(['channelTweets'])
      setIsEditing(false)
      toast.success('Post updated')
    },
    onError: () => toast.error('Failed to update post'),
  })

  return (
    <div className="border border-[#303030] rounded-xl p-4 bg-[#1f1f1f] hover:bg-[#252525] transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {tweet.owner?.avatar ? (
            <img
              src={tweet.owner.avatar}
              alt={tweet.owner.fullname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {tweet.owner?.fullname?.[0]?.toUpperCase() || 'U'}
             </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{tweet.owner?.fullname}</span>
              <span className="text-sm text-gray-400">
                {tweet.createdAt && !isNaN(new Date(tweet.createdAt).getTime())
                   ? formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })
                   : ''
                }
              </span>
            </div>
            
            {isOwner && !isEditing && (
               <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-[#3f3f3f]">
                     <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full hidden group-hover:block bg-[#282828] border border-[#3f3f3f] rounded-lg shadow-lg py-1 z-10 w-32">
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-[#3f3f3f] text-left"
                     >
                        <Edit2 className="w-4 h-4" /> Edit
                     </button>
                     <button 
                        onClick={() => deleteMutation.mutate()}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-[#3f3f3f] text-left"
                     >
                        <Trash2 className="w-4 h-4" /> Delete
                     </button>
                  </div>
               </div>
            )}
          </div>

          {isEditing ? (
             <div className="mb-3">
                <textarea
                   value={editContent}
                   onChange={(e) => setEditContent(e.target.value)}
                   className="w-full bg-[#121212] border border-[#3f3f3f] rounded-lg p-3 text-white focus:outline-none focus:border-[#3ea6ff] min-h-[100px] resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                   <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                   <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => updateMutation.mutate()}
                      disabled={!editContent.trim() || updateMutation.isPending}
                   >
                      Save
                   </Button>
                </div>
             </div>
          ) : (
            <p className="text-white mb-3 whitespace-pre-wrap">{tweet.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
               onClick={() => likeMutation.mutate()}
               className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
            >
              <ThumbsUp className={`w-4 h-4 ${tweet.isLiked ? 'fill-white text-white' : ''}`} />
              <span className="text-sm">{tweet.likesCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
