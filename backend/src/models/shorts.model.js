import mongoose from "mongoose";

const shortsSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            trim: true
        },
        url: { 
            type: String,
            required: true 
        },
        description: {
            type: String, 
            required: true,
            trim: true
        },
        thumbnail: { 
            type: String, 
            required: true 
        },
        views: { 
            type: Number, 
            default: 0
        },
        likes: { 
            type: Number, 
            default: 0
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const Short = mongoose.model("Shorts", shortsSchema);

export { Short };
export default Short;
