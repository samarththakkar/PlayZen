import apiClient from './api';

// Channel Services
export const channelService = {
  getChannelProfile: async (username) => {
    const response = await apiClient.get(`/users/channel/${username}`);
    return response.data;
  },
};

// Auth Services
export const authService = {
  register: async (data) => {
    const response = await apiClient.post('/users/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/users/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await apiClient.post('/users/reset-password', { email, otp, newPassword });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/users/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/current-user');
    return response.data;
  },

  updateAccount: async (data) => {
    const response = await apiClient.patch('/users/update-account', data);
    return response.data;
  },

  updateAvatar: async (avatar) => {
    const formData = new FormData();
    formData.append('avatar', avatar);
    const response = await apiClient.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCoverImage: async (coverImage) => {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    const response = await apiClient.patch('/users/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getWatchHistory: async () => {
    const response = await apiClient.get('/users/watch-history');
    return response.data;
  },
};

// Video Services
export const videoService = {
  getAllVideos: async (params) => {
    const response = await apiClient.get('/videos/get-all-videos', { params });
    return response.data;
  },

  getAllShorts: async (params) => {
    const response = await apiClient.get('/videos/get-all-shorts', { params });
    return response.data;
  },

  getVideoById: async (videoId) => {
    const response = await apiClient.get(`/videos/get-video/${videoId}`);
    return response.data;
  },

  uploadVideo: async (data) => {
    try {
      console.log('Uploading video with data:', {
        title: data.get('title'),
        description: data.get('description'),
        category: data.get('category'),
        hasVideo: !!data.get('videoFile'),
        hasThumbnail: !!data.get('thumbnail')
      });
      const response = await apiClient.post('/videos/upload-video', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error details:', error.response?.data || error.message);
      throw error;
    }
  },

  updateVideo: async (videoId, data) => {
    const response = await apiClient.patch(`/videos/update-video/${videoId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteVideo: async (videoId) => {
    const response = await apiClient.delete(`/videos/delete-video/${videoId}`);
    return response.data;
  },

  getUserVideos: async (username) => {
    const response = await apiClient.get(`/videos/user-videos/${username}`);
    return response.data;
  },

  togglePublish: async (videoId) => {
    const response = await apiClient.get(`/videos/is-published/${videoId}`);
    return response.data;
  },

  getStudioVideos: async () => {
    const response = await apiClient.get('/videos/studio-videos');
    return response.data;
  },
};

// Comment Services
export const commentService = {
  getComments: async (videoId) => {
    const response = await apiClient.get(`/comments/get-comments/${videoId}`);
    return response.data;
  },

  addComment: async (videoId, content) => {
    const response = await apiClient.post(`/comments/add-comment/${videoId}`, { content });
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await apiClient.patch(`/comments/update-comment/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await apiClient.delete(`/comments/delete-comment/${commentId}`);
    return response.data;
  },
};

// Like Services
export const likeService = {
  toggleVideoLike: async (videoId) => {
    const response = await apiClient.post(`/likes/like-video/${videoId}`);
    return response.data;
  },

  toggleCommentLike: async (commentId) => {
    const response = await apiClient.post(`/likes/like-comment/${commentId}`);
    return response.data;
  },

  getLikedVideos: async () => {
    const response = await apiClient.get('/likes/liked-videos');
    return response.data;
  },
};

// Subscription Services
export const subscriptionService = {
  toggleSubscription: async (channelId) => {
    const response = await apiClient.post(`/subscriptions/toggle/${channelId}`);
    return response.data;
  },

  getSubscribers: async (channelId) => {
    const response = await apiClient.get(`/subscriptions/subscribers/${channelId}`);
    return response.data;
  },

  getSubscribedChannels: async (subscriberId) => {
    const response = await apiClient.get(`/subscriptions/subscribed-channels/${subscriberId}`);
    return response.data;
  },
};

// Playlist Services
export const playlistService = {
  createPlaylist: async (data) => {
    const response = await apiClient.post('/playlists/create-playlist', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPlaylist: async (playlistId) => {
    const response = await apiClient.get(`/playlists/get-playlist/${playlistId}`);
    return response.data;
  },

  getUserPlaylists: async (userId) => {
    const response = await apiClient.get(`/playlists/user-playlists/${userId}`);
    return response.data;
  },

  addVideoToPlaylist: async (playlistId, videoId) => {
    const response = await apiClient.post(`/playlists/add-video/${playlistId}/${videoId}`);
    return response.data;
  },

  removeVideoFromPlaylist: async (playlistId, videoId) => {
    const response = await apiClient.post(`/playlists/remove-video/${playlistId}/${videoId}`);
    return response.data;
  },

  deletePlaylist: async (playlistId) => {
    const response = await apiClient.delete(`/playlists/delete-playlist/${playlistId}`);
    return response.data;
  },

  updatePlaylist: async (playlistId, data) => {
    const response = await apiClient.patch(`/playlists/update-playlist/${playlistId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Tweet Services
export const tweetService = {
  createTweet: async (content) => {
    const response = await apiClient.post('/tweets/create-tweet', { content });
    return response.data;
  },

  getUserTweets: async (userId) => {
    const response = await apiClient.get(`/tweets/user-tweets/${userId}`);
    return response.data;
  },

  updateTweet: async (tweetId, content) => {
    const response = await apiClient.patch(`/tweets/update-tweet/${tweetId}`, { content });
    return response.data;
  },

  deleteTweet: async (tweetId) => {
    const response = await apiClient.delete(`/tweets/delete-tweet/${tweetId}`);
    return response.data;
  },

  toggleLike: async (tweetId) => {
    const response = await apiClient.post(`/likes/like-tweet/${tweetId}`);
    return response.data;
  },
};