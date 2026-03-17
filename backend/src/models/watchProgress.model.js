import mongoose, { Schema } from "mongoose";

const watchProgressSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        // How many seconds into the video the user stopped
        watchedDuration: {
            type: Number,
            default: 0      // in seconds e.g. 142 = 2min 22sec
        },
        // Total duration of the video in seconds
        totalDuration: {
            type: Number,
            default: 0
        },
        // Percentage watched e.g. 75 = 75% watched
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        // True if user watched more than 90% of video
        isCompleted: {
            type: Boolean,
            default: false
        },
        // Last time user watched this video
        lastWatchedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// One progress record per user per video
watchProgressSchema.index({ user: 1, video: 1 }, { unique: true });
// For fetching continue watching list sorted by recent
watchProgressSchema.index({ user: 1, lastWatchedAt: -1 });

export const WatchProgress = mongoose.model("WatchProgress", watchProgressSchema);