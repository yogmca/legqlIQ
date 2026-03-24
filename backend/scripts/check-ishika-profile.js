require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

async function checkIshikaProfile() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Ishika Jain
    const ishika = await Lawyer.findOne({ name: 'Ishika Jain' });
    
    if (!ishika) {
      console.log('❌ Ishika Jain not found in database');
      process.exit(1);
    }

    console.log('\n📋 Ishika Jain Profile:');
    console.log('Name:', ishika.name);
    console.log('Email:', ishika.email);
    console.log('Professional Type:', ishika.professionalType);
    console.log('Is Verified:', ishika.isVerified);
    console.log('\n📸 Profile Picture Info:');
    console.log('Has profilePicture field:', 'profilePicture' in ishika);
    console.log('profilePicture value type:', typeof ishika.profilePicture);
    console.log('profilePicture is null:', ishika.profilePicture === null);
    console.log('profilePicture is undefined:', ishika.profilePicture === undefined);
    console.log('profilePicture is empty string:', ishika.profilePicture === '');
    console.log('profilePicture length:', ishika.profilePicture?.length || 0);
    
    if (ishika.profilePicture && ishika.profilePicture.length > 0) {
      console.log('profilePicture starts with:', ishika.profilePicture.substring(0, 50));
      console.log('✅ Profile picture exists in database');
    } else {
      console.log('❌ Profile picture is empty or null in database');
    }

    // Check the raw document
    console.log('\n🔍 Raw Document Check:');
    const rawDoc = await Lawyer.findOne({ name: 'Ishika Jain' }).lean();
    console.log('Raw profilePicture length:', rawDoc.profilePicture?.length || 0);
    console.log('Raw profilePicture type:', typeof rawDoc.profilePicture);
    
    if (rawDoc.profilePicture && rawDoc.profilePicture.length > 0) {
      console.log('Raw profilePicture starts with:', rawDoc.profilePicture.substring(0, 50));
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkIshikaProfile();
