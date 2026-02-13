
import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, Search, Mic, Video, User, Bell, X, LogOut, Settings, Tv } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuthStore } from "@/store/auth-store"
import Button from "./common/Button"

export function Header() {
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
      setSearchQuery(finalTranscript || interimTranscript)

      if (finalTranscript) {
        setSearchQuery(finalTranscript)
        setIsListening(false)
        navigate(`/search?q=${encodeURIComponent(finalTranscript)}`)
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setTranscript("")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg-primary border-b border-border-default h-14 w-full">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-bg-hover transition-colors text-text-primary"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-1">
              <img
                src="/Logo.png"
                alt="PlayZen"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-text-primary text-xl font-semibold tracking-tight">PlayZen</span>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 justify-center">
            <div className="flex items-center w-full gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex items-center group">
                <div className="relative w-full flex">
                  <div className={`absolute left-4 top-2.5 transition-opacity duration-200 ${searchQuery ? 'opacity-0' : 'opacity-100'} pointer-events-none`}>
                    <Search className="w-5 h-5 text-text-muted hidden group-focus-within:block" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-4 group-focus-within:pl-10 pr-12 bg-surface-primary border border-border-default rounded-l-full text-text-primary placeholder:text-text-muted focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-inner"
                  />
                  {searchQuery && (
                     <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-0 top-0 h-10 px-3 text-text-muted hover:text-text-primary transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-10 px-6 bg-surface-secondary border border-l-0 border-border-default rounded-r-full hover:bg-bg-active transition-colors flex items-center justify-center tooltip-container"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-text-primary" />
                </button>
              </form>
              
              <button
                onClick={handleVoiceSearch}
                className="p-2.5 bg-surface-primary hover:bg-surface-secondary rounded-full transition-colors flex-shrink-0 border border-transparent hover:border-border-default"
                aria-label="Search with voice"
              >
                <Mic className="w-5 h-5 text-text-primary" />
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-bg-hover transition-colors text-text-primary"
                  aria-label="Create"
                >
                  <Video className="w-6 h-6" />
                  <span className="text-sm font-medium">Create</span>
                </Link>
                
                <button
                  className="p-2.5 rounded-full hover:bg-bg-hover transition-colors text-text-primary relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full border-2 border-bg-primary"></span>
                </button>

                <div className="relative ml-2">
                  <button
                    className="relative block"
                    aria-label="Profile"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullname || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-border-default"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>


                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-72 bg-surface-secondary border border-border-default rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-border-default flex items-start gap-3">
                           {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullname}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium text-lg">
                              {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-text-primary truncate">{user?.fullname}</div>
                            <div className="text-sm text-text-secondary truncate">{user?.email}</div>
                            <Link 
                              to={`/channel/${user?.username}`} 
                              className="text-brand-blue text-sm mt-1 inline-block hover:text-blue-300"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              View your channel
                            </Link>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/studio"
                            className="flex items-center gap-3 px-4 py-2 text-text-primary hover:bg-bg-active transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Tv className="w-5 h-5 text-text-secondary" />
                            <span>YouTube Studio</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-text-primary hover:bg-bg-active transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings className="w-5 h-5 text-text-secondary" />
                            <span>Settings</span>
                          </Link>
                        </div>

                        <div className="border-t border-border-default my-1" />

                        <div className="py-2">
                           <button
                            onClick={() => {
                              setShowProfileMenu(false)
                              handleLogout()
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-text-primary hover:bg-bg-active transition-colors text-left"
                          >
                            <LogOut className="w-5 h-5 text-text-secondary" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="rounded-full px-4 gap-2 border border-border-default bg-bg-primary text-brand-blue hover:bg-brand-blue/10">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Sign in</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Voice Search Overlay */}
      {isListening && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#212121] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-lg w-full mx-4">
             <div className="flex justify-between w-full items-center">
               <h3 className="text-xl font-medium text-white">Listening...</h3>
               <button onClick={() => setIsListening(false)} className="p-2 hover:bg-[#3f3f3f] rounded-full text-gray-400 hover:text-white">
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center animate-pulse">
               <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                 <Mic className="w-8 h-8 text-white" />
               </div>
             </div>

             <div className="text-gray-300 text-lg min-h-[1.5em] text-center">
               {transcript || "Speak now..."}
             </div>
          </div>
        </div>
      )}
    </>
  )
}