import axiosInstance from "./api";

// Get subscription status + subscriber count on page load
export const getSubscriptionStatus = async (channelId) => {
  try {
    const res = await axiosInstance.get(`/subscriptions/status/${channelId}`);
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const toggleSubscription = async (channelId) => {
  try {
    const res = await axiosInstance.post(`/subscriptions/toggle/${channelId}`);
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const getSubscribedChannels = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/subscriptions/channels", { params });
    return { data: res.data.data, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};
