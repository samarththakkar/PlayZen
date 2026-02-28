import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";

const app = express();
// Trigger reload 4

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.static("public"))

app.use(cookieParser())

// Initialize Passport
app.use(passport.initialize());

// routes import 

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import playlistRouter from "./routes/playList.routes.js";
import tweetRouter from "./routes/tweets.routes.js";
import likeRouter from "./routes/likes.routes.js";
import commentRouter from "./routes/comments.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
export { app };