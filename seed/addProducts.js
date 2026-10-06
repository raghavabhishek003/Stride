require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const additionalProducts = [
  // 4 Running products
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000101'),
    name: 'Stride Phantom Nitro',
    description: 'Premium marathon running shoes featuring carbon plate propulsive technology and responsive foam.',
    price: 6999,
    category: 'running',
    sizes: [7, 8, 9, 10, 11],
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000102'),
    name: 'Stride Aeroflex Racer',
    description: 'Ultra-breathable distance running shoes with supportive arch zone and shock-absorbing midsole.',
    price: 5499,
    category: 'running',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000103'),
    name: 'Stride Pulse Speed Elite',
    description: 'Dynamic sprint trainers crafted with engineered mesh for optimal thermal control.',
    price: 4799,
    category: 'running',
    sizes: [7, 8, 9, 10, 11],
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000104'),
    name: 'Stride Horizon Trail Runner',
    description: 'Rugged trail running footwear engineered with multi-directional rubber tread lugs.',
    price: 5999,
    category: 'running',
    sizes: [8, 9, 10, 11, 12],
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop',
  },

  // 4 Casual products
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000105'),
    name: 'Stride Minimalist Court Low',
    description: 'Clean white minimalist leather sneaker built for effortless everyday versatility.',
    price: 3499,
    category: 'casual',
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000106'),
    name: 'Stride Urban Canvas Runner',
    description: 'Lightweight breathable canvas sneaker featuring high-density cushioned insoles.',
    price: 2799,
    category: 'casual',
    sizes: [7, 8, 9, 10, 11],
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000107'),
    name: 'Stride Metro Street Suede',
    description: 'Premium suede everyday sneakers with retro court aesthetic and reinforced collar.',
    price: 3999,
    category: 'casual',
    sizes: [7, 8, 9, 10, 11, 12],
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000108'),
    name: 'Stride Vintage Court 90',
    description: 'Retro low-top leather kick with tonal stitching and all-day comfort sockliner.',
    price: 3299,
    category: 'casual',
    sizes: [6, 7, 8, 9, 10],
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop',
  },

  // 3 Sports products
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000109'),
    name: 'Stride High-Flyer Basketball',
    description: 'High-top court performance shoe providing lateral stability and high-impact heel cushioning.',
    price: 6499,
    category: 'sports',
    sizes: [8, 9, 10, 11, 12],
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000110'),
    name: 'Stride Dynamo Turf Trainer',
    description: 'Precision turf footwear designed for multi-sport field movement and traction control.',
    price: 4499,
    category: 'sports',
    sizes: [7, 8, 9, 10, 11],
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000111'),
    name: 'Stride Titan Lift Pro',
    description: 'Flat-sole cross-training and powerlifting shoe with dual lockdown straps.',
    price: 5999,
    category: 'sports',
    sizes: [8, 9, 10, 11, 12],
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop',
  },

  // 4 Sandals products
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000112'),
    name: 'Stride Oasis Comfort Sandal',
    description: 'Ergonomic cork-footbed leather strap sandals designed for outdoor walking and summer wear.',
    price: 2299,
    category: 'sandals',
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000113'),
    name: 'Stride Trekker Utility Sandal',
    description: 'Durable quick-dry sports sandals with adjustable webbing straps and rugged rubber outsole.',
    price: 2799,
    category: 'sandals',
    sizes: [7, 8, 9, 10, 11],
    stock: 40,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Original_Tevas.jpg',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000114'),
    name: 'Stride Breeze Slide Sandal',
    description: 'Ultra-soft molded EVA slides providing waterproof comfort for poolside and leisure.',
    price: 1499,
    category: 'sandals',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1596523027665-9da35ced2388?w=600&auto=format&fit=crop',
  },
  {
    _id: new mongoose.Types.ObjectId('66f000000000000000000115'),
    name: 'Stride Solstice Leather Flip-Flop',
    description: 'Premium full-grain leather thong sandals with contoured supportive footbed.',
    price: 1899,
    category: 'sandals',
    sizes: [7, 8, 9, 10, 11],
    stock: 50,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Hari_Mari_Dark_Gray_and_Neon_Green_Leather_Lakes.jpg',
  },
];

const addProducts = async () => {
  try {
    await connectDB();

    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of additionalProducts) {
      const result = await Product.updateOne(
        { _id: item._id },
        { $setOnInsert: item },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Insertion completed. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);
  } catch (error) {
    console.error(`Error adding products: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

addProducts();
