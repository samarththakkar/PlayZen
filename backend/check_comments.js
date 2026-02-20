import mongoose from "mongoose";
import { Comment } from "./src/models/comments.model.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

const checkComments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const comments = await Comment.find({}).sort({ createdAt: -1 }).limit(5);
        console.log("Last 5 comments:", JSON.stringify(comments, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkComments();
