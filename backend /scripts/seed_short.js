import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "../src/models/video.model.js";

dotenv.config({
    path: './.env'
});

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/youtube`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

const makeVideoShort = async () => {
    await connectDB();

    // Find one video
    const video = await Video.findOne({ isPublished: true });

    if (video) {
        console.log(`Found video: ${video.title} (${video._id})`);
        video.isShort = true;
        await video.save();
        console.log("Updated video to be a short!");
    } else {
        console.log("No videos found to update.");
    }

    process.exit(0);
};

makeVideoShort();
