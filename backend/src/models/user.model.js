import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const watchHistoryOwnerProjection = {
    fullname: 1,
    username: 1,
    avatar: 1
};

const buildWatchHistoryOwnerLookupStage = () => ({
    $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
            {
                $project: watchHistoryOwnerProjection
            }
        ]
    }
});

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary url
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
        },
        resestPasswordOTP: {
            type: String,
        },
        resestPasswordOTPExpiry: {
            type: Date,
        },
        resetPasswordAttemps: {
            type: Number,
            default: 0,
        },
        resetPasswordLastAttemps: {
            type: Date,
        },
        googleId: {
            type: String,
            sparse: true
        },

        provider: {
            type: String,
            enum: ['google', 'local'],
            default: 'local',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,

        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        },
    }, { timestamps: true }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return
    }
    this.password = await bcrypt.hash(this.password, 10)
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.statics.getWatchHistory = function (userId) {
    return this.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    buildWatchHistoryOwnerLookupStage(),
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
    ]);
};

userSchema.statics.getChannelProfile = function ({ username, subscriberId }) {
    const normalizedUsername = username?.toLowerCase();
    const subscriberObjectId = subscriberId ? new mongoose.Types.ObjectId(subscriberId) : null;

    return this.aggregate([
        {
            $match: {
                username: normalizedUsername
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [subscriberObjectId, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);
};

export const User = mongoose.model("User", userSchema)
