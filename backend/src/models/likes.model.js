import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoOwnerProjection = {
  username: 1,
  fullname: 1,
  avatar: 1
};

const likeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null
    },

    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      default: null
    },

    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

likeSchema.plugin(mongooseAggregatePaginate);

likeSchema.statics.getPaginatedLikedVideos = function ({ likedBy, page, limit }) {
  const aggregate = this.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(likedBy),
        video: { $ne: null }
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
                  $project: videoOwnerProjection
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
    {
      $replaceRoot: { newRoot: "$video" }
    },
    { $sort: { createdAt: -1 } }
  ]);

  return this.aggregatePaginate(aggregate, { page, limit });
};

export const Like = mongoose.model("Like", likeSchema);
