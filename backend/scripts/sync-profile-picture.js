const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

const syncProfilePicture = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Find Santosh Gowda's user account
    const user = await User.findOne({ email: 'santuzing@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('\n=== User Profile ===');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Has Profile Picture:', user.profilePicture ? 'YES' : 'NO');
    if (user.profilePicture) {
      console.log('Profile Picture Length:', user.profilePicture.length, 'characters');
    }

    // Find corresponding lawyer profile
    const lawyer = await Lawyer.findOne({ userId: user._id });
    
    if (!lawyer) {
      console.log('\nLawyer profile not found');
      process.exit(1);
    }

    console.log('\n=== Lawyer Profile ===');
    console.log('Name:', lawyer.name);
    console.log('Email:', lawyer.email);
    console.log('Has Profile Picture:', lawyer.profilePicture ? 'YES' : 'NO');
    if (lawyer.profilePicture) {
      console.log('Profile Picture Length:', lawyer.profilePicture.length, 'characters');
    }

    // Sync profile picture from User to Lawyer if different
    if (user.profilePicture !== lawyer.profilePicture) {
      console.log('\n⚠️  Profile pictures are different! Syncing...');
      lawyer.profilePicture = user.profilePicture;
      await lawyer.save();
      console.log('✅ Profile picture synced successfully!');
    } else {
      console.log('\n✅ Profile pictures are already in sync');
    }

    // Verify the update
    const updatedLawyer = await Lawyer.findOne({ userId: user._id });
    console.log('\n=== After Sync ===');
    console.log('Lawyer Has Profile Picture:', updatedLawyer.profilePicture ? 'YES' : 'NO');
    if (updatedLawyer.profilePicture) {
      console.log('Profile Picture Length:', updatedLawyer.profilePicture.length, 'characters');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

syncProfilePicture();
