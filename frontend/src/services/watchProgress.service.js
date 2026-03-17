import axiosInstance from "./api";

export const saveWatchProgress = async (videoId, watchedDuration, totalDuration) => {
  try {
    const res = await axiosInstance.post("/watch-progress", {
      videoId, watchedDuration, totalDuration
    });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const getVideoProgress = async (videoId) => {
  try {
    const res = await axiosInstance.get(`/watch-progress/${videoId}`);
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};
