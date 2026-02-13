
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const filters = [
  "All",
  "Gaming",
  "Music",
  "Live",
  "Mixes",
  "React",
  "Next.js",
  "Programming",
  "Podcasts",
  "AI",
  "News",
  "Comedy",
  "Sports",
  "Technology",
  "Education",
  "Entertainment",
  "Science",
  "Travel",
  "Recently uploaded",
  "Watched",
]

export function FilterChips() {
  const [activeFilter, setActiveFilter] = useState("All")
  const scrollRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction) => {
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
      // Use a small buffer (1px) for float calculation errors
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
    }
  }

  // Initial check for arrows
  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [])

  return (
    <div className="sticky top-14 z-30 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-[#272727] w-full">
      <div className="relative px-4 py-3">
        {/* Left Arrow */}
        <div className={cn(
            "absolute left-0 top-0 bottom-0 z-10 flex items-center pl-2 pr-6 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f] to-transparent transition-opacity duration-200",
            showLeftArrow ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full hover:bg-[#272727] bg-[#0f0f0f] border border-[#272727] transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Chips Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-none scroll-smooth"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                activeFilter === filter
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-[#272727] text-white hover:bg-[#3f3f3f]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <div className={cn(
            "absolute right-0 top-0 bottom-0 z-10 flex items-center pl-6 pr-2 bg-gradient-to-l from-[#0f0f0f] via-[#0f0f0f] to-transparent transition-opacity duration-200",
            showRightArrow ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full hover:bg-[#272727] bg-[#0f0f0f] border border-[#272727] transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
