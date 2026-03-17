import { Router } from "express";
import {
    getWatchHistory,
    addToWatchHistory,
    clearWatchHistory
} from "../controllers/watchHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:userId").get(verifyJWT, getWatchHistory);   
router.route("/").post(verifyJWT, addToWatchHistory);
router.route("/clear").delete(verifyJWT, clearWatchHistory);

export default router;