import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const watchLaterSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        }
    },
    { timestamps: true }
);

// Prevent duplicate entries
watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });

watchLaterSchema.plugin(mongooseAggregatePaginate);

watchLaterSchema.statics.getPaginatedWatchLaterVideos = function ({ user, page, limit }) {
    const aggregate = this.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(user)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $match: {
                            isPublished: true
                        }
                    },
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
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        { $unwind: "$video" },
        { $replaceRoot: { newRoot: "$video" } },
        { $sort: { createdAt: -1 } }
    ]);

    return this.aggregatePaginate(aggregate, { page, limit });
};

export const WatchLater = mongoose.model("WatchLater", watchLaterSchema);
