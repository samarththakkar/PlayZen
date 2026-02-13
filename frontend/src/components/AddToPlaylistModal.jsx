
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistService } from '@/lib/api-services';
import { useAuthStore } from '@/store/auth-store';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import { Plus, Check, Lock, Globe, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddToPlaylistModal({ isOpen, onClose, videoId }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistPrivacy, setNewPlaylistPrivacy] = useState('private'); // 'public', 'private'

  // Fetch user's playlists
  const { data: playlistsData, isLoading } = useQuery({
    queryKey: ['userPlaylists', user?._id],
    queryFn: () => playlistService.getUserPlaylists(user?._id),
    enabled: !!user?._id && isOpen,
  });

  const playlists = playlistsData?.data || [];

  // Mutation to create playlist
  const createPlaylistMutation = useMutation({
    mutationFn: (data) => playlistService.createPlaylist(data),
    onSuccess: (newPlaylist) => {
      queryClient.invalidateQueries(['userPlaylists']);
      setNewPlaylistName('');
      setShowCreateForm(false);
      
      // Automatically add video to the new playlist
      if (videoId) {
        addVideoMutation.mutate({ playlistId: newPlaylist.data._id, videoId });
      }
      toast.success('Playlist created');
    },
    onError: () => toast.error('Failed to create playlist'),
  });

  // Mutation to add video to playlist
  const addVideoMutation = useMutation({
    mutationFn: ({ playlistId, videoId }) => playlistService.addVideoToPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userPlaylists']);
      toast.success('Added to playlist');
    },
    onError: (error) => {
        // Handle case where video is already in playlist (if backend returns specific error)
        toast.error('Failed to add to playlist');
    }
  });

  // Mutation to remove video from playlist
  const removeVideoMutation = useMutation({
    mutationFn: ({ playlistId, videoId }) => playlistService.removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userPlaylists']);
      toast.success('Removed from playlist');
    },
    onError: () => toast.error('Failed to remove from playlist'),
  });

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylistMutation.mutate({
      name: newPlaylistName,
      description: '',
      isPublished: newPlaylistPrivacy === 'public'
    });
  };

  const togglePlaylist = (playlist) => {
    const isVideoInPlaylist = playlist.videos.some(v => v._id === videoId || v === videoId);
    
    if (isVideoInPlaylist) {
      removeVideoMutation.mutate({ playlistId: playlist._id, videoId });
    } else {
      addVideoMutation.mutate({ playlistId: playlist._id, videoId });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to...">
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {playlists.map((playlist) => {
               const isChecked = playlist.videos.some(v => v._id === videoId || v === videoId);
               return (
                <label 
                  key={playlist._id} 
                  className="flex items-center gap-3 p-2 hover:bg-[#272727] rounded-lg cursor-pointer group"
                >
                  <div className={`
                    w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
                    ${isChecked ? 'bg-[#3ea6ff] border-[#3ea6ff]' : 'border-gray-400 group-hover:border-white'}
                  `}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isChecked}
                      onChange={() => togglePlaylist(playlist)}
                    />
                    {isChecked && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                  </div>
                  <span className="flex-1 text-white text-sm font-medium truncate">{playlist.name}</span>
                  {playlist.isPublished ? (
                    <Globe className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </label>
               )
            })}
          </div>
        )}

        {!showCreateForm ? (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 py-2 px-1 text-white hover:bg-[#272727] rounded-lg transition-colors mt-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create new playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2">
            <Input
              label="Name"
              placeholder="Enter playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
              maxLength={150}
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Privacy</label>
              <select
                value={newPlaylistPrivacy}
                onChange={(e) => setNewPlaylistPrivacy(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#121212] border border-[#3f3f3f] rounded-lg text-white focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff]"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowCreateForm(false)}
                disabled={createPlaylistMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
                loading={createPlaylistMutation.isPending}
              >
                Create
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
