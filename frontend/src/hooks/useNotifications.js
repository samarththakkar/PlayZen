import { useState, useEffect } from "react";
import { getUnreadCount, markAsRead, markAllAsRead } from "../services/notification.service.js";

const useNotifications = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchCount = async () => {
      const { data } = await getUnreadCount(userId);
      if (data) setUnreadCount(data.unreadCount || data.count); // adjusting for potential backend variations
    };
    fetchCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markRead = async (notificationId) => {
    await markAsRead(notificationId);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await markAllAsRead(userId);
    setUnreadCount(0);
  };

  return { unreadCount, markRead, markAllRead };
};

export default useNotifications;
