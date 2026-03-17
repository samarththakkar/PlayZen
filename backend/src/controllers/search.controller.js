import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";

// Main search — searches videos, users, tweets all at once
const search = asyncHandler(async (req, res) => {
    const { query, type = "all", page = 1, limit = 10 } = req.query;

    if (!query?.trim()) throw new ApiError(400, "Search query is required");

    const searchRegex = { $regex: query.trim(), $options: "i" };
    const skip = (page - 1) * limit;

    const results = {};

    // Search videos
    if (type === "all" || type === "videos") {
        results.videos = await Video.find({
            isPublished: true,
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ]
        })
            .populate("owner", "username fullname avatar")
            .sort({ views: -1 })    // most viewed first
            .skip(skip)
            .limit(parseInt(limit))
            .select("title thumbnail duration views createdAt slug owner");
    }

    // Search users/channels
    if (type === "all" || type === "users") {
        results.users = await User.find({
            $or: [
                { username: searchRegex },
                { fullname: searchRegex }
            ]
        })
            .skip(skip)
            .limit(parseInt(limit))
            .select("username fullname avatar");
    }

    // Search tweets
    if (type === "all" || type === "tweets") {
        results.tweets = await Tweet.find({
            content: searchRegex
        })
            .populate("owner", "username fullname avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
    }

    res.status(200).json(
        new ApiResponse(200, results, "Search results fetched successfully")
    );
});

// Autocomplete — fast lightweight search for search bar dropdown
// Only searches video titles and usernames
const autocomplete = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query?.trim()) {
        return res.status(200).json(
            new ApiResponse(200, [], "No query provided")
        );
    }

    const searchRegex = { $regex: `^${query.trim()}`, $options: "i" };

    // Run both searches in parallel for speed
    const [videos, users] = await Promise.all([
        Video.find({ isPublished: true, title: searchRegex })
            .limit(5)
            .select("title slug thumbnail"),

        User.find({ username: searchRegex })
            .limit(3)
            .select("username fullname avatar")
    ]);

    const suggestions = [
        ...videos.map((v) => ({
            type: "video",
            label: v.title,
            slug: v.slug,
            thumbnail: v.thumbnail
        })),
        ...users.map((u) => ({
            type: "user",
            label: u.username,
            fullname: u.fullname,
            avatar: u.avatar
        }))
    ];

    res.status(200).json(
        new ApiResponse(200, suggestions, "Autocomplete results fetched")
    );
});

// Trending searches — most viewed videos in last 7 days
const getTrending = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Video.find({
        isPublished: true,
        createdAt: { $gte: sevenDaysAgo }
    })
        .sort({ views: -1 })
        .limit(parseInt(limit))
        .select("title slug thumbnail views owner")
        .populate("owner", "username fullname avatar");

    res.status(200).json(
        new ApiResponse(200, trending, "Trending videos fetched")
    );
});

export {
    search,
    autocomplete,
    getTrending
};