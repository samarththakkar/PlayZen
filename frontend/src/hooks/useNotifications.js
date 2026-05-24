import { useState, useEffect } from "react";
import { getUnreadCount, markAsRead, markAllAsRead } from "../services/notification.service.js";
import { initSocket, disconnectSocket } from "../services/socket.js";
import toast from "../utils/toast";

const useNotifications = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      disconnectSocket();
      return;
    }

    const fetchCount = async () => {
      const { data } = await getUnreadCount(userId);
      if (data !== null) {
        setUnreadCount(data);
      }
    };
    fetchCount();

    const socket = initSocket(userId);

    const handleNewNotification = (notification) => {
      console.log("Socket notification received:", notification);
      setUnreadCount((prev) => prev + 1);

      const event = new CustomEvent("new-notification-received", {
        detail: notification,
      });
      window.dispatchEvent(event);

      let message = "You have a new notification!";
      let icon = "🔔";

      if (notification.type === "new_video" && notification.video) {
        const ownerName = notification.video.owner?.fullName || notification.video.owner?.username || "Someone";
        const title = notification.video.title;
        message = `${ownerName} uploaded a new video: "${title}"`;
        icon = "🎥";
      } else if (notification.type === "new_tweet" && notification.tweet) {
        const ownerName = notification.tweet.owner?.fullName || notification.tweet.owner?.username || "Someone";
        const content = notification.tweet.content || "";
        const snippet = content.length > 50 ? content.substring(0, 50) + "..." : content;
        message = `${ownerName} posted a tweet: "${snippet}"`;
        icon = "🐦";
      }

      toast(message, {
        icon,
        duration: 5000,
        position: "bottom-right",
        style: {
          background: "rgba(24, 24, 27, 0.95)",
          color: "#f4f4f5",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          fontSize: "0.9rem",
          padding: "12px 16px",
        },
      });
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [userId]);

  const markRead = async (notificationId) => {
    await markAsRead(notificationId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await markAllAsRead(userId);
    setUnreadCount(0);
  };

  return { unreadCount, markRead, markAllRead, setUnreadCount };
};

export default useNotifications;

