
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  PlaySquare,
  Youtube,
  History,
  Clock,
  ThumbsUp,
  Video,
  ChevronDown,
} from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { subscriptionService } from "@/lib/api-services"
import { useAuthStore } from "@/store/auth-store"
import { useState } from "react"


const SidebarItem = ({ icon: Icon, label, href, isActive, isCollapsed, onClick }) => {
  return (
    <Link 
      to={href || '#'} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-5 px-3 py-2.5 rounded-lg transition-colors duration-200 group text-text-primary",
        isActive ? "bg-bg-hover hover:bg-bg-active" : "hover:bg-bg-hover",
        isCollapsed ? "justify-center" : ""
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn("w-6 h-6 flex-shrink-0", isActive ? "text-text-primary" : "text-text-primary")} />
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  )
}

const SidebarSection = ({ title, children, isCollapsed }) => {
  return (
    <div className="py-2 border-b border-border-default last:border-0">
      {title && !isCollapsed && (
        <h3 className="px-3 py-2 text-base font-semibold text-text-primary">{title}</h3>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

const ChannelItem = ({ channel, isCollapsed }) => {
  return (
    <Link 
      to={`/channel/${channel.username}`} 
      className={cn(
        "flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors duration-200 text-text-primary",
        isCollapsed ? "justify-center" : ""
      )}
      title={isCollapsed ? channel.fullname : undefined}
    >
      <div className="w-6 h-6 flex-shrink-0">
        {channel.avatar ? (
          <img
            src={channel.avatar}
            alt={channel.fullname}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center text-xs font-bold text-white">
            {channel.fullname?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{channel.fullname}</span>
      )}
    </Link>
  )
}

const mainNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PlaySquare, label: "Shorts", href: "/shorts" },
  { icon: Youtube, label: "Subscriptions", href: "/subscriptions" },
]

const libraryItems = [
  { icon: History, label: "History", href: "/feed/history" },
  { icon: PlaySquare, label: "Playlists", href: "/playlists" },
  { icon: Clock, label: "Watch Later", href: "/playlist?list=WL" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
  { icon: Video, label: "Your Videos", href: "/studio" },
]

export function Sidebar() {
  const { isExpanded } = useSidebar()
  const pathname = useLocation().pathname
  const { isAuthenticated, user } = useAuthStore()
  const [showMoreSubs, setShowMoreSubs] = useState(false)

  const { data: subscriptionsData } = useQuery({
    queryKey: ['subscribedChannels', user?._id],
    queryFn: () => subscriptionService.getSubscribedChannels(user?._id || ''),
    enabled: isAuthenticated && !!user?._id,
  })

  const subscriptions = Array.isArray(subscriptionsData?.data) ? subscriptionsData.data : []
  const visibleSubs = showMoreSubs ? subscriptions : subscriptions.slice(0, 5)

  return (
    <aside 
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-56px)] bg-bg-secondary transition-all duration-300 z-40 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bg-hover",
        isExpanded ? "w-60" : "w-[72px]"
      )}
    >
      <div className="p-3">
        {/* Main Navigation */}
        <SidebarSection isCollapsed={!isExpanded}>
          {mainNavItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
              isCollapsed={!isExpanded}
            />
          ))}
        </SidebarSection>
        
        {/* Library Section */}
        {isAuthenticated && (
          <SidebarSection title="You" isCollapsed={!isExpanded}>
            {libraryItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
                isCollapsed={!isExpanded}
              />
            ))}
          </SidebarSection>
        )}

        {/* Subscriptions */}
        {isAuthenticated && subscriptions.length > 0 && (
          <SidebarSection title="Subscriptions" isCollapsed={!isExpanded}>
            {visibleSubs.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isCollapsed={!isExpanded}
              />
            ))}
            {!isExpanded && (
              <div className="h-4"></div>
            )}
            {subscriptions.length > 5 && !isExpanded && null} {/* Hide show more in collapsed */}
            {subscriptions.length > 5 && isExpanded && (
              <button 
                onClick={() => setShowMoreSubs(!showMoreSubs)} 
                className="flex items-center gap-4 px-3 py-2 w-full rounded-lg hover:bg-bg-hover transition-colors duration-200 text-text-primary"
              >
                <ChevronDown className={cn("w-5 h-5 transition-transform", showMoreSubs ? "rotate-180" : "")} />
                <span className="text-sm font-medium">{showMoreSubs ? "Show less" : "Show more"}</span>
              </button>
            )}
          </SidebarSection>
        )}
      </div>
    </aside>
  )
}