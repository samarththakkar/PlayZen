import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweets.model.js";
import { Like } from "../models/likes.model.js";
import { isValidObjectId } from "mongoose";
import { sendNotification } from "./notification.controller.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Text is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    // ✅ Notify all subscribers about new tweet
    await sendNotification(req.user._id, "new_tweet", null, tweet._id);

    res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")  // ✅ data before message
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweet_id } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Text is required");
    }
    if (!isValidObjectId(tweet_id)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweet_id);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");  // ✅ 404 not 500
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    // ✅ Removed double update — only use findByIdAndUpdate
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweet_id,
        { $set: { content } },
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")  // ✅ data before message
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweet_id } = req.params;

    if (!isValidObjectId(tweet_id)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweet_id);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");  // ✅ 404 not 500
    }

    // ✅ Ownership check — prevent other users from deleting
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // ✅ Clean up related likes too
    await Promise.all([
        Tweet.findByIdAndDelete(tweet_id),
        Like.deleteMany({ tweet: tweet_id })
    ]);

    res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")  // ✅ data before message
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        throw new ApiError(400, "User ID is required");
    }

    if (!isValidObjectId(user_id)) {  // ✅ Added validation
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.getUserTweetsWithOwner(user_id);

    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    );
});

const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Number(limit));

    // ✅ Removed isDeleted filter — field doesn't exist in Tweet model
    const tweets = await Tweet.getPaginatedTweets({
        page: pageNumber,
        limit: limitNumber
    });

    res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    );
});

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets
};
