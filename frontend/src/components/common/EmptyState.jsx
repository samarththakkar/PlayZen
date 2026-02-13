
import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "No items found", 
  description = "There are no items to display at this moment.",
  action,
  className
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-[#1f1f1f] border border-[#303030] rounded-xl", className)}>
      <div className="bg-[#272727] p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}
