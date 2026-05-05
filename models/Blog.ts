import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        image: {
            type: String, // Base64 encoded image
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// Add index for sorting by createdAt
blogSchema.index({ createdAt: -1 });

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
