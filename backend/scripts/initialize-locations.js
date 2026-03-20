const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Lawyer = require('../models/Lawyer');
const Location = require('../models/Location');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

async function initializeLocations() {
  try {
    console.log('🚀 Initializing locations from existing professionals...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all professionals
    const professionals = await Lawyer.find({}).select('location professionalType');
    console.log(`📊 Found ${professionals.length} professionals in database\n`);

    if (professionals.length === 0) {
      console.log('⚠️  No professionals found. Please register some professionals first.');
      process.exit(0);
    }

    // Extract unique locations
    const locationCounts = {};
    professionals.forEach(prof => {
      if (prof.location && prof.location.trim()) {
        const city = prof.location.trim();
        locationCounts[city] = (locationCounts[city] || 0) + 1;
      }
    });

    const uniqueLocations = Object.keys(locationCounts);
    console.log(`📍 Found ${uniqueLocations.length} unique locations:\n`);

    // Add or update each location in database
    let addedCount = 0;
    let updatedCount = 0;

    for (const city of uniqueLocations) {
      const count = locationCounts[city];
      
      // Check if location already exists
      const existingLocation = await Location.findOne({ 
        city: { $regex: new RegExp(`^${city}$`, 'i') } 
      });

      if (existingLocation) {
        // Update count
        existingLocation.professionalCount = count;
        existingLocation.addedBy = 'system';
        await existingLocation.save();
        console.log(`   ✓ Updated: ${city} (${count} professionals)`);
        updatedCount++;
      } else {
        // Create new location
        await Location.create({
          city: city,
          professionalCount: count,
          addedBy: 'system',
          isActive: true
        });
        console.log(`   + Added: ${city} (${count} professionals)`);
        addedCount++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Added: ${addedCount} new locations`);
    console.log(`🔄 Updated: ${updatedCount} existing locations`);
    console.log(`📍 Total unique locations: ${uniqueLocations.length}`);
    console.log(`👥 Total professionals: ${professionals.length}`);
    
    // Display all locations sorted by professional count
    console.log(`\n📋 All Locations (sorted by professional count):\n`);
    const allLocations = await Location.find({ isActive: true })
      .sort({ professionalCount: -1, city: 1 });
    
    allLocations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.city} - ${loc.professionalCount} professional(s)`);
    });

    console.log('\n✨ Location initialization completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing locations:', error);
    process.exit(1);
  }
}

// Run the script
initializeLocations();
