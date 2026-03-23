// Script to link existing lawyers to their user accounts
// Run this with: node backend/scripts/link-lawyers-to-users.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

async function linkLawyersToUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all lawyers without userId
    const lawyersWithoutUserId = await Lawyer.find({ userId: { $exists: false } });
    console.log(`\n📊 Found ${lawyersWithoutUserId.length} lawyers without userId`);

    let linked = 0;
    let notFound = 0;

    for (const lawyer of lawyersWithoutUserId) {
      // Try to find matching user by email
      const user = await User.findOne({ email: lawyer.email });
      
      if (user) {
        lawyer.userId = user._id;
        await lawyer.save();
        console.log(`✅ Linked ${lawyer.name} (${lawyer.email}) to user account`);
        linked++;
      } else {
        console.log(`⚠️  No user account found for ${lawyer.name} (${lawyer.email})`);
        notFound++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   - Linked: ${linked}`);
    console.log(`   - Not found: ${notFound}`);
    console.log(`\n💡 Lawyers without user accounts need to register at /register to enable chat`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

linkLawyersToUsers();
