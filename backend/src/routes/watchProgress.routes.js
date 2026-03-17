import { Router } from "express";
import {
    saveWatchProgress,
    getVideoProgress,
    getContinueWatching,
    deleteWatchProgress
} from "../controllers/watchProgress.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, saveWatchProgress);
router.route("/video/:videoId").get(verifyJWT, getVideoProgress);
router.route("/continue-watching").get(verifyJWT, getContinueWatching);
router.route("/:progressId").delete(verifyJWT, deleteWatchProgress);

export default router;

