import { Router } from "express";
import { createPlaylist } from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(
    upload.fields([
        {
            name:"thumbnail",
            maxCount:1
        }
    ])
,verifyJWT,createPlaylist);


export default router;