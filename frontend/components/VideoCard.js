"use client"

import Image from "next/image"
import Link from "next/link"
import { MoreVertical, Clock, ListPlus, Ban, Flag, Play } from "lucide-react"
import { useState } from "react"
import './VideoCard.css'

export default function VideoCard({ video }) {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const owner = typeof video.owner === "object" ? video.owner : null
  const duration = video.duration || 0
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views?.toString() || "0"
  }

  const formatTimeAgo = (date) => {
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
      className="video-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${video._id}`}>
        {/* Thumbnail */}
        <div className="video-thumbnail-container">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="video-thumbnail-image"
          />
          
          {/* Hover Play Button */}
          <div className={`video-play-overlay ${isHovered ? 'visible' : ''}`}>
            <div className="video-play-button">
              <Play className="play-icon" />
            </div>
          </div>
          
          {/* Duration Badge */}
          <span className="video-duration-badge">
            {durationStr}
          </span>
          
          {/* Progress Bar (if watched) */}
          {video.watchProgress && (
            <div className="video-progress-bar">
              <div 
                className="video-progress-fill"
                style={{ width: `${video.watchProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="video-info-container">
          {/* Channel Avatar */}
          <div className="video-avatar-container">
            {owner?.avatar ? (
              <Image
                src={owner.avatar}
                alt={owner.fullname || "Channel"}
                width={36}
                height={36}
                className="video-avatar-image"
              />
            ) : (
              <div className="video-avatar-placeholder">
                {owner?.fullname?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="video-text-content">
            <h3 className="video-title">
              {video.title}
            </h3>
            <div className="video-metadata">
              <p className="video-channel-name">
                {owner?.fullname || "Unknown"}
              </p>
              <p className="video-stats">
                {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Three-dot menu */}
      <div className={`video-menu-button ${isHovered ? 'visible' : ''}`}>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="menu-trigger"
        >
          <MoreVertical className="menu-icon" />
        </button>

        {showMenu && (
          <>
            <div 
              className="menu-overlay"
              onClick={() => setShowMenu(false)}
            />
            <div className="video-dropdown-menu">
              <button className="menu-item">
                <ListPlus className="menu-item-icon" />
                Add to queue
              </button>
              <button className="menu-item">
                <Clock className="menu-item-icon" />
                Save to Watch later
              </button>
              <button className="menu-item">
                <Ban className="menu-item-icon" />
                Not interested
              </button>
              <button className="menu-item">
                <Flag className="menu-item-icon" />
                Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}