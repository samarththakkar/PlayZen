import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import Short from "../models/shorts.model.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";

export const createShort = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0] || req.files?.thumbnailFile?.[0];

    if (!videoFile?.path) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailFile?.path) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile.path, "video");
    if (!uploadedVideo?.url) {
        throw new ApiError(500, "Failed to upload video file");
    }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFile.path, "image");
    if (!uploadedThumbnail?.url) {
        if (uploadedVideo.public_id) {
            await deleteFromCloudinary(uploadedVideo.public_id, "video");
        }
        throw new ApiError(500, "Failed to upload thumbnail file");
    }

    let short;
    try {
        short = await Short.create({
            title: title.trim(),
            description: description.trim(),
            url: uploadedVideo.url,
            thumbnail: uploadedThumbnail.url,
            views: 0,
            likes: 0,
            owner: req.user._id
        });
    } catch (error) {
        await Promise.all([
            deleteFromCloudinary(uploadedVideo.public_id || extractPublicId(uploadedVideo.url), "video"),
            deleteFromCloudinary(uploadedThumbnail.public_id || extractPublicId(uploadedThumbnail.url), "image")
        ]);
        throw error;
    }

    const createdShort = await Short.findById(short._id)
        .populate("owner", "username fullname avatar");

    return res.status(201).json(
        new ApiResponse(201, createdShort, "Short created successfully")
    );
});

export const getAllShorts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    const shorts = await Short.find()
        .populate("owner", "username fullname avatar")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const totalShorts = await Short.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            docs: shorts,
            totalShorts,
            currentPage: pageNumber,
            totalPages: totalShorts ? Math.ceil(totalShorts / limitNumber) : 0
        }, shorts.length ? "All shorts fetched successfully" : "No shorts found")
    );
});

export const getUserShorts = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    const shorts = await Short.find({ owner: userId })
        .populate("owner", "username fullname avatar")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const totalShorts = await Short.countDocuments({ owner: userId });

    return res.status(200).json(
        new ApiResponse(200, {
            docs: shorts,
            totalShorts,
            currentPage: pageNumber,
            totalPages: totalShorts ? Math.ceil(totalShorts / limitNumber) : 0
        }, shorts.length ? "User shorts fetched successfully" : "No shorts found for this user")
    );
});

export const deleteShort = asyncHandler(async (req, res) => {
    const { shortId } = req.params;

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!shortId) {
        throw new ApiError(400, "Short id is required");
    }

    if (!isValidObjectId(shortId)) {
        throw new ApiError(400, "Invalid short id");
    }

    const short = await Short.findById(shortId);
    if (!short) {
        throw new ApiError(404, "Short not found");
    }

    if (short.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this short");
    }

    await Promise.all([
        deleteFromCloudinary(extractPublicId(short.url), "video"),
        deleteFromCloudinary(extractPublicId(short.thumbnail), "image"),
        short.deleteOne()
    ]);

    return res.status(200).json(
        new ApiResponse(200, {}, "Short deleted successfully")
    );
});
