import mongoose,{ Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["new_video", "new_tweet"],
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });  // for getUserNotifications
notificationSchema.index({ user: 1, isRead: 1 });       // for getUnreadCount

// Validation — ensure video exists for new_video type
// and tweet exists for new_tweet type
notificationSchema.pre("save", function (next) {
    if (this.type === "new_video" && !this.video) {
        return next(new Error("video is required for type new_video"));
    }
    if (this.type === "new_tweet" && !this.tweet) {
        return next(new Error("tweet is required for type new_tweet"));
    }
    next();
});

export const Notification = mongoose.model("Notification", notificationSchema);
