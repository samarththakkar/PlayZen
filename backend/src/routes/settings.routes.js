import { Router } from "express";
import {
    getSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updatePersonalInfo,
    changePassword,
    changeEmail,
    verifyNewEmail
} from "../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
