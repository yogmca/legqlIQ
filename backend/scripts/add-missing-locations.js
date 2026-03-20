const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Location = require('../models/Location');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

async function addLocation() {
  try {
    console.log('🚀 Adding location to database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Add "New Delhi/ NCR" location
    const locationName = 'New Delhi';
    
    const existingLocation = await Location.findOne({ 
      city: { $regex: new RegExp(`^${locationName}$`, 'i') } 
    });

    if (existingLocation) {
      console.log(`⚠️  Location "${locationName}" already exists with ${existingLocation.professionalCount} professionals`);
    } else {
      await Location.create({
        city: locationName,
        professionalCount: 1,
        addedBy: 'system',
        isActive: true
      });
      console.log(`✅ Added location: ${locationName}`);
    }

    // Also add "NCR" as separate location
    const ncrLocation = await Location.findOne({ 
      city: { $regex: new RegExp(`^NCR$`, 'i') } 
    });

    if (!ncrLocation) {
      await Location.create({
        city: 'NCR',
        professionalCount: 1,
        addedBy: 'system',
        isActive: true
      });
      console.log(`✅ Added location: NCR`);
    }

    // Display all locations
    console.log(`\n📋 All Locations in database:\n`);
    const allLocations = await Location.find({ isActive: true })
      .sort({ professionalCount: -1, city: 1 });
    
    allLocations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.city} - ${loc.professionalCount} professional(s)`);
    });

    console.log('\n✨ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Note: This script needs to run on a server with MongoDB Atlas connection.');
    console.log('   Run this on your EC2 server or ensure MONGODB_URI is set correctly in .env');
    process.exit(1);
  }
}

// Run the script
addLocation();
