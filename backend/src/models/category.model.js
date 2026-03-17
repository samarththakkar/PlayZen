import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        icon: {
            type: String,   // icon name or URL
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,   // controls display order in filter chips
            default: 0
        }
    },
    { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, order: 1 });

export const Category = mongoose.model("Category", categorySchema);