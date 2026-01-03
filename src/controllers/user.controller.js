import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../utils/emailHandler.js";



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const sendOTPForRegistration = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body;
    
    if (!email || !fullName) {
        throw new ApiError(400, "Email and full name are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const otp = await sendOtpEmail({
        to: email,
        name: fullName
    });

    // Create a temporary user document for OTP storage
    const tempUser = new User({
        email: email,
        fullname: fullName,
        username: `temp_${Date.now()}`, // Temporary username
        password: 'temp_password', // Temporary password
        otp: otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        isEmailVerified: false
    });

    await tempUser.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { email }, "OTP sent successfully")
    );
});

const verifyOTPForRegistration = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Clear OTP and mark as verified - avoid password hashing
    await User.findByIdAndUpdate(user._id, {
        $unset: { otp: 1, otpExpiry: 1 },
        $set: { isEmailVerified: true }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP verified successfully")
    );
});



const generateDefaultAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const firstLetter = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=${backgroundColor.slice(1)}&color=fff&size=200`;
}

const generateDefaultCoverImage = (userId) => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    
    const gradientIndex = userId.toString().charCodeAt(0) % gradients.length;
    return `https://via.placeholder.com/800x200/${gradients[gradientIndex].slice(-6)}/${gradients[gradientIndex].slice(-6)}`;
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, provider, providerId } = req.body;
    const fullNameTrimmed = fullName?.trim();
    const emailTrimmed = email?.trim();
    const normalizedUsername = username?.trim().toLowerCase();

    if (!fullNameTrimmed || !emailTrimmed || !normalizedUsername) {
        throw new ApiError(400, "Name, email and username are required");
    }

    // For social login, password is optional
    if (!provider && !password) {
        throw new ApiError(400, "Password is required for regular registration");
    }

    const existedUser = await User.findOne({
        $or: [{ username: normalizedUsername }, { email: emailTrimmed }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Handle avatar
    let avatarUrl;
    if (req.files?.avatar?.[0]) {
        const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
        avatarUrl = avatar?.url;
    } else {
        avatarUrl = generateDefaultAvatar(fullNameTrimmed);
    }

    // Handle cover image
    let coverImageUrl;
    if (req.files?.coverImage?.[0]) {
        const coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
        coverImageUrl = coverImage?.url || "";
    } else {
        // Generate temporary ID for gradient selection
        const tempId = Date.now().toString();
        coverImageUrl = generateDefaultCoverImage(tempId);
    }

    const userData = {
        fullname: fullNameTrimmed,
        email: emailTrimmed,
        username: normalizedUsername,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
    };

    // Add password only for regular registration
    if (!provider) {
        userData.password = password;
    } else {
        userData.provider = provider;
        userData.providerId = providerId;
    }

    const user = await User.create(userData);
    
    // Update cover image with actual user ID
    if (!req.files?.coverImage?.[0]) {
        user.coverImage = generateDefaultCoverImage(user._id);
        await user.save();
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
})

const forgotOTPForPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = await sendOtpEmail({
        to: email,
        name: user.fullname
    });

    await User.findOneAndUpdate(
        { email },
        {
            otp: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        }
    );

    return res.status(200).json(
        new ApiResponse(200, { email }, "OTP sent successfully")
    );
});
const resetPasswordUsingOTP = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // Use findByIdAndUpdate to avoid validation issues
    await User.findByIdAndUpdate(user._id, {
        password: newPassword,
        $unset: { otp: 1, otpExpiry: 1 }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully")
    );
});
const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    //username or email
    //find the user 
    //password check
    //access and refresh Token 
    //send cookie 

    const { email, username, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "user does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, } = req.body

    if (!fullName && !email) {
        throw new ApiError(400, "All field are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                ...(fullName && { fullName }),
                ...(email && { email })
            }
        },
        { new: true }
    ).select("-password -refreshToken").lean();
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    console.log(avatarLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading an avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading an avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "CoverImage updated successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    sendOTPForRegistration,
    verifyOTPForRegistration,
    forgotOTPForPassword,
    resetPasswordUsingOTP,
    generateAccessAndRefreshTokens
};
