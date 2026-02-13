
import { Video, Users, Eye, ThumbsUp } from "lucide-react"

export default function StudioStats({ videos, totalViews = 0, totalLikes = 0 }) {
  const totalSubscribers = 0 // Placeholder until we have the endpoint
  
  const stats = [
    {
       label: "Total Videos",
       value: videos.length,
       icon: Video,
       color: "text-blue-500",
       bg: "bg-blue-500/10"
    },
    {
       label: "Total Views",
       value: totalViews.toLocaleString(),
       icon: Eye,
       color: "text-green-500",
       bg: "bg-green-500/10"
    },
    {
       label: "Total Likes",
       value: totalLikes.toLocaleString(),
       icon: ThumbsUp,
       color: "text-pink-500",
       bg: "bg-pink-500/10"
    },
    {
       label: "Subscribers",
       value: totalSubscribers.toLocaleString(),
       icon: Users,
       color: "text-purple-500",
       bg: "bg-purple-500/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[#1f1f1f] border border-[#303030] p-4 rounded-xl flex items-center gap-4">
           <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
           </div>
           <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
           </div>
        </div>
      ))}
    </div>
  )
}
