import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import { ApiError } from "./utils/ApiError.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

const app = express();

// ✅ Helmet for secure HTTP headers (allowing cross-origin resource sharing)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ CORS configuration for cross-origin deployment
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "https://play-zen.vercel.app"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    console.error(`CORS Blocked: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cache-Control",
    "Pragma",
    "Expires",
  ]
}));

// Handle preflight OPTIONS requests for all routes (Express 5 compatible)
app.options(/(.*)/,  cors());

// ✅ Global and Route-specific Rate Limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes."
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

app.use(globalLimiter);
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);
app.use("/api/v1/users/send-otp", authLimiter);
app.use("/api/v1/users/forgot-password", authLimiter);
app.use("/api/v1/users/reset-password", authLimiter);

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Override req.query to be mutable for Express 5 compatibility with legacy middlewares
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// ✅ NoSQL Query Injection protection
app.use(mongoSanitize());

// ✅ HTTP Parameter Pollution protection
app.use(hpp());

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
import settingsRouter from "./routes/settings.routes.js";

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
app.use("/api/v1/settings", settingsRouter);

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  // Always log the full developer error stack in the server console
  console.error("Server Error Hook:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again.";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(", ");
  }

  // Handle MongoDB duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const capitalisedField = field.charAt(0).toUpperCase() + field.slice(1);
    message = `${capitalisedField} is already registered. Please try another one.`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for resource identifier.`;
  }

  // Handle expired JWT
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // Handle invalid JWT signature/format
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Authentication failed. Invalid login session.";
  }

  // If it's a generic unhandled system error (not an instance of ApiError/custom code),
  // override with a general friendly message to avoid exposing raw stack or db details to the user.
  const isCustomError = err instanceof ApiError || err.statusCode !== undefined;
  if (!isCustomError && statusCode === 500) {
    message = "An unexpected server error occurred. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: err.errors || [],
  });
});

export { app };