const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Location = require('../models/Location');
require('dotenv').config({ path: './.env' });

async function fixIncompleteProfessional() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find the user by name
    const userName = 'Meela Ramesh Babu';
    const user = await User.findOne({ name: userName });

    if (!user) {
      console.log(`❌ User "${userName}" not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user._id}`);

    // Check if professional profile already exists
    const existingProfile = await Lawyer.findOne({ userId: user._id });

    if (existingProfile) {
      console.log(`✅ Professional profile already exists for ${user.name}`);
      console.log(`   Professional ID: ${existingProfile._id}`);
      console.log(`   Professional Type: ${existingProfile.professionalType}`);
      process.exit(0);
    }

    // Create professional profile
    console.log(`\n📝 Creating professional profile for ${user.name}...`);

    const professionalData = {
      userId: user._id,
      professionalType: user.role, // auditor, tax-consultant, or lawyer
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialization: ['General'], // Default specialization
      experience: 0, // Default experience
      location: 'Not specified', // Default location
      court: 'Not specified', // Default court/firm name
      education: '',
      consultationFee: 500,
      description: '',
      languages: [],
      isVerified: true,
      source: 'registration',
      profilePicture: user.profilePicture || ''
    };

    const professional = await Lawyer.create(professionalData);

    console.log(`✅ Professional profile created successfully!`);
    console.log(`   Professional ID: ${professional._id}`);
    console.log(`   Professional Type: ${professional.professionalType}`);
    console.log(`\n⚠️  Note: User should update their profile with complete information`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixIncompleteProfessional();
