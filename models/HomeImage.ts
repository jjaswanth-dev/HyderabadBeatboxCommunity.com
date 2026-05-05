import mongoose from 'mongoose';

const homeImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
});

export default mongoose.models.HomeImage || mongoose.model('HomeImage', homeImageSchema);
