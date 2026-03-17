import mongoose,{Schema} from "mongoose";

const watchHistorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        watchedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Indexes for faster queries
watchHistorySchema.index({ user: 1, watchedAt: -1 });  // for getWatchHistory
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });  // prevent duplicates

export const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);
