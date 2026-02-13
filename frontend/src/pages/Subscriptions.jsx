
import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/lib/api-services';
import { useAuthStore } from '@/store/auth-store';
import MainLayout from '@/components/MainLayout';
import { Link } from 'react-router-dom';

export default function Subscriptions() {
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['subscribedChannels', user?._id],
    queryFn: () => subscriptionService.getSubscribedChannels(user?._id || ''),
    enabled: isAuthenticated && !!user?._id,
  });

  const subscriptions = Array.isArray(data?.data) ? data.data : [];

  return (
    <MainLayout>
      <div className="bg-[#0f0f0f] min-h-screen px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-6">Subscriptions</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-32 h-32 bg-gray-800/50 rounded-full mx-auto"></div>
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center p-8 bg-gray-800/30 rounded-xl">
            <p className="text-white text-xl mb-2">No subscriptions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {subscriptions.map((channel) => (
              <Link key={channel._id} to={`/channel/${channel.username}`} className="text-center block hover:opacity-80 transition-opacity">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-2 relative">
                  {channel.avatar ? (
                    <img src={channel.avatar} alt={channel.fullname} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold">
                      {channel.fullname?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-white font-medium">{channel.fullname}</p>
                <p className="text-gray-400 text-sm">@{channel.username}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
