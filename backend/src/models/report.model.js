import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        reason: {
            type: String,
            default: "Inappropriate content",
            required: true
        }
    },
    { timestamps: true }
);

reportSchema.index({ user: 1 });
reportSchema.index({ video: 1 });

export const Report = mongoose.model("Report", reportSchema);
