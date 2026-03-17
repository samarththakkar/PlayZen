import axiosInstance from "./api";

// Check if user has liked something on page load
export const getIsLiked = async (params) => {
  try {
    const res = await axiosInstance.get("/likes/is-liked", { params });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const toggleVideoLike = async (videoId) => {
  try {
    const res = await axiosInstance.post(`/likes/like-video/${videoId}`);
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const toggleCommentLike = async (commentId) => {
  try {
    const res = await axiosInstance.post(`/likes/like-comment/${commentId}`);
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const toggleTweetLike = async (tweetId) => {
  try {
    const res = await axiosInstance.post(`/likes/like-tweet/${tweetId}`);
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};
