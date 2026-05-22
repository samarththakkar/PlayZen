import { Router } from "express";
import { 
    getPersonalizedFeed, 
    getSimilarVideos,
    toggleNotInterested,
    toggleBlockedChannel,
    reportVideo
} from "../controllers/recommendation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/feed").get(verifyJWT, getPersonalizedFeed);
router.route("/similar/:videoId").get(getSimilarVideos);
router.route("/not-interested/:videoId").post(verifyJWT, toggleNotInterested);
router.route("/block-channel/:channelId").post(verifyJWT, toggleBlockedChannel);
router.route("/report/:videoId").post(verifyJWT, reportVideo);

export default router;
