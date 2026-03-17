import {Notification} from "../models/notifications.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Subscription} from "../models/subscription.model.js";
export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }
    const notifications = await Notification
    .find({ user: userId })
    .populate("video")
    .populate("tweet")
    .sort({ createdAt : -1})
    .limit(20);
    
    res.status(200).json({ notifications });
}
);
export const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    res.status(200).json({ unreadCount });
});

export const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    if(!notificationId){
        throw new ApiError(400, "Notification Id is required");
    }
    const result = await Notification.findByIdAndUpdate(
        notificationId,
        {isRead:true},
        {new:true});
    res.status(200).json({ message: `${result.nModified} notifications marked as read` });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401, "Unauthorized access");
    }
    const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
    );
    res.status(200).json({ message: `${result.nModified} All notifications marked as read` });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    if(!notificationId){
        throw new ApiError(400, "Notification Id is required");
    }
    const notification = await Notification.findByIdAndDelete(notificationId);
    if(!notification){
        throw new ApiError(404, "Notification not found");
    }
    res.status(200).json({ message: "Notification deleted successfully" });
});
// notification sending logic - can be called from other controllers 
// when a new video or tweet is created and if user is subscribed 
// that channel then only they get notification from that channel

export const sendNotification = async (channelId, type, videoId = null, tweetId = null) => {
    try {
        // Find all subscribers of this channel only
        const subscriptions = await Subscription.find({ channel: channelId });

        // No subscribers = no notifications needed
        if (!subscriptions.length) return;

        // Build one notification per subscriber
        const notifications = subscriptions.map((sub) => {
            const notificationData = {
                user: sub.subscriber,  // subscriber gets the notification
                type,
            };
            if (type === "new_video" && videoId) {
                notificationData.video = videoId;
            } else if (type === "new_tweet" && tweetId) {
                notificationData.tweet = tweetId;
            }
            return notificationData;
        });

        // Save all notifications at once
        await Notification.insertMany(notifications);

    } catch (error) {
        // Don't crash the main request if notification fails
        console.error("Notification sending failed:", error.message);
    }
};