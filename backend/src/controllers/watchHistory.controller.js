import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { WatchHistory } from "../models/watchHistory.model.js";

const getWatchHistory = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "userId is required");
    }
    const watchHistory = await WatchHistory.find({ user: userId })
        .populate({
            path: "video",
            populate: { path: "owner", select: "username fullname avatar" }
        })
        .sort({ watchedAt: -1 })
        .limit(50);
    res.status(200).json(new ApiResponse(200, watchHistory, "Watch history fetched successfully"));
}
);

const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }
    const entry = await WatchHistory.findOneAndUpdate(
        { user: req.user._id, video: videoId },
        { watchedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(new ApiResponse(200, entry, "Watch history updated successfully"));
});

const clearWatchHistory = asyncHandler(async (req, res) => {
    await WatchHistory.deleteMany({ user: req.user._id });
    res.status(200).json(new ApiResponse(200, null, "Watch history cleared successfully"));
});

export {
    getWatchHistory,
    addToWatchHistory,
    clearWatchHistory
}
