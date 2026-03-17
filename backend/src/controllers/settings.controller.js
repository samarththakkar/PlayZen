import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Settings } from "../models/settings.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get settings for logged in user
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ user: req.user._id });

    // If no settings document exists yet, create default one
    if (!settings) {
        settings = await Settings.create({ user: req.user._id });
    }

    return res.status(200).json(
        new ApiResponse(200, settings, "Settings fetched successfully")
    );
});

// Update notification preferences
const updateNotificationSettings = asyncHandler(async (req, res) => {
    const { emailNotifications, pushNotifications } = req.body;

    const settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        {
            $set: {
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(pushNotifications !== undefined && { pushNotifications }),
            }
        },
        { new: true, upsert: true } // upsert creates doc if it doesn't exist
    );

    return res.status(200).json(
        new ApiResponse(200, settings, "Notification settings updated successfully")
    );
});

// Update privacy settings
const updatePrivacySettings = asyncHandler(async (req, res) => {
    const { profileVisibility, searchVisibility } = req.body;

    if (!profileVisibility && searchVisibility === undefined) {
        throw new ApiError(400, "At least one privacy field is required");
    }

    if (profileVisibility && !["public", "private"].includes(profileVisibility)) {
        throw new ApiError(400, "profileVisibility must be public or private");
    }

    const settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        {
            $set: {
                ...(profileVisibility && { "privacy.profileVisibility": profileVisibility }),
                ...(searchVisibility !== undefined && { "privacy.searchVisibility": searchVisibility }),
            }
        },
        { new: true, upsert: true }
    );

    return res.status(200).json(
        new ApiResponse(200, settings, "Privacy settings updated successfully")
    );
});

// Update personal info (displayName, bio, avatar, coverImage)
const updatePersonalInfo = asyncHandler(async (req, res) => {
    const { fullName, bio } = req.body;

    if (!fullName && !bio && !req.files?.avatar && !req.files?.coverImage) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const updateData = {};

    if (fullName) updateData.fullname = fullName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    // Handle avatar upload
    if (req.files?.avatar?.[0]) {
        const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
        if (!avatar?.url) {
            throw new ApiError(400, "Error uploading avatar");
        }
        updateData.avatar = avatar.url;
    }

    // Handle cover image upload
    if (req.files?.coverImage?.[0]) {
        const coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
        if (!coverImage?.url) {
            throw new ApiError(400, "Error uploading cover image");
        }
        updateData.coverImage = coverImage.url;
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, user, "Personal info updated successfully")
    );
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current and new password are required");
    }

    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password must be different from current password");
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Change email — sends OTP to new email
const changeEmail = asyncHandler(async (req, res) => {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
        throw new ApiError(400, "New email and password are required");
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect");
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
        throw new ApiError(409, "Email already in use");
    }

    // Store pending email on user
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            pendingEmail: newEmail,
            emailChangeToken: Math.floor(100000 + Math.random() * 900000).toString(),
            emailChangeTokenExpiry: new Date(Date.now() + 10 * 60 * 1000)
        }
    });

    // TODO: send OTP to newEmail using your sendOTP utility

    return res.status(200).json(
        new ApiResponse(200, { newEmail }, "OTP sent to new email")
    );
});

// Verify new email with OTP
const verifyNewEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    const user = await User.findById(req.user._id);

    if (!user.pendingEmail || !user.emailChangeToken) {
        throw new ApiError(400, "No email change request found");
    }

    if (user.emailChangeToken !== otp || user.emailChangeTokenExpiry < new Date()) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    await User.findByIdAndUpdate(req.user._id, {
        $set: { email: user.pendingEmail },
        $unset: {
            pendingEmail: 1,
            emailChangeToken: 1,
            emailChangeTokenExpiry: 1
        }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Email updated successfully")
    );
});

export {
    getSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updatePersonalInfo,
    changePassword,
    changeEmail,
    verifyNewEmail
};