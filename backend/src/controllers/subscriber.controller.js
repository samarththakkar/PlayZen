import mongoose from "mongoose";
import { asyncHandler }   from "../utils/asyncHandler.js";
import { ApiError }       from "../utils/ApiError.js";
import { ApiResponse }    from "../utils/ApiResponse.js";
import { Subscription }   from "../models/subscription.model.js";
import { updateUserInterests } from "./recommendation.controller.js";

/* ── helpers ── */
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const clampPage  = (n) => Math.max(1,  Number(n) || 1);
const clampLimit = (n) => Math.min(50, Number(n) || 10);

/* ──────────────────────────────────────────────────────────────
   POST /subscriptions/c/:channelId/toggle
   Toggle subscribe / unsubscribe
────────────────────────────────────────────────────────────── */
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId }  = req.params;
    const subscriberId   = req.user._id;

    if (!channelId)          throw new ApiError(400, "Channel id is required");
    if (!isValidId(channelId)) throw new ApiError(400, "Invalid channel id");

    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existing = await Subscription.findOne({
        subscriber: subscriberId,
        channel:    channelId,
    });

    if (existing) {
        /* ── UNSUBSCRIBE ── */
        await Subscription.findByIdAndDelete(existing._id);

        const subscribersCount = await Subscription.getSubscriberCount(channelId);

        return res.status(200).json(
            new ApiResponse(
                200,
                { isSubscribed: false, subscribersCount },
                "Unsubscribed successfully"
            )
        );
    }

    /* ── SUBSCRIBE ── */
    // findOneAndUpdate with upsert is safer than create() under race conditions
    await Subscription.findOneAndUpdate(
        { subscriber: subscriberId, channel: channelId },
        { subscriber: subscriberId, channel: channelId },
        { upsert: true, new: true }
    );

    const subscribersCount = await Subscription.getSubscriberCount(channelId);

    // Update recommendation interests (fire-and-forget — don't block response)
    updateUserInterests(subscriberId, { owner: channelId }, "subscribe").catch(
        (err) => console.error("[toggleSubscription] interest update failed:", err)
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            { isSubscribed: true, subscribersCount },
            "Subscribed successfully"
        )
    );
});

/* ──────────────────────────────────────────────────────────────
   GET /subscriptions/c/:channelId/status
   Check if current user is subscribed to a channel
────────────────────────────────────────────────────────────── */
const getSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId  = req.user._id;

    if (!channelId)            throw new ApiError(400, "Channel id is required");
    if (!isValidId(channelId)) throw new ApiError(400, "Invalid channel id");

    // Run both queries in parallel — faster than sequential awaits
    const [subscription, subscribersCount] = await Promise.all([
        Subscription.findOne({ subscriber: subscriberId, channel: channelId }).lean(),
        Subscription.getSubscriberCount(channelId),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            { isSubscribed: !!subscription, subscribersCount },
            "Subscription status fetched"
        )
    );
});

/* ──────────────────────────────────────────────────────────────
   GET /subscriptions/c/:channelId/subscribers
   Paginated list of subscribers for a channel
────────────────────────────────────────────────────────────── */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId }        = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!channelId)            throw new ApiError(400, "Channel id is required");
    if (!isValidId(channelId)) throw new ApiError(400, "Invalid channel id");

    const subscribers = await Subscription.getPaginatedChannelSubscribers({
        channelId,
        page:  clampPage(page),
        limit: clampLimit(limit),
    });

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
    );
});

/* ──────────────────────────────────────────────────────────────
   GET /subscriptions/channels
   Paginated list of channels the logged-in user has subscribed to
────────────────────────────────────────────────────────────── */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId         = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    if (!subscriberId) throw new ApiError(401, "Unauthorized request");

    const channels = await Subscription.getPaginatedSubscribedChannels({
        subscriberId,
        page:  clampPage(page),
        limit: clampLimit(limit),
    });

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
});

/* ──────────────────────────────────────────────────────────────
   GET /subscriptions/c/:channelId/count
   Lightweight subscriber count endpoint (no pagination overhead)
────────────────────────────────────────────────────────────── */
const getSubscriberCount = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId)            throw new ApiError(400, "Channel id is required");
    if (!isValidId(channelId)) throw new ApiError(400, "Invalid channel id");

    const count = await Subscription.getSubscriberCount(channelId);

    return res.status(200).json(
        new ApiResponse(200, { subscribersCount: count }, "Subscriber count fetched")
    );
});

export {
    toggleSubscription,
    getSubscriptionStatus,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscriberCount,     // ← new lightweight endpoint
};
