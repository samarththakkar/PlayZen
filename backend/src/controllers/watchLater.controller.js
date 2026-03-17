import { WatchLater } from "../models/watchLater.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addToWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const watchLater = await WatchLater.create({
        user: userId,
        video: videoId
    });

    return res.status(201).json(new ApiResponse(201, watchLater, "Video added to watch later successfully"));
});

export const removeFromWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const watchLater = await WatchLater.deleteOne({
        user: userId,
        video: videoId
    });

    return res.status(200).json(new ApiResponse(200, watchLater, "Video removed from watch later successfully"));
});

export const getWatchLaterVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const watchLaterVideos = await WatchLater.getPaginatedWatchLaterVideos({
        user: userId,
        page: req.query.page || 1,
        limit: req.query.limit || 50
    });

    return res.status(200).json(new ApiResponse(200, watchLaterVideos, "Watch later videos fetched successfully"));
});

export const toggleWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const existing = await WatchLater.findOne({
        user: userId,
        video: videoId
    });

    if (existing) {
        await WatchLater.deleteOne({ _id: existing._id });
        return res.status(200).json(new ApiResponse(200, { saved: false }, "Video removed from watch later"));
    } else {
        const entry = await WatchLater.create({ user: userId, video: videoId });
        return res.status(201).json(new ApiResponse(201, { saved: true, entry }, "Video added to watch later"));
    }
});

export const isVideoInWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const watchLater = await WatchLater.findOne({
        user: userId,
        video: videoId
    });

    return res.status(200).json(new ApiResponse(200, { saved: !!watchLater }, "Watch later status fetched"));
});

export const clearWatchLater = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    await WatchLater.deleteMany({ user: userId });

    return res.status(200).json(new ApiResponse(200, null, "Watch later cleared successfully"));
});

export const getWatchLaterCount = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const count = await WatchLater.countDocuments({ user: userId });

    return res.status(200).json(new ApiResponse(200, { count }, "Watch later count fetched"));
});
