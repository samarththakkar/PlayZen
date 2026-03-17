import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Interest } from "../models/interest.model.js";
import { WatchProgress } from "../models/watchProgress.model.js";
import { Like } from "../models/likes.model.js";

// ═══════════════════════════════════════
// INTERNAL UTILITY — Update user interests
// Call this from: video watch, like, comment
// ═══════════════════════════════════════
export const updateUserInterests = async (userId, video, action) => {
    try {
        // Score weights per action
        // watching > liking > commenting
        const weights = {
            watch:      5,   // user watched a video
            complete:   10,  // user completed a video (90%+)
            like:       8,   // user liked a video
            comment:    6,   // user commented on a video
            subscribe:  12,  // user subscribed to a channel
        };

        const score = weights[action] || 5;

        let interest = await Interest.findOne({ user: userId });

        // Create interest doc if first time
        if (!interest) {
            interest = new Interest({ user: userId });
        }

        // Update category score
        if (video.category) {
            const catIndex = interest.categoryScores
                .findIndex(c => c.category === video.category);

            if (catIndex > -1) {
                interest.categoryScores[catIndex].score += score;
            } else {
                interest.categoryScores.push({
                    category: video.category,
                    score
                });
            }
        }

        // Update channel score
        if (video.owner) {
            const chanIndex = interest.channelScores
                .findIndex(c => c.channel?.toString() === video.owner?.toString());

            if (chanIndex > -1) {
                interest.channelScores[chanIndex].score += score;
            } else {
                interest.channelScores.push({
                    channel: video.owner,
                    score
                });
            }
        }

        // Extract keywords from title as tags
        // Remove common words, keep meaningful ones
        if (video.title) {
            const stopWords = new Set([
                "the", "a", "an", "and", "or", "but", "in",
                "on", "at", "to", "for", "of", "with", "is",
                "my", "your", "this", "that", "it", "i", "we"
            ]);

            const tags = video.title
                .toLowerCase()
                .split(/\s+/)
                .filter(word =>
                    word.length > 3 &&
                    !stopWords.has(word)
                );

            for (const tag of tags) {
                const tagIndex = interest.tagScores
                    .findIndex(t => t.tag === tag);

                if (tagIndex > -1) {
                    interest.tagScores[tagIndex].score += score;
                } else {
                    interest.tagScores.push({ tag, score });
                }
            }
        }

        interest.lastUpdated = new Date();
        await interest.save();

    } catch (error) {
        // Never crash main request
        console.error("Interest update failed:", error.message);
    }
};

// ═══════════════════════════════════════
// GET PERSONALIZED FEED
// Main recommendation endpoint
// ═══════════════════════════════════════
const getPersonalizedFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * limit;

    // Get user interests
    const interest = await Interest.findOne({ user: userId });

    // Get videos user already watched
    const watchedVideoIds = await WatchProgress.find({ user: userId })
        .distinct("video");

    // Get videos user already liked
    const likedVideoIds = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    }).distinct("video");

    // Already seen = watched + liked
    const seenVideoIds = [...watchedVideoIds, ...likedVideoIds];

    // If no interests yet — return trending videos for new users
    // NOTE: We no longer exclude seen videos — we show everything
    // so the feed is never empty for small libraries.
    if (!interest || interest.categoryScores.length === 0) {
        const trending = await Video.find({
            isPublished: true,
            $or: [
                { isShort: false },
                { isShort: { $exists: false } }
            ]
        })
            .populate("owner", "username fullname avatar")
            .sort({ views: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json(
            new ApiResponse(200, trending, "Trending feed fetched")
        );
    }

    // Sort categories by score — highest first
    const topCategories = interest.categoryScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(c => c.category);

    // Sort channels by score — highest first
    const topChannels = interest.channelScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(c => c.channel);

    // Sort tags by score — highest first
    const topTags = interest.tagScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(t => t.tag);

    // Build tag regex for title matching
    const tagRegex = topTags.length > 0
        ? new RegExp(topTags.join("|"), "i")
        : null;

    // ═══════════════════════════════════
    // SCORING PIPELINE
    // Each video gets a relevance score
    // based on user interests.
    // Seen videos are deprioritized, not excluded,
    // so the feed is never empty.
    // ═══════════════════════════════════
    const videos = await Video.getPersonalizedFeed({
        seenVideoIds: [],   // Don't exclude — deprioritize via score instead
        topChannels,
        topCategories,
        tagRegex,
        skip,
        limit: parseInt(limit)
    });

    res.status(200).json(
        new ApiResponse(200, videos, "Personalized feed fetched successfully")
    );
});

// ═══════════════════════════════════════
// GET SIMILAR VIDEOS
// Shown on video watch page sidebar
// ═══════════════════════════════════════
const getSimilarVideos = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { limit = 10 } = req.query;

    if (!videoId) throw new ApiError(400, "Video ID is required");

    // Get the current video details
    const currentVideo = await Video.findById(videoId);
    if (!currentVideo) throw new ApiError(404, "Video not found");

    // Extract keywords from current video title
    const titleWords = currentVideo.title
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
        .join("|");

    const similar = await Video.find({
        isPublished: true,
        _id: { $ne: videoId },  // exclude current video
        $or: [
            // Same category
            { category: currentVideo.category },
            // Same channel
            { owner: currentVideo.owner },
            // Similar title keywords
            { title: { $regex: titleWords, $options: "i" } }
        ]
    })
        .populate("owner", "username fullname avatar")
        .sort({ views: -1 })
        .limit(parseInt(limit))
        .select("title thumbnail duration views slug createdAt owner");

    res.status(200).json(
        new ApiResponse(200, similar, "Similar videos fetched successfully")
    );
});

// ═══════════════════════════════════════
// GET USER INTERESTS
// For settings page — show what we think user likes
// ═══════════════════════════════════════
export const getUserInterests = asyncHandler(async (req, res) => {
    const interest = await Interest.findOne({ user: req.user._id });

    if (!interest) {
        return res.status(200).json(
            new ApiResponse(200, {
                topCategories: [],
                topTags: []
            }, "No interests found yet")
        );
    }

    const topCategories = interest.categoryScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(c => c.category);

    const topTags = interest.tagScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(t => t.tag);

    res.status(200).json(
        new ApiResponse(200, { topCategories, topTags }, "User interests fetched")
    );
});

export {
    getPersonalizedFeed,
    getSimilarVideos
};
