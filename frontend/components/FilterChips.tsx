"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const filters = [
  "All",
  "Music",
  "Gaming",
  "Live",
  "Playlists",
  "Mixes",
  "News",
  "JavaScript",
  "React",
  "Next.js",
  "TypeScript",
  "Web development",
  "Computer programming",
  "Recently uploaded",
  "Watched",
]

export function FilterChips() {
  const [activeFilter, setActiveFilter] = useState("All")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  return (
    <div className="sticky top-14 z-40 bg-yt-black py-3">
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-yt-black via-yt-black to-transparent pr-8">
            <button onClick={() => scroll("left")} className="p-2 hover:bg-yt-gray-hover rounded-full">
              <ChevronLeft className="w-5 h-5 text-yt-white" />
            </button>
          </div>
        )}

        {/* Chips Container */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex gap-3 overflow-x-auto scrollbar-hide px-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeFilter === filter
                  ? "bg-yt-white text-yt-black"
                  : "bg-yt-gray text-yt-white hover:bg-yt-gray-hover",
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-yt-black via-yt-black to-transparent pl-8">
            <button onClick={() => scroll("right")} className="p-2 hover:bg-yt-gray-hover rounded-full">
              <ChevronRight className="w-5 h-5 text-yt-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
