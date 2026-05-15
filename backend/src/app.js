import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";

const app = express();

// ✅ CORS configuration for cross-origin deployment (Vercel + Render)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ✅ Handle preflight requests
// app.options("*", cors());

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// ================= ROUTES =================

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import playlistRouter from "./routes/playList.routes.js";
import tweetRouter from "./routes/tweets.routes.js";
import likeRouter from "./routes/likes.routes.js";
import commentRouter from "./routes/comments.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import watchProgressRouter from "./routes/watchProgress.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import searchRouter from "./routes/search.routes.js";
import watchHistoryRouter from "./routes/watchHistory.routes.js";
import watchLaterRouter from "./routes/watchLater.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// API Routes
app.use("/healthcheck", healthcheckRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/watch-progress", watchProgressRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/watch-history", watchHistoryRouter);
app.use("/api/v1/watch-later", watchLaterRouter);

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export { app };