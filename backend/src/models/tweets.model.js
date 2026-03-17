import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const ownerProjection = {
    username: 1,
    fullname: 1,
    avatar: 1
};

const buildOwnerLookupStage = () => ({
    $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
            {
                $project: ownerProjection
            }
        ]
    }
});

const tweetSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 280
        },
        likesCount: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
)

tweetSchema.plugin(mongooseAggregatePaginate);

tweetSchema.statics.getUserTweetsWithOwner = function (userId) {
    return this.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        buildOwnerLookupStage(),
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);
};

tweetSchema.statics.getPaginatedTweets = function ({ page, limit }) {
    const aggregate = this.aggregate([
        buildOwnerLookupStage(),
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return this.aggregatePaginate(aggregate, { page, limit });
};

export const Tweet = mongoose.model("Tweet", tweetSchema)
