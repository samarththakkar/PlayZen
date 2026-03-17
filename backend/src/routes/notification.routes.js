import { Router } from "express";
import {
    getUserNotifications,
    sendNotification,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getUserNotifications);
router.route("/unread-count").get(verifyJWT, getUnreadCount);
router.route("/:notificationId/mark-as-read").post(verifyJWT, markAsRead);
router.route("/mark-all-as-read").post(verifyJWT, markAllAsRead);
router.route("/:notificationId").delete(verifyJWT, deleteNotification);
router.route("/")
export default router;

