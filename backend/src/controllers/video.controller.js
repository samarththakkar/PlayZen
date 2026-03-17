import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import slugify from "slugify";
import { sendNotification } from "./notification.controller.js";
import { Like } from "../models/likes.model.js";
import { Comment } from "../models/comments.model.js";
import { Notification } from "../models/notifications.model.js";
import { Subscription } from "../models/subscription.model.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description, category, isShort } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath, "video");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

    if (!videoFile) throw new ApiError(500, "Failed to upload video file");
    if (!thumbnail) throw new ApiError(500, "Failed to upload thumbnail");

    const slug = slugify(title, { lower: true, trim: true });

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        category: category || "Other",
        owner: req.user._id,
        isPublished: true,
        isShort: isShort === "true" || isShort === true,
        views: 0,
        slug
    });

    // ✅ Notify all subscribers about new video
    await sendNotification(req.user._id, "new_video", video._id);

    res.status(201).json(
        new ApiResponse(201, video, "Video uploaded successfully")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
        category
    } = req.query;

    const searchQuery = query?.trim() || "";

    const filter = {
        isPublished: true,
        $or: [
            { isShort: false },
            { isShort: { $exists: false } }
        ]
    };

    if (searchQuery) {
        filter.$and = [
            {
                $or: [
                    { title: { $regex: searchQuery, $options: "i" } },
                    { description: { $regex: searchQuery, $options: "i" } },
                    { category: { $regex: searchQuery, $options: "i" } }
                ]
            }
        ];
    }

    if (userId) filter.owner = userId;
    if (category) filter.category = category;

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

    const videos = await Video.find(filter)
        .populate("owner", "username fullname avatar coverImage")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                docs: videos,
                totalVideos,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalVideos / parseInt(limit))
            },
            videos.length ? "Videos fetched successfully" : "No videos found"
        )
    );
});

