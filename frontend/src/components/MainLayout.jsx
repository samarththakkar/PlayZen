
import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import Skeleton from './common/Skeleton';

export default function MainLayout({ children }) {
  const { fetchCurrentUser, isLoading: isAuthLoading } = useAuthStore();
  const { isExpanded } = useSidebar();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isAuthLoading) {
     return (
        <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
           <div className="h-14 border-b border-[#303030] bg-[#0f0f0f]" />
           <div className="flex flex-1">
              <div className="w-[72px] border-r border-[#303030] bg-[#0f0f0f]" />
              <div className="flex-1 p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                       <div key={i} className="flex flex-col gap-2">
                          <Skeleton height="200px" width="100%" variant="rectangular" />
                          <div className="flex gap-2">
                             <Skeleton height="36px" width="36px" variant="circular" />
                             <div className="flex-1 space-y-2">
                                <Skeleton height="20px" width="80%" />
                                <Skeleton height="16px" width="60%" />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <Header />
      <Sidebar />
      <div className="flex flex-1 pt-14">
        {/* Sidebar Space Placeholder - The actual sidebar is fixed */}
        <div 
           className={cn(
              "flex-shrink-0 transition-all duration-300 hidden md:block",
              isExpanded ? "w-60" : "w-[72px]"
           )} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay (if handled by Sidebar component, fine, otherwise add here) */}
    </div>
  );
}