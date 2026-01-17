'use client';

import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useSidebar } from '@/contexts/sidebar-context';

export default function MainLayout({ children }) {
  const { fetchCurrentUser, isLoading } = useAuthStore();
  const { isExpanded } = useSidebar();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-yt-black">
      <Header />
      <Sidebar />
      <main className={`pt-14 transition-all duration-200 ${isExpanded ? 'md:pl-60' : 'md:pl-[72px]'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yt-white"></div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}