import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add index for sorting by createdAt
gallerySchema.index({ createdAt: -1 });

export default mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
