import { Router } from "express";
import { getTrending, autocomplete } from "../controllers/search.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/trending").get(getTrending);
router.route("/autocomplete").get(autocomplete);

export default router;
