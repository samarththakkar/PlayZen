import { Router } from "express";
import {
    getSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updatePlaybackSettings,
    updatePersonalInfo,
    changePassword,
    changeEmail,
    verifyNewEmail
} from "../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply auth middleware to all settings routes
router.use(verifyJWT);

router.route("/").get(getSettings);
router.route("/notifications").patch(updateNotificationSettings);
router.route("/privacy").patch(updatePrivacySettings);
router.route("/playback").patch(updatePlaybackSettings);
router.route("/personal-info").patch(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    updatePersonalInfo
);
router.route("/change-password").post(changePassword);
router.route("/change-email").post(changeEmail);
router.route("/verify-email").post(verifyNewEmail);

export default router;
