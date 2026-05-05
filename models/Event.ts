import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: [{
    type: String
  }],
  location: {
    type: String
  },
  image: {
    type: String,
    default: ''
  },
  ticketLink: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add index for sorting by createdAt
eventSchema.index({ createdAt: -1 });

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
