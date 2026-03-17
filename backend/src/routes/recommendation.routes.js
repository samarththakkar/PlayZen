import { Router } from "express";
import { getPersonalizedFeed, getSimilarVideos } from "../controllers/recommendation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/feed").get(verifyJWT, getPersonalizedFeed);
router.route("/similar/:videoId").get(getSimilarVideos);

export default router;
