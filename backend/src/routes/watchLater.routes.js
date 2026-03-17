import { Router } from "express";
import {
    addToWatchLater,
    removeFromWatchLater,
    getWatchLaterVideos,
    toggleWatchLater,
    isVideoInWatchLater,
    clearWatchLater,
    getWatchLaterCount
} from "../controllers/watchLater.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Static routes MUST come before parameterized routes
router.route("/").get(getWatchLaterVideos).delete(clearWatchLater);
router.route("/count").get(getWatchLaterCount);
router.route("/toggle/:videoId").post(toggleWatchLater);
router.route("/:videoId").post(addToWatchLater).delete(removeFromWatchLater).get(isVideoInWatchLater);

export default router;
