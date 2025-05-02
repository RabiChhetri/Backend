const mongoose = require('mongoose');
const Service = require('../models/Service');
const connectToMongo = require('../db');

const defaultServices = [
  { name: 'HairCut', price: 200, duration: '30 min' },
  { name: 'Shaving', price: 150, duration: '15 min' },
  { name: 'HairCut and Shaving', price: 250, duration: '45 min' },
  { name: 'Hair Color', price: 500, duration: '1 hrs' },
  { name: 'HairCut and Wash', price: 350, duration: '1 hrs' }
];

async function seedServices() {
  await connectToMongo();
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.insertMany(defaultServices);
    console.log('Default services seeded!');
  } else {
    console.log('Services already exist, skipping seeding.');
  }
  mongoose.connection.close();
}

seedServices().catch(err => {
  console.error('Seeding error:', err);
  mongoose.connection.close();
}); 