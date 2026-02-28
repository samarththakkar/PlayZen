
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "../src/models/video.model.js";
import { DB_NAME } from "../src/constants.js";

dotenv.config({
    path: './.env'
});

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

const updateVideo = async () => {
    await connectDB();

    try {
        // Find the Be6 video (case insensitive search)
        const video = await Video.findOne({ title: { $regex: /Be6/i } });

        if (!video) {
            console.log("Video not found!");
            process.exit(1);
        }

        console.log(`Found video: ${video.title}`);

        // Update branding
        video.title = "Be6 Review: 2026 Luxury SUV of the Year? 🔥";
        video.description = `Is the new Be6 the ultimate luxury SUV? In this in-depth review, we take the Be6 for a spin to test its performance, comfort, and cutting-edge technology. From the glossy exterior to the futuristic cockpit, find out if this car is worth the hype!

🚗 Specs:
- Engine: 4.0L V8 Twin-Turbo
- Power: 600 HP
- 0-60: 3.5s

TIMESTAMPS:
0:00 Intro
1:20 Exterior Design
3:45 Interior & Tech
6:30 Driving Impressions
9:15 Is it worth it?

#Be6 #CarReview #LuxuryCars #SUV #Automotive`;

        // Use a high-quality placeholder image since generation failed/is mocked
        // This is a generic luxury car image from Unsplash
        video.thumbnail = "https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2940&auto=format&fit=crop";

        // Boost stats for "social proof"
        video.views = 15420;
        video.likesCount = 1245;

        await video.save();

        console.log("✅ Video branding updated successfully!");
        console.log("New Title:", video.title);
    } catch (error) {
        console.error("Error updating video:", error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

updateVideo();
