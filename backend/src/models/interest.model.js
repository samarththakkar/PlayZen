import mongoose, { Schema } from "mongoose";

const interestSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Categories user is interested in with score
        // Higher score = more interested
        // e.g. [{ category: "Technology", score: 45 }]
        categoryScores: [
            {
                category: {
                    type: String,
                    required: true
                },
                score: {
                    type: Number,
                    default: 0
                }
            }
        ],

        // Tags/keywords user engages with most
        // e.g. [{ tag: "javascript", score: 20 }]
        tagScores: [
            {
                tag: {
                    type: String,
                    required: true
                },
                score: {
                    type: Number,
                    default: 0
                }
            }
        ],

        // Channels user interacts with most
        // even if not subscribed
        channelScores: [
            {
                channel: {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                },
                score: {
                    type: Number,
                    default: 0
                }
            }
        ],

        // Last time interests were recalculated
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

interestSchema.index({ user: 1 });
interestSchema.index({ "categoryScores.category": 1 });

export const Interest = mongoose.model("Interest", interestSchema);