"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Home,
  Flame,
  Music2,
  Gamepad2,
  Newspaper,
  Trophy,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  ChevronDown,
  Youtube,
} from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { subscriptionService } from "@/lib/api-services"
import { useAuthStore } from "@/store/auth-store"

const mainNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PlaySquare, label: "Shorts", href: "/shorts" },
  { icon: Youtube, label: "Subscriptions", href: "/subscriptions" },
]

const youItems = [
  { icon: User, label: "Your channel", href: "/channel" },
  { icon: History, label: "History", href: "/feed/history" },
  { icon: PlaySquare, label: "Your videos", href: "/studio" },
  { icon: Clock, label: "Watch later", href: "/playlist?list=WL" },
  { icon: ThumbsUp, label: "Liked videos", href: "/liked" },
]

const exploreItems = [
  { icon: Flame, label: "Trending", href: "/feed/trending" },
  { icon: Music2, label: "Music", href: "/channel/music" },
  { icon: Gamepad2, label: "Gaming", href: "/gaming" },
  { icon: Newspaper, label: "News", href: "/channel/news" },
  { icon: Trophy, label: "Sports", href: "/channel/sports" },
]

export function Sidebar() {
  const { isExpanded } = useSidebar()
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()

  const { data: subscriptionsData } = useQuery({
    queryKey: ['subscribedChannels', user?._id],
    queryFn: () => subscriptionService.getSubscribedChannels(user?._id || ''),
    enabled: isAuthenticated && !!user?._id,
  })

  const subscriptions = subscriptionsData?.data || []

  if (!isExpanded) {
    return (
      <aside className="fixed left-0 top-14 w-[72px] h-[calc(100vh-56px)] bg-yt-black overflow-y-auto py-1 max-md:hidden">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-1 rounded-lg mx-1 transition-colors",
                isActive ? "bg-yt-gray" : "hover:bg-yt-gray",
              )}
            >
              <Icon className="w-6 h-6 text-yt-white" />
              <span className="text-[10px] text-yt-white mt-1.5">{item.label}</span>
            </Link>
          )
        })}
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-14 w-60 h-[calc(100vh-56px)] bg-yt-black overflow-y-auto py-3 px-3 max-md:hidden">
      {/* Main Navigation */}
      <nav className="space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-6 px-3 py-2.5 rounded-lg transition-colors",
                isActive ? "bg-yt-gray" : "hover:bg-yt-gray",
              )}
            >
              <Icon className="w-6 h-6 text-yt-white" />
              <span className="text-sm text-yt-white">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="h-px bg-yt-border my-3" />

      {/* You Section */}
      {isAuthenticated && (
        <>
          <div className="mb-2">
            <h3 className="px-3 py-1.5 text-base font-medium text-yt-white">You</h3>
            <nav className="space-y-1">
              {youItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-6 px-3 py-2.5 rounded-lg transition-colors",
                      isActive ? "bg-yt-gray" : "hover:bg-yt-gray",
                    )}
                  >
                    <Icon className="w-6 h-6 text-yt-white" />
                    <span className="text-sm text-yt-white">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="h-px bg-yt-border my-3" />
        </>
      )}

      {/* Subscriptions */}
      {isAuthenticated && subscriptions.length > 0 && (
        <>
          <div className="mb-2">
            <h3 className="px-3 py-1.5 text-base font-medium text-yt-white">Subscriptions</h3>
            <nav className="space-y-1">
              {subscriptions.slice(0, 5).map((channel: any) => (
                <Link
                  key={channel._id}
                  href={`/channel/${channel.username}`}
                  className="flex items-center gap-6 px-3 py-2.5 rounded-lg hover:bg-yt-gray transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    {channel.avatar ? (
                      <Image
                        src={channel.avatar}
                        alt={channel.fullname}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-yt-blue flex items-center justify-center text-xs text-yt-white">
                        {channel.fullname?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-yt-white truncate">{channel.fullname}</span>
                </Link>
              ))}
              {subscriptions.length > 5 && (
                <button className="flex items-center gap-6 px-3 py-2.5 rounded-lg hover:bg-yt-gray transition-colors w-full">
                  <ChevronDown className="w-6 h-6 text-yt-white" />
                  <span className="text-sm text-yt-white">Show more</span>
                </button>
              )}
            </nav>
          </div>

          <div className="h-px bg-yt-border my-3" />
        </>
      )}

      {/* Explore */}
      <div className="mb-2">
        <h3 className="px-3 py-1.5 text-base font-medium text-yt-white">Explore</h3>
        <nav className="space-y-1">
          {exploreItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-6 px-3 py-2.5 rounded-lg transition-colors",
                  isActive ? "bg-yt-gray" : "hover:bg-yt-gray",
                )}
              >
                <Icon className="w-6 h-6 text-yt-white" />
                <span className="text-sm text-yt-white">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="h-px bg-yt-border my-3" />

      {/* Footer */}
      <div className="px-3 py-4 space-y-3">
        <div className="flex flex-wrap gap-2 text-xs text-yt-text-secondary">
          <Link href="#" className="hover:text-yt-white">
            About
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Press
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Copyright
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Contact us
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Creators
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Advertise
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Developers
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-yt-text-secondary">
          <Link href="#" className="hover:text-yt-white">
            Terms
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Privacy
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Policy & Safety
          </Link>
          <Link href="#" className="hover:text-yt-white">
            How YouTube works
          </Link>
          <Link href="#" className="hover:text-yt-white">
            Test new features
          </Link>
        </div>
        <p className="text-xs text-yt-text-muted">© 2025 Google LLC</p>
      </div>
    </aside>
  )
}
