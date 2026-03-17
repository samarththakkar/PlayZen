import { Router } from "express";
import {
    uploadVideo,
    getAllVideos,
    getAllShorts,
    isPublished,
    deleteVideo,
    getVideoById,
    updateVideoDetails,
    userVideos,
    getStudioVideos,
    getSubscriptionsFeed
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();
router.route("/upload-video").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
)
router.route("/update-video/:videoId").patch(
    verifyJWT,
    upload.fields([
        {
            name: "videos",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    updateVideoDetails
);
router.route("/get-video/:videoId").get(getVideoById);
router.route("/studio-videos").get(verifyJWT, getStudioVideos);
router.route("/user-videos/:username").get(userVideos);
router.route("/get-all-videos").get(getAllVideos);
router.route("/get-all-shorts").get(getAllShorts);
router.route("/is-published/:videoId").get(verifyJWT, isPublished);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);
router.get('/subscriptions-feed', verifyJWT, getSubscriptionsFeed);

export default router;


