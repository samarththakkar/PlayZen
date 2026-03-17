import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const ownerProjection = {
    username: 1,
    fullname: 1,
    avatar: 1,
    coverImage: 1
};

const feedOwnerProjection = {
    username: 1,
    fullname: 1,
    avatar: 1
};

const buildOwnerLookupStage = (projection = ownerProjection) => ({
    $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
            {
                $project: projection
            }
        ]
    }
});

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        likesCount: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true,
            index: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true
        },
        isShort: {
            type: Boolean,
            default: false,
            index: true
        },
        category: {
            type: String,
            default: 'Other'
        }

    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

videoSchema.statics.getPaginatedUserVideos = function ({ username, page, limit }) {
    const aggregate = this.aggregate([
        buildOwnerLookupStage(),
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $match: {
                "owner.username": username,
                isPublished: true
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return this.aggregatePaginate(aggregate, { page, limit });
};

videoSchema.statics.getPaginatedStudioVideos = function ({ ownerId, page, limit }) {
    const aggregate = this.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(ownerId)
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return this.aggregatePaginate(aggregate, { page, limit });
};

videoSchema.statics.getPersonalizedFeed = function ({
    seenVideoIds = [],
    topChannels = [],
    topCategories = [],
    tagRegex = null,
    skip = 0,
    limit = 10
}) {
    return this.aggregate([
        {
            $match: {
                isPublished: true,
                _id: {
                    $nin: seenVideoIds.map((id) => new mongoose.Types.ObjectId(id))
                },
                $or: [
                    { isShort: false },
                    { isShort: { $exists: false } }
                ]
            }
        },
        {
            $addFields: {
                relevanceScore: {
                    $add: [
                        {
                            $cond: [
                                {
                                    $in: [
                                        "$owner",
                                        topChannels.map((id) => new mongoose.Types.ObjectId(id))
                                    ]
                                },
                                30,
                                0
                            ]
                        },
                        {
                            $cond: [
                                { $in: ["$category", topCategories] },
                                20,
                                0
                            ]
                        },
                        {
                            $cond: [
                                tagRegex
                                    ? { $regexMatch: { input: "$title", regex: tagRegex } }
                                    : { $literal: false },
                                10,
                                0
                            ]
                        },
                        {
                            $divide: [
                                { $ifNull: ["$views", 0] },
                                1000
                            ]
                        }
                    ]
                }
            }
        },
        {
            $sort: {
                relevanceScore: -1,
                createdAt: -1
            }
        },
        { $skip: skip },
        { $limit: limit },
        buildOwnerLookupStage(feedOwnerProjection),
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $project: {
                title: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                slug: 1,
                category: 1,
                createdAt: 1,
                owner: 1,
                relevanceScore: 1
            }
        }
    ]);
};

export const Video = mongoose.model("Video", videoSchema);
