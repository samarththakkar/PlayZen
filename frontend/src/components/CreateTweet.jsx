
import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import Button from "./common/Button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tweetService } from "@/lib/api-services"
import toast from "react-hot-toast"
import { Send } from "lucide-react"

export default function CreateTweet() {
  const { user } = useAuthStore()
  const [content, setContent] = useState("")
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: () => tweetService.createTweet(content),
    onSuccess: () => {
      queryClient.invalidateQueries(['channelTweets'])
      setContent("")
      toast.success('Post created')
    },
    onError: () => toast.error('Failed to create post'),
  })

  if (!user) return null

  return (
    <div className="border border-[#303030] rounded-xl p-4 bg-[#1f1f1f] mb-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.fullname?.[0]?.toUpperCase() || 'U'}
             </div>
          )}
        </div>
        <div className="flex-1">
          <div className="mb-2">
             <span className="text-white font-medium">{user.fullname}</span>
             <span className="text-gray-400 text-sm ml-2">Post an update to your fans</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-[#121212] border border-[#3f3f3f] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3ea6ff] min-h-[100px] resize-none mb-2"
          />
          <div className="flex justify-end">
            <Button 
               variant="primary" 
               onClick={() => createMutation.mutate()}
               disabled={!content.trim() || createMutation.isPending}
               className="gap-2"
            >
               <Send className="w-4 h-4" />
               Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
