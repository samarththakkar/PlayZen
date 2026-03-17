import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { WatchProgress } from "../models/watchProgress.model.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { updateUserInterests } from "./recommendation.controller.js";

// Save or update watch progress
// Call this from frontend every 5-10 seconds while video is playing
const saveWatchProgress = asyncHandler(async (req, res) => {
    const { videoId, watchedDuration, totalDuration } = req.body;
    // ... your existing validation ...

    const percentage = Math.round((watchedDuration / totalDuration) * 100);
    const isCompleted = percentage >= 90;

    const progress = await WatchProgress.findOneAndUpdate(
        { user: req.user._id, video: videoId },
        { $set: { watchedDuration, totalDuration, percentage, isCompleted, lastWatchedAt: new Date() } },
        { upsert: true, new: true }
    );

    // ✅ Update interests when user watches
    const video = await Video.findById(videoId).select("title category owner");
    if (video) {
        const action = isCompleted ? "complete" : "watch";
        await updateUserInterests(req.user._id, video, action);
    }

    res.status(200).json(new ApiResponse(200, progress, "Watch progress saved"));
});

// Get progress for a specific video
// Call this when video page loads to resume from where user left off
const getVideoProgress = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video ID is required");
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const progress = await WatchProgress.findOne({
        user: req.user._id,
        video: videoId
    });

    // Return 0 if no progress found — video not started yet
    if (!progress) {
        return res.status(200).json(
            new ApiResponse(200, { watchedDuration: 0, percentage: 0 }, "No progress found")
        );
    }

    res.status(200).json(
        new ApiResponse(200, progress, "Watch progress fetched")
    );
});

// Get continue watching list
// Returns all videos user has started but not completed
const getContinueWatching = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const progressList = await WatchProgress.find({
        user: req.user._id,
        isCompleted: false,
        watchedDuration: { $gt: 0 }    // must have watched at least something
    })
        .populate("video", "title thumbnail duration slug owner")
        .sort({ lastWatchedAt: -1 })    // most recently watched first
        .limit(parseInt(limit));

    // Filter out deleted videos
    const filtered = progressList.filter((p) => p.video !== null);

    res.status(200).json(
        new ApiResponse(200, filtered, "Continue watching fetched")
    );
});

// Delete progress for a video — user manually removes from continue watching
const deleteWatchProgress = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video ID is required");

    await WatchProgress.findOneAndDelete({
        user: req.user._id,
        video: videoId
    });

    res.status(200).json(
        new ApiResponse(200, {}, "Watch progress removed")
    );
});

export {
    saveWatchProgress,
    getVideoProgress,
    getContinueWatching,
    deleteWatchProgress
};