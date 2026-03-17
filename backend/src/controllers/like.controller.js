import { Like } from "../models/likes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";
import { updateUserInterests } from "./recommendation.controller.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video id is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // Unlike
        await Like.findByIdAndDelete(existingLike._id);

        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            // ✅ $max ensures likesCount never goes below 0
            { $inc: { likesCount: -1 } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, {
                likesCount: Math.max(0, updatedVideo.likesCount),
                isLiked: false  // ✅ tell frontend current like status
            }, "Video unliked successfully")
        );
    }

    // Like
    await Like.create({ video: videoId, likedBy: req.user._id });

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { likesCount: 1 } },
        { new: true }
    );

    // ✅ Update user interests when video is liked
    await updateUserInterests(req.user._id, video, "like");

    return res.status(200).json(
        new ApiResponse(200, {
            likesCount: updatedVideo.likesCount,
            isLiked: true  // ✅ tell frontend current like status
        }, "Video liked successfully")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) throw new ApiError(400, "Comment id is required");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $inc: { likesCount: -1 } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, {
                likesCount: Math.max(0, updatedComment.likesCount),
                isLiked: false  // ✅ like status
            }, "Comment unliked successfully")
        );
    }

    await Like.create({ comment: commentId, likedBy: req.user._id });

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { likesCount: 1 } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, {
            likesCount: updatedComment.likesCount,
            isLiked: true  // ✅ like status
        }, "Comment liked successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) throw new ApiError(400, "Tweet id is required");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { likesCount: -1 } },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, {
                likesCount: Math.max(0, updatedTweet.likesCount),
                isLiked: false  // ✅ like status
            }, "Tweet unliked successfully")
        );
    }

    await Like.create({ tweet: tweetId, likedBy: req.user._id });

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $inc: { likesCount: 1 } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, {
            likesCount: updatedTweet.likesCount,
            isLiked: true  // ✅ like status
        }, "Tweet liked successfully")
    );
});

// ✅ Also add getIsLiked — frontend needs to know
// on page load if user has already liked something
const getIsLiked = asyncHandler(async (req, res) => {
    const { videoId, commentId, tweetId } = req.query;

    if (!videoId && !commentId && !tweetId) {
        throw new ApiError(400, "At least one id is required");
    }

    const query = { likedBy: req.user._id };
    if (videoId) query.video = videoId;
    if (commentId) query.comment = commentId;
    if (tweetId) query.tweet = tweetId;

    const like = await Like.findOne(query);

    return res.status(200).json(
        new ApiResponse(200, { isLiked: !!like }, "Like status fetched")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Number(limit));

    const likedVideos = await Like.getPaginatedLikedVideos({
        likedBy: req.user._id,
        page: pageNumber,
        limit: limitNumber
    });

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getIsLiked  // ✅ export new function
};
