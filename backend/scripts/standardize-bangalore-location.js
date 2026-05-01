const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');
const Location = require('../models/Location');
require('dotenv').config({ path: './.env' });

async function standardizeBangaloreLocation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find all professionals with "Bangalore" location (case insensitive)
    const bangaloreProfessionals = await Lawyer.find({
      location: { $regex: /^bangalore$/i }
    });

    console.log(`\n📊 Found ${bangaloreProfessionals.length} professionals with "Bangalore" location`);

    let updatedCount = 0;

    for (const professional of bangaloreProfessionals) {
      console.log(`\n👤 Updating: ${professional.name} (${professional.email})`);
      console.log(`   Current location: ${professional.location}`);
      
      // Update to "Bengaluru"
      professional.location = 'Bengaluru';
      await professional.save();
      
      console.log(`   ✅ Updated to: Bengaluru`);
      updatedCount++;
    }

    // Update Location collection
    const bangaloreLocation = await Location.findOne({ city: { $regex: /^bangalore$/i } });
    const bengaluruLocation = await Location.findOne({ city: 'Bengaluru' });

    if (bangaloreLocation) {
      console.log(`\n📍 Found "Bangalore" in Location collection (count: ${bangaloreLocation.count})`);
      
      if (bengaluruLocation) {
        // Merge counts
        console.log(`📍 Found "Bengaluru" in Location collection (count: ${bengaluruLocation.count})`);
        bengaluruLocation.count += bangaloreLocation.count;
        await bengaluruLocation.save();
        console.log(`✅ Merged counts into Bengaluru (new count: ${bengaluruLocation.count})`);
        
        // Delete Bangalore entry
        await Location.deleteOne({ _id: bangaloreLocation._id });
        console.log(`🗑️  Deleted "Bangalore" location entry`);
      } else {
        // Rename Bangalore to Bengaluru
        bangaloreLocation.city = 'Bengaluru';
        await bangaloreLocation.save();
        console.log(`✅ Renamed "Bangalore" to "Bengaluru" in Location collection`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Professionals updated: ${updatedCount}`);
    console.log(`   All locations standardized to "Bengaluru"`);

    // Show final count
    const bengaluruProfessionals = await Lawyer.countDocuments({
      location: 'Bengaluru'
    });
    console.log(`\n✅ Total professionals in Bengaluru: ${bengaluruProfessionals}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

standardizeBangaloreLocation();
