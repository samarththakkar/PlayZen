
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import toast from 'react-hot-toast';
import { Camera, Upload } from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '');

  const updateAccountMutation = useMutation({
    mutationFn: (data) => authService.updateAccount(data),
    onSuccess: (response) => {
      const updatedUser = response.data.data || response.data;
      setUser(updatedUser);
      setFullname(updatedUser.fullname);
      setEmail(updatedUser.email);
      toast.success('Account updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update account');
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (file) => authService.updateAvatar(file),
    onSuccess: (response) => {
      console.log('Avatar update response:', response);
      const updatedUser = response.data.data || response.data;
      console.log('Updated user after avatar:', updatedUser);
      setUser(updatedUser);
      setAvatarPreview(updatedUser.avatar);
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
      toast.success('Avatar updated successfully');
      // window.location.reload(); // Removed reload for better UX
    },
    onError: (error) => {
      console.error('Avatar update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update avatar');
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: (file) => authService.updateCoverImage(file),
    onSuccess: (response) => {
      console.log('Cover update response:', response);
      const updatedUser = response.data.data || response.data;
      console.log('Updated user after cover:', updatedUser);
      setUser(updatedUser);
      setCoverPreview(updatedUser.coverImage);
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
      toast.success('Cover image updated successfully');
      // window.location.reload(); // Removed reload for better UX
    },
    onError: (error) => {
      console.error('Cover update error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update cover image');
    },
  });

  const handleAccountUpdate = (e) => {
    e.preventDefault();
    updateAccountMutation.mutate({ fullname, email });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      updateAvatarMutation.mutate(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      updateCoverMutation.mutate(file);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0f0f0f] pt-[70px]">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

          {/* Cover Image */}
          <div className="mb-8">
            <label className="block text-white text-sm font-medium mb-3">Cover Image</label>
            <div className="relative h-48 bg-[#272727] rounded-lg overflow-hidden group">
              {coverPreview && (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                  <span className="text-white text-sm">Upload Cover Image</span>
                </div>
              </label>
            </div>
          </div>

          {/* Avatar */}
          <div className="mb-8">
            <label className="block text-white text-sm font-medium mb-3">Profile Picture</label>
            <div className="relative w-32 h-32 rounded-full bg-[#272727] overflow-hidden group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-medium bg-gradient-to-br from-red-600 to-red-500">
                  {user?.fullname?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <Camera className="w-8 h-8 text-white" />
              </label>
            </div>
          </div>

          {/* Account Details */}
          <form onSubmit={handleAccountUpdate} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg border border-[#3f3f3f] focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg border border-[#3f3f3f] focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-3 bg-[#1a1a1a] text-gray-500 rounded-lg border border-[#3f3f3f] cursor-not-allowed"
              />
              <p className="text-gray-500 text-xs mt-1">Username cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={updateAccountMutation.isPending}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateAccountMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
