import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getIsLiked
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();


router.route("/like-video/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/like-comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/like-tweet/:tweetId").post(verifyJWT, toggleTweetLike);
router.route("/liked-videos").get(verifyJWT, getLikedVideos);
router.route("/is-liked").get(verifyJWT, getIsLiked);


export default router;