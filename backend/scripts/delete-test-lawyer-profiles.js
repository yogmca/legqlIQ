const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
require('dotenv').config({ path: './.env' });

async function deleteTestLawyerProfiles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find all users with @kbalaw.in email (test accounts)
    const testUsers = await User.find({
      email: { $regex: /@kbalaw\.in$/i }
    });

    console.log(`\n📊 Found ${testUsers.length} test users with @kbalaw.in emails`);

    let deletedCount = 0;

    for (const user of testUsers) {
      console.log(`\n👤 Processing: ${user.name} (${user.email})`);

      // Find and delete professional profile
      const professionalProfile = await Lawyer.findOne({ userId: user._id });

      if (professionalProfile) {
        await Lawyer.deleteOne({ _id: professionalProfile._id });
        console.log(`   🗑️  Deleted professional profile (ID: ${professionalProfile._id})`);
        deletedCount++;
      } else {
        console.log(`   ℹ️  No professional profile found`);
      }

      // Delete the user account
      await User.deleteOne({ _id: user._id });
      console.log(`   🗑️  Deleted user account`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Test users deleted: ${testUsers.length}`);
    console.log(`   Professional profiles deleted: ${deletedCount}`);

    // Show remaining professionals count
    const remainingProfessionals = await Lawyer.countDocuments();
    console.log(`\n✅ Remaining professional profiles: ${remainingProfessionals}`);

    // Show breakdown by type
    const lawyers = await Lawyer.countDocuments({ professionalType: 'lawyer' });
    const taxConsultants = await Lawyer.countDocuments({ professionalType: 'tax-consultant' });
    const auditors = await Lawyer.countDocuments({ professionalType: 'auditor' });

    console.log(`   - Lawyers: ${lawyers}`);
    console.log(`   - Tax Consultants: ${taxConsultants}`);
    console.log(`   - Auditors: ${auditors}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteTestLawyerProfiles();
