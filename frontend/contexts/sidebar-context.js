"use client"

import { createContext, useContext, useState } from "react"

const SidebarContext = createContext(undefined)

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSidebar = () => setIsExpanded((prev) => !prev)
  const setExpanded = (expanded) => setIsExpanded(expanded)

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}