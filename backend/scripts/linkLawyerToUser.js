const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
require('dotenv').config({ path: '../.env' });

async function linkLawyerToUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Find the user with role 'lawyer' named Suhas
    const users = await User.find({ role: 'lawyer' });
    console.log('\n=== Users with role "lawyer" ===');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });

    // Find all lawyers in the Lawyer collection
    const lawyers = await Lawyer.find({});
    console.log('\n=== Lawyers in Lawyer collection ===');
    lawyers.forEach(lawyer => {
      console.log(`ID: ${lawyer._id}`);
      console.log(`Name: ${lawyer.name}`);
      console.log(`Email: ${lawyer.email}`);
      console.log(`UserId: ${lawyer.userId || 'NOT SET'}`);
      console.log('---');
    });

    // Find Suhas user
    const suhasUser = users.find(u => u.name.toLowerCase().includes('suhas'));
    if (!suhasUser) {
      console.log('\n❌ No user named Suhas found with role "lawyer"');
      await mongoose.connection.close();
      return;
    }

    console.log(`\n✅ Found Suhas user: ${suhasUser.email} (ID: ${suhasUser._id})`);

    // Find Suhas lawyer record (by name or email)
    let suhasLawyer = lawyers.find(l => 
      l.name.toLowerCase().includes('suhas') || 
      l.email === suhasUser.email
    );

    if (suhasLawyer) {
      console.log(`\n✅ Found Suhas lawyer record: ${suhasLawyer.name} (ID: ${suhasLawyer._id})`);
      
      // Update the lawyer record to link to the user
      if (suhasLawyer.userId && suhasLawyer.userId.toString() === suhasUser._id.toString()) {
        console.log('✅ Lawyer record already linked to user!');
      } else {
        suhasLawyer.userId = suhasUser._id;
        await suhasLawyer.save();
        console.log('✅ Successfully linked lawyer record to user!');
      }
    } else {
      console.log('\n⚠️  No lawyer record found for Suhas');
      console.log('Creating a new lawyer record...');
      
      // Create a new lawyer record
      suhasLawyer = await Lawyer.create({
        userId: suhasUser._id,
        name: suhasUser.name,
        email: suhasUser.email,
        phone: suhasUser.phone || suhasUser.mobile || '0000000000',
        barRegistrationNo: `BAR${Date.now()}`,
        specialization: ['General Practice'],
        experience: 5,
        location: 'Bangalore',
        court: 'Karnataka High Court',
        description: 'Experienced lawyer',
        isVerified: true
      });
      console.log('✅ Created new lawyer record:', suhasLawyer._id);
    }

    // Verify the link
    const verifyLawyer = await Lawyer.findOne({ userId: suhasUser._id });
    if (verifyLawyer) {
      console.log('\n✅ VERIFICATION SUCCESSFUL!');
      console.log(`Lawyer "${verifyLawyer.name}" is now linked to user "${suhasUser.name}"`);
      console.log(`Lawyer ID: ${verifyLawyer._id}`);
      console.log(`User ID: ${suhasUser._id}`);
    } else {
      console.log('\n❌ VERIFICATION FAILED - Link not found');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

linkLawyerToUser();
