import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ["public", "private"],
                default: "public"
            },
            searchVisibility: {
                type: Boolean,
                default: true
            }
        },
    },
    { timestamps: true }
);

settingsSchema.index({ user: 1 });

export const Settings = mongoose.model("Settings", settingsSchema);