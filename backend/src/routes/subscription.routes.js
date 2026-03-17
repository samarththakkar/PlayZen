import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscriptionStatus
} from "../controllers/subscriber.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/toggle/:channelId", verifyJWT, toggleSubscription);
router.get("/subscribers/:channelId", verifyJWT, getUserChannelSubscribers);
router.get("/channels", verifyJWT, getSubscribedChannels);
router.get("/status/:channelId", verifyJWT, getSubscriptionStatus);
export default router;
