
import { useState, useEffect } from "react"
import { X, Upload as UploadIcon, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { videoService } from "@/lib/api-services"
import toast from "react-hot-toast"
import Button from "./common/Button"

export default function EditVideoModal({ isOpen, onClose, video }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other"
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [preview, setPreview] = useState("")
  
  const queryClient = useQueryClient()

  useEffect(() => {
    if (video) {
        setFormData({
            title: video.title || "",
            description: video.description || "",
            category: video.category || "Other"
        })
        setPreview(video.thumbnail)
    }
  }, [video])

  const updateMutation = useMutation({
    mutationFn: (data) => videoService.updateVideo(video._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['videos'])
      queryClient.invalidateQueries(['userVideos'])
      queryClient.invalidateQueries(['studioVideos'])
      toast.success("Video updated successfully")
      onClose()
    },
    onError: (error) => {
        toast.error(error.message || "Failed to update video")
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("category", formData.category)
    if (thumbnail) {
        data.append("thumbnail", thumbnail)
    }
    updateMutation.mutate(data)
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnail(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#303030] shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#303030]">
          <h2 className="text-xl font-bold text-white">Edit Video</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#303030] rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thumbnail Preview */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Thumbnail</label>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0f0f0f] border border-[#303030] group">
                <img 
                    src={preview} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-colors">
                        <UploadIcon className="w-4 h-4" />
                        <span>Change Thumbnail</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleThumbnailChange}
                        />
                    </label>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#303030] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Video title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#303030] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors h-32 resize-none"
              placeholder="Tell viewers about your video"
              required
            />
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-400">Category</label>
             <select
               value={formData.category}
               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
               className="w-full bg-[#0f0f0f] border border-[#303030] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
             >
                <option value="Other">Other</option>
                <option value="Gaming">Gaming</option>
                <option value="Music">Music</option>
                <option value="Tech">Tech</option>
                <option value="News">News</option>
                <option value="Education">Education</option>
                <option value="Sports">Sports</option>
                <option value="Entertainment">Entertainment</option>
             </select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="default" 
              type="submit" 
              disabled={updateMutation.isPending}
              className="min-w-[100px]"
            >
              {updateMutation.isPending ? (
                <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
