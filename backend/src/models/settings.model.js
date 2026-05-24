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
        playback: {
            hoverAutoplay: {
                type: Boolean,
                default: true
            },
            autoplayNext: {
                type: Boolean,
                default: true
            },
            defaultQuality: {
                type: String,
                enum: ["auto", "1080p", "720p", "480p", "360p"],
                default: "auto"
            },
            defaultSpeed: {
                type: Number,
                default: 1.0
            }
        }
    },
    { timestamps: true }
);

settingsSchema.index({ user: 1 });

export const Settings = mongoose.model("Settings", settingsSchema);