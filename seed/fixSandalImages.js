require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const sandalUpdates = [
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000112'),
    imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000113'),
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Original_Tevas.jpg',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000114'),
    imageUrl: 'https://images.unsplash.com/photo-1596523027665-9da35ced2388?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000115'),
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Hari_Mari_Dark_Gray_and_Neon_Green_Leather_Lakes.jpg',
  },
];

const fixSandalImages = async () => {
  try {
    await connectDB();

    let totalMatched = 0;
    let totalModified = 0;

    for (const update of sandalUpdates) {
      const result = await Product.updateOne(
        { _id: update._id },
        { $set: { imageUrl: update.imageUrl } }
      );

      totalMatched += result.matchedCount || 0;
      totalModified += result.modifiedCount || 0;
    }

    console.log(`Update completed. Matched: ${totalMatched}, Modified: ${totalModified}`);
  } catch (error) {
    console.error(`Error updating sandal images: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

fixSandalImages();
