require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const sampleProducts = [
  {
    name: 'Stride Velocity Nitro',
    description: 'High-performance marathon running shoe with maximum energy return.',
    price: 129.99,
    category: 'running',
    sizes: [7, 8, 9, 10, 11],
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Cloudburst Runner',
    description: 'Ultra-lightweight mesh upper for breathable daily runs.',
    price: 109.99,
    category: 'running',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Trail Blaze X',
    description: 'All-terrain trail running shoes with enhanced grip lugs.',
    price: 149.99,
    category: 'running',
    sizes: [8, 9, 10, 11, 12],
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Street Minimalist',
    description: 'Sleek canvas sneakers designed for versatile everyday wear.',
    price: 79.99,
    category: 'casual',
    sizes: [7, 8, 9, 10, 11],
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Retro Court 88',
    description: 'Classic low-top leather sneaker with vintage court styling.',
    price: 89.99,
    category: 'casual',
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Urban Slip-On',
    description: 'Effortless slip-on design with memory foam cushioning.',
    price: 69.99,
    category: 'casual',
    sizes: [7, 8, 9, 10, 11, 12],
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Oxford Classique',
    description: 'Handcrafted full-grain leather Oxford dress shoes.',
    price: 159.99,
    category: 'formal',
    sizes: [8, 9, 10, 11],
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Sovereign Brogue',
    description: 'Classic wingtip brogues for weddings and executive meetings.',
    price: 179.99,
    category: 'formal',
    sizes: [7, 8, 9, 10, 11],
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Executive Derby',
    description: 'Polished calfskin Derby shoes with cushioned leather insoles.',
    price: 139.99,
    category: 'formal',
    sizes: [8, 9, 10, 11, 12],
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Court Impact Basketball',
    description: 'High-top basketball shoes with dynamic ankle support.',
    price: 139.99,
    category: 'sports',
    sizes: [9, 10, 11, 12, 13],
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride Apex Turf Soccer',
    description: 'Turf cleats built for agility, touch, and rapid acceleration.',
    price: 99.99,
    category: 'sports',
    sizes: [7, 8, 9, 10, 11],
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop',
  },
  {
    name: 'Stride PowerLift Trainer',
    description: 'Flat-soled weightlifting and cross-training shoes for heavy squats.',
    price: 119.99,
    category: 'sports',
    sizes: [8, 9, 10, 11, 12],
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop',
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    console.log('Clearing existing products...');
    await Product.deleteMany();

    console.log('Inserting sample products...');
    const createdProducts = await Product.insertMany(sampleProducts);

    console.log(`Successfully seeded ${createdProducts.length} sample products!`);
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding products: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