const getAllShorts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, userId } = req.query;

    const filter = { isPublished: true, isShort: true };
    if (userId) filter.owner = userId;

    const shorts = await Video.find(filter)
        .populate("owner", "username fullname avatar coverImage")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalShorts = await Video.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                docs: shorts,
                totalShorts,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalShorts / parseInt(limit))
            },
            shorts.length ? "Shorts fetched successfully" : "No shorts found"
        )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video id is required");

    const video = await Video.findById(videoId)
        .populate("owner", "username fullname avatar coverImage");

    if (!video) throw new ApiError(404, "Video not found");
    if (!video.isPublished) throw new ApiError(403, "Video is not published");

    // ✅ Increment view count every time video is fetched
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const isPublished = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video id is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    // ✅ Fixed — data comes before message in ApiResponse
    res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${video.isPublished ? "published" : "unpublished"} successfully`
        )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video id is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete files from Cloudinary
    const videoPublicId = extractPublicId(video.videoFile);
    const thumbnailPublicId = extractPublicId(video.thumbnail);

    await deleteFromCloudinary(videoPublicId, "video");
    await deleteFromCloudinary(thumbnailPublicId, "image");

    // ✅ Clean up all related data
    await Promise.all([
        Video.findByIdAndDelete(videoId),
        Like.deleteMany({ video: videoId }),
        Comment.deleteMany({ video: videoId }),
        Notification.deleteMany({ video: videoId })
    ]);

    res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(400, "Video id is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const { title, description, category } = req.body;

    if (title) {
        video.title = title;
        video.slug = slugify(title, { lower: true, trim: true });
    }
    if (description) video.description = description;
    if (category) video.category = category;

    // ✅ Delete old video from Cloudinary before uploading new one
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    if (videoLocalPath) {
        const oldVideoPublicId = extractPublicId(video.videoFile);
        await deleteFromCloudinary(oldVideoPublicId, "video");

        const uploadedVideo = await uploadOnCloudinary(videoLocalPath, "video");
        video.videoFile = uploadedVideo.url;
        video.duration = uploadedVideo.duration;
    }

    // ✅ Delete old thumbnail from Cloudinary before uploading new one
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (thumbnailLocalPath) {
        const oldThumbnailPublicId = extractPublicId(video.thumbnail);
        await deleteFromCloudinary(oldThumbnailPublicId, "image");

        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");
        video.thumbnail = uploadedThumbnail.url;
    }

    await video.save();

    // ✅ Fixed — data before message
    res.status(200).json(
        new ApiResponse(200, video, "Video details updated successfully")
    );
});

const userVideos = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!username) throw new ApiError(400, "Username is required");

    const videos = await Video.getPaginatedUserVideos({
        username,
        page: parseInt(page),
        limit: parseInt(limit)
    });

    res.status(200).json(
        new ApiResponse(200, videos, "User videos fetched successfully")
    );
});

const getStudioVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const videos = await Video.getPaginatedStudioVideos({
        ownerId: userId,
        page: parseInt(page),
        limit: parseInt(limit)
    });

    res.status(200).json(
        new ApiResponse(200, videos, "Studio videos fetched successfully")
    );
});
// ── ADD THIS FUNCTION to your video.controller.js ──
// Also add this import at the top of video.controller.js:
// import { Subscription } from "../models/subscription.model.js";

const getSubscriptionsFeed = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;
    const { page = 1, limit = 18 } = req.query;

    const clampedPage  = Math.max(1,  Number(page)  || 1);
    const clampedLimit = Math.min(50, Number(limit) || 18);

    // 1. Get all channel IDs the user follows
    const subscriptions = await Subscription.find(
        { subscriber: subscriberId },
        { channel: 1, _id: 0 }
    ).lean();

    const channelIds = subscriptions.map(s => s.channel);

    if (!channelIds.length) {
        return res.status(200).json(
            new ApiResponse(200, {
                docs:      [],
                totalDocs: 0,
                totalPages: 0,
                page:      clampedPage,
                channels:  [],
            }, "No subscriptions yet")
        );
    }

    const skip = (clampedPage - 1) * clampedLimit;

    const [videos, totalDocs, channelDocs] = await Promise.all([

        // ── Paginated video feed ──
        Video.aggregate([
            {
                $match: {
                    owner:       { $in: channelIds },
                    isPublished: true,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: clampedLimit },
            {
                $lookup: {
                    from:         "users",
                    localField:   "owner",
                    foreignField: "_id",
                    as:           "owner",
                    pipeline: [{
                        $project: { _id: 1, username: 1, fullname: 1, avatar: 1 },
                    }],
                },
            },
            { $addFields: { owner: { $first: "$owner" } } },
            {
                $project: {
                    _id: 1, title: 1, thumbnail: 1,
                    duration: 1, views: 1, createdAt: 1, owner: 1,
                },
            },
        ]),

        // ── Total count ──
        Video.countDocuments({ owner: { $in: channelIds }, isPublished: true }),

        // ── Sidebar channel list with "hasNew" dot indicator ──
        Subscription.aggregate([
            { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
            {
                $lookup: {
                    from:         "users",
                    localField:   "channel",
                    foreignField: "_id",
                    as:           "channel",
                    pipeline: [{
                        $project: { _id: 1, username: 1, fullname: 1, avatar: 1 },
                    }],
                },
            },
            { $addFields:  { channel: { $first: "$channel" } } },
            { $match:      { channel: { $ne: null } } },
            {
                $lookup: {
                    from: "videos",
                    let:  { cid: "$channel._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$owner",       "$$cid"] },
                                        { $eq: ["$isPublished", true]    },
                                    ],
                                },
                            },
                        },
                        { $sort:    { createdAt: -1 } },
                        { $limit:   1 },
                        { $project: { createdAt: 1 } },
                    ],
                    as: "latestVideo",
                },
            },
            {
                $addFields: {
                    latestVideoAt: { $first: "$latestVideo.createdAt" },
                    // show blue dot if channel uploaded in last 48 hours
                    hasNew: {
                        $cond: {
                            if: {
                                $gte: [
                                    { $first: "$latestVideo.createdAt" },
                                    new Date(Date.now() - 48 * 60 * 60 * 1000),
                                ],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            { $sort: { latestVideoAt: -1 } },
            {
                $project: {
                    _id: 1, channel: 1, hasNew: 1,
                },
            },
        ]),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            docs:       videos,
            totalDocs,
            totalPages: Math.ceil(totalDocs / clampedLimit),
            page:       clampedPage,
            limit:      clampedLimit,
            channels:   channelDocs,
        }, "Subscription feed fetched")
    );
});
export {
    uploadVideo,
    getAllVideos,
    getAllShorts,
    isPublished,
    deleteVideo,
    getVideoById,
    updateVideoDetails,
    userVideos,
    getStudioVideos,
    getSubscriptionsFeed
};
