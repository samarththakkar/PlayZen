"use client"

import React from "react"
import Link from "next/link"
import { Menu, Search, Mic, Video, User, Bell } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import Image from "next/image"
import toast from "react-hot-toast"

export function Header() {
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-yt-black z-50 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-yt-gray-hover rounded-full transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6 text-yt-white" />
        </button>
        <Link href="/" className="flex items-center gap-1">
          <div className="flex items-center">
            <svg viewBox="0 0 90 20" className="h-5 w-auto">
              <g fill="none" fillRule="evenodd">
                <path
                  d="M27.973 18.672V2.893h2.39v15.779h-2.39zm-6.171-8.238c.103.676.383 1.192.839 1.55.455.358 1.012.537 1.67.537.733 0 1.327-.216 1.783-.647.456-.432.684-1.015.684-1.75V6.07h2.33v12.602h-2.18l-.1-1.273h-.05c-.302.478-.72.847-1.255 1.107-.535.26-1.14.39-1.817.39-.904 0-1.688-.216-2.354-.648-.666-.432-1.182-1.04-1.548-1.825-.366-.785-.549-1.705-.549-2.76 0-1.04.19-1.952.574-2.735.383-.784.915-1.393 1.597-1.825.682-.432 1.472-.648 2.372-.648.719 0 1.347.142 1.886.426.538.285.97.678 1.296 1.182.325.503.53 1.082.614 1.736h-2.33c-.096-.42-.29-.75-.581-.99-.29-.24-.653-.36-1.085-.36-.506 0-.924.17-1.255.512-.33.341-.495.816-.495 1.424v3.17c0 .598.165 1.068.496 1.41.33.342.76.513 1.288.513.44 0 .807-.123 1.102-.37.294-.245.486-.582.575-1.01h2.33c-.063.609-.247 1.148-.553 1.618-.305.47-.71.835-1.213 1.098-.503.263-1.085.395-1.744.395-.89 0-1.665-.212-2.323-.637-.658-.424-1.168-1.023-1.53-1.796-.362-.773-.543-1.68-.543-2.72v-.287c0-1.055.18-1.975.542-2.76.363-.786.876-1.394 1.54-1.825.663-.432 1.442-.648 2.338-.648.693 0 1.302.14 1.827.42.526.28.946.665 1.263 1.156.317.49.52 1.054.606 1.693h-2.314c-.09-.414-.282-.738-.575-.97-.293-.234-.66-.35-1.1-.35-.507 0-.927.166-1.262.5-.335.332-.502.796-.502 1.39v2.993c0 .584.167 1.043.502 1.38.335.338.762.506 1.28.506.448 0 .817-.118 1.107-.355.29-.237.476-.565.56-.985h2.313c-.064.614-.248 1.158-.553 1.633-.305.475-.71.846-1.213 1.114-.504.268-1.085.402-1.744.402-.896 0-1.675-.213-2.338-.638-.664-.426-1.177-1.027-1.54-1.805-.362-.777-.543-1.686-.543-2.726v-.287z"
                  fill="#FFF"
                />
                <path
                  d="M14.377 0H5.623C2.517 0 0 2.485 0 5.551v8.898C0 17.515 2.517 20 5.623 20h8.754c3.106 0 5.623-2.485 5.623-5.551V5.55C20 2.485 17.483 0 14.377 0"
                  fill="#FF0000"
                />
                <path d="M8 14.5V5.5l6 4.5-6 4.5z" fill="#FFF" />
              </g>
            </svg>
            <span className="text-yt-white text-xl font-semibold tracking-tighter ml-0.5">PlayZen</span>
          </div>
        </Link>
      </div>

      {/* Center Section - Search */}
      <div className="flex items-center flex-1 max-w-[540px] mx-4">
        <form onSubmit={handleSearch} className="flex items-center flex-1">
          <div className="flex flex-1 border border-yt-border rounded-l-full bg-yt-darker">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 bg-transparent text-yt-white placeholder-yt-text-muted outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-6 bg-yt-border hover:bg-yt-gray-hover rounded-r-full border border-l-0 border-yt-border transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-yt-white" />
          </button>
        </form>
        <button
          className="ml-3 p-2 bg-yt-dark hover:bg-yt-gray rounded-full transition-colors"
          aria-label="Search with voice"
        >
          <Mic className="w-5 h-5 text-yt-white" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              href="/upload"
              className="p-2 hover:bg-yt-gray-hover rounded-full transition-colors"
              aria-label="Create"
            >
              <Video className="w-6 h-6 text-yt-white" />
            </Link>
            <button
              className="p-2 hover:bg-yt-gray-hover rounded-full transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6 text-yt-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yt-red-bright rounded-full"></span>
            </button>
            <div className="relative group">
              <button className="p-1 hover:bg-yt-gray-hover rounded-full transition-colors" aria-label="Profile">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    backgroundColor: '#EF4444'
                  }}
                >
                  {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-yt-gray rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-4 border-b border-yt-border">
                  <div className="font-medium text-yt-white">{user?.fullname}</div>
                  <div className="text-sm text-yt-text-secondary">{user?.email}</div>
                </div>
                <Link
                  href={`/channel/${user?.username}`}
                  className="block px-4 py-2 text-sm text-yt-white hover:bg-yt-gray-hover transition-colors"
                >
                  Your Channel
                </Link>
                <Link
                  href="/studio"
                  className="block px-4 py-2 text-sm text-yt-white hover:bg-yt-gray-hover transition-colors"
                >
                  Studio
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-yt-white hover:bg-yt-gray-hover transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-yt-blue hover:bg-yt-blue-dark rounded-full transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  )
}