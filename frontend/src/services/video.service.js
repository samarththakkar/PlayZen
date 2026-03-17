import axiosInstance from "./api";

// Get personalized feed for logged in users
export const getPersonalizedFeed = async (page = 1, limit = 20) => {
  try {
    const res = await axiosInstance.get("/recommendations/feed", {
      params: { page, limit }
    });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

// Get similar videos for watch page sidebar
export const getSimilarVideos = async (videoId, limit = 10) => {
  try {
    const res = await axiosInstance.get(`/recommendations/similar/${videoId}`, {
      params: { limit }
    });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

// Get continue watching list
export const getContinueWatching = async (limit = 10) => {
  try {
    const res = await axiosInstance.get("/watch-progress/continue-watching", {
      params: { limit }
    });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};
