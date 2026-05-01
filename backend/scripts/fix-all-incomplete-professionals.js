const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Location = require('../models/Location');
require('dotenv').config({ path: './.env' });

async function fixAllIncompleteProfessionals() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find all users with professional roles
    const professionals = await User.find({
      role: { $in: ['lawyer', 'tax-consultant', 'auditor'] }
    });

    console.log(`\n📊 Found ${professionals.length} professional users`);

    let fixedCount = 0;
    let alreadyCompleteCount = 0;

    for (const user of professionals) {
      console.log(`\n👤 Checking: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);

      // Check if professional profile exists
      const existingProfile = await Lawyer.findOne({ userId: user._id });

      if (existingProfile) {
        console.log(`   ✅ Professional profile exists`);
        alreadyCompleteCount++;
        continue;
      }

      // Create professional profile
      console.log(`   📝 Creating professional profile...`);

      const professionalData = {
        userId: user._id,
        professionalType: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: ['General'],
        experience: 0,
        location: 'Not specified',
        court: 'Not specified',
        education: '',
        consultationFee: 500,
        description: '',
        languages: [],
        isVerified: true,
        source: 'registration',
        profilePicture: user.profilePicture || ''
      };

      // Don't set registration numbers to avoid duplicate key errors
      // They will remain undefined which is different from null
      
      const professional = await Lawyer.create(professionalData);
      console.log(`   ✅ Professional profile created (ID: ${professional._id})`);
      fixedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total professionals: ${professionals.length}`);
    console.log(`   Already complete: ${alreadyCompleteCount}`);
    console.log(`   Fixed: ${fixedCount}`);

    if (fixedCount > 0) {
      console.log(`\n⚠️  Note: Fixed users should update their profiles with complete information`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixAllIncompleteProfessionals();
