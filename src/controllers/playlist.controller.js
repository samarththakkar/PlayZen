import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import slugify from "slugify";
import { Playlist } from "../models/playlists.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "title and description both are required");
    }
    const slug = slugify(title, { lower: true, strict: true });

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required");
    }
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");
    if (!uploadedThumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const playList = await Playlist.create({
        title,
        description,
        slug,
        thumbnail: uploadedThumbnail.url,
    })
    res.status(201).json(new ApiResponse(201, "Playlist created successfully", playList));

})

export {
    createPlaylist,

}