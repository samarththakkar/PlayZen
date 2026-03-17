import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/* ── Shared projection objects ── */
const subscriberProjection = {
    _id:        1,
    username:   1,
    fullname:   1,
    avatar:     1,
};

const channelProjection = {
    _id:        1,
    username:   1,
    fullname:   1,
    avatar:     1,
    coverImage: 1,
};

/* ── Schema ── */
const subscriptionSchema = new Schema(
    {
        subscriber: {
            type:     Schema.Types.ObjectId,
            ref:      "User",
            required: true,
            index:    true,   // faster lookups for "channels I follow"
        },
        channel: {
            type:     Schema.Types.ObjectId,
            ref:      "User",
            required: true,
            index:    true,   // faster lookups for "my subscribers"
        },
    },
    { timestamps: true }
);

/* ── Compound index — prevents duplicate subscriptions at DB level ── */
subscriptionSchema.index(
    { subscriber: 1, channel: 1 },
    { unique: true }
);

/* ── Plugin ── */
subscriptionSchema.plugin(mongooseAggregatePaginate);

/* ──────────────────────────────────────────────────────────────
   STATIC: Get paginated subscribers of a channel
   Returns: { docs, totalDocs, totalPages, page, limit }
────────────────────────────────────────────────────────────── */
subscriptionSchema.statics.getPaginatedChannelSubscribers = function ({
    channelId,
    page  = 1,
    limit = 10,
}) {
    const aggregate = this.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $lookup: {
                from:         "users",
                localField:   "subscriber",
                foreignField: "_id",
                as:           "subscriber",
                pipeline:     [{ $project: subscriberProjection }],
            },
        },
        {
            $addFields: { subscriber: { $first: "$subscriber" } },
        },
        // Drop documents where the user was deleted
        {
            $match: { subscriber: { $ne: null } },
        },
        { $sort: { createdAt: -1 } },
    ]);

    return this.aggregatePaginate(aggregate, { page, limit });
};

/* ──────────────────────────────────────────────────────────────
   STATIC: Get paginated channels a subscriber follows
   Returns: { docs, totalDocs, totalPages, page, limit }
────────────────────────────────────────────────────────────── */
subscriptionSchema.statics.getPaginatedSubscribedChannels = function ({
    subscriberId,
    page  = 1,
    limit = 10,
}) {
    const aggregate = this.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
        },
        {
            $lookup: {
                from:         "users",
                localField:   "channel",
                foreignField: "_id",
                as:           "channel",
                pipeline:     [{ $project: channelProjection }],
            },
        },
        {
            $addFields: { channel: { $first: "$channel" } },
        },
        // Drop documents where the channel was deleted
        {
            $match: { channel: { $ne: null } },
        },
        { $sort: { createdAt: -1 } },
    ]);

    return this.aggregatePaginate(aggregate, { page, limit });
};

/* ──────────────────────────────────────────────────────────────
   STATIC: Fast subscriber count (no aggregation overhead)
────────────────────────────────────────────────────────────── */
subscriptionSchema.statics.getSubscriberCount = function (channelId) {
    return this.countDocuments({
        channel: new mongoose.Types.ObjectId(channelId),
    });
};

export const Subscription = mongoose.model("Subscription", subscriptionSchema);