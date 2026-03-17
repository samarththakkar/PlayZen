import axiosInstance from "./api";

// Autocomplete for search bar dropdown
export const autocomplete = async (query) => {
  try {
    const res = await axiosInstance.get("/search/autocomplete", {
      params: { query }
    });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

// Trending videos
export const getTrending = async (limit = 10) => {
  try {
    const res = await axiosInstance.get("/search/trending", {
      params: { limit }
    });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};
