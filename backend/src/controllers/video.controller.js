import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import slugify from "slugify";


const uploadVideo = asyncHandler(async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('Body:', req.body);
        console.log('Files:', req.files);

        const { title, description, category, isShort } = req.body;
        if (!title || !description) {
            throw new ApiError(400, "Title and Description are required");
        }

        const videoLocalPath = req.files?.videoFile?.[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

        console.log('Video path:', videoLocalPath);
        console.log('Thumbnail path:', thumbnailLocalPath);

        if (!videoLocalPath) {
            throw new ApiError(400, "Video file is required");
        }
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail is required");
        }

        console.log('Uploading to Cloudinary...');
        const videoFile = await uploadOnCloudinary(videoLocalPath, "video");
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

        if (!videoFile) {
            throw new ApiError(500, "Failed to upload video file");
        }
        if (!thumbnail) {
            throw new ApiError(500, "Failed to upload thumbnail");
        }

        console.log('Cloudinary upload successful');
        const slug = slugify(title, { lower: true, trim: true });

        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            category: category || 'Other',
            owner: req.user._id,
            isPublished: true,
            isShort: isShort === 'true' || isShort === true,
            views: 0,
            slug
        });

        console.log('Video created:', video._id);

        res
            .status(201)
            .json(new ApiResponse(201, video, "Video uploaded successfully"));
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
})
const getAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId, category } = req.query;

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

    if (userId) {
        filter.owner = userId;
    }
    if (category) {
        filter.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

    const videos = await Video.find(filter)
        .populate('owner', 'username fullname avatar coverImage')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments(filter);

    res.status(200)
        .json(new ApiResponse(
            200,
            {
                docs: videos,
                totalVideos,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalVideos / parseInt(limit))
            },
            videos.length ? "Videos fetched successfully" : "No videos found"
        ));
})
const getAllShorts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, userId } = req.query;

    const filter = {
        isPublished: true,
        isShort: true
    };

    if (userId) {
        filter.owner = userId;
    }

    const shorts = await Video.find(filter)
        .populate('owner', 'username fullname avatar coverImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalShorts = await Video.countDocuments(filter);

    res.status(200)
        .json(new ApiResponse(
            200,
            {
                docs: shorts,
                totalShorts,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalShorts / parseInt(limit))
            },
            shorts.length ? "Shorts fetched successfully" : "No shorts found"
        ));
});
const isPublished = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    res.status(200)
        .json(new ApiResponse(200, `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`, video));
})
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete from Cloudinary
    const videoPublicId = extractPublicId(video.videoFile);
    const thumbnailPublicId = extractPublicId(video.thumbnail);

    await deleteFromCloudinary(videoPublicId, "video");
    await deleteFromCloudinary(thumbnailPublicId, "image");

    await Video.findByIdAndDelete(videoId);
    res.status(200)
        .json(new ApiResponse(200, "Video deleted successfully"));
}
);
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (!video.isPublished) {
        throw new ApiError(403, "Video is not published");
    }
    res.status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
}
);
const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    const videoLocalPath = req.files?.videos?.[0]?.path;
    if (videoLocalPath) {
        const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
        video.videoFile = uploadedVideo.url;
        video.duration = uploadedVideo.duration;
    }
    const { title, description, category } = req.body;
    if (title) {
        video.title = title;
        video.slug = slugify(title, { lower: true, trim: true });
    }
    if (description) {
        video.description = description;
    }
    if (category) {
        video.category = category;
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail = uploadedThumbnail.url;
    }
    await video.save();
    res.status(200)
        .json(new ApiResponse(200, "Video details updated successfully", video));
}
);
const userVideos = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const aggregate = Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        {
            $match: {
                "owner.username": username,
                isPublished: true
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const videos = await Video.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, videos, "User videos fetched successfully")
    );
});

const getStudioVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    // req.user is guaranteed by verifyJWT
    const userId = req.user._id;

    const aggregate = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const videos = await Video.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, videos, "Studio videos fetched successfully")
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
    getStudioVideos
}