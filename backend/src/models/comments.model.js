import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const ownerProjection = {
  username: 1,
  fullname: 1,
  avatar: 1
};

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },

    likesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
commentSchema.plugin(mongooseAggregatePaginate)

commentSchema.statics.getPaginatedVideoComments = function ({ videoId, page, limit }) {
  const aggregate = this.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
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
            $project: ownerProjection
          }
        ]
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

  return this.aggregatePaginate(aggregate, { page, limit });
};

export const Comment = mongoose.model("Comment", commentSchema);
