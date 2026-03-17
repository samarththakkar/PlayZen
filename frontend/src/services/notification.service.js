import axiosInstance from "./api";

export const getUnreadCount = async (userId) => {
  try {
    const res = await axiosInstance.get(`/notifications/unread-count`);
    return { data: res.data.unreadCount || 0, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const res = await axiosInstance.post(`/notifications/${notificationId}/mark-as-read`);
    return { data: res.data.message, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};

export const markAllAsRead = async (userId) => {
  try {
    const res = await axiosInstance.post(`/notifications/mark-all-as-read`);
    return { data: res.data.message, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data?.message || "Something went wrong" };
  }
};
