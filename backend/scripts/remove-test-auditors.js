const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
require('dotenv').config({ path: './.env' });

async function removeTestAuditors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // List of test auditor emails to remove
    const testEmails = [
      'ranesgbabu@gmail.com'
    ];

    console.log(`\n🔍 Searching for test auditors...`);

    let removedCount = 0;

    for (const email of testEmails) {
      console.log(`\n📧 Processing: ${email}`);

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        console.log(`   ⚠️  User not found`);
        continue;
      }

      console.log(`   👤 Found user: ${user.name} (Role: ${user.role})`);

      // Find and delete professional profile
      const professionalProfile = await Lawyer.findOne({ userId: user._id });

      if (professionalProfile) {
        await Lawyer.deleteOne({ _id: professionalProfile._id });
        console.log(`   🗑️  Deleted professional profile (ID: ${professionalProfile._id})`);
      } else {
        console.log(`   ℹ️  No professional profile found`);
      }

      // Delete user account
      await User.deleteOne({ _id: user._id });
      console.log(`   🗑️  Deleted user account`);
      removedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Test users removed: ${removedCount}`);

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

    // List all remaining auditors
    console.log(`\n📋 Remaining auditors:`);
    const remainingAuditors = await Lawyer.find({ professionalType: 'auditor' });
    remainingAuditors.forEach((auditor, index) => {
      console.log(`   ${index + 1}. ${auditor.name} (${auditor.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

removeTestAuditors();
