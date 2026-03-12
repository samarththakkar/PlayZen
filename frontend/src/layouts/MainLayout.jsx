import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import './MainLayout.css';

const MainLayout = () => {
  // Mobile-first: Sidebar defaults to closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-layout">
      {/* 1. Global Header (Fixed at top) */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* 2. Horizontal body containing Sidebar + Main View */}
      <div className={`app-body ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="app-main-content">
          <div className="page-wrapper">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. Mobile Bottom navigation (Only visible < 768px via pure CSS/Component) */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
