const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
require('dotenv').config({ path: '../.env' });

async function createLawyerForUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Find the Suhas user with yogemca@gmail.com
    const suhasUser = await User.findOne({ email: 'yogemca@gmail.com' });
    
    if (!suhasUser) {
      console.log('❌ User yogemca@gmail.com not found');
      await mongoose.connection.close();
      return;
    }

    console.log(`✅ Found user: ${suhasUser.name} (${suhasUser.email})`);
    console.log(`   User ID: ${suhasUser._id}`);
    console.log(`   Role: ${suhasUser.role}`);

    // Check if lawyer record already exists for this user
    let lawyer = await Lawyer.findOne({ userId: suhasUser._id });
    
    if (lawyer) {
      console.log(`\n✅ Lawyer record already exists!`);
      console.log(`   Lawyer ID: ${lawyer._id}`);
      console.log(`   Name: ${lawyer.name}`);
      console.log(`   Email: ${lawyer.email}`);
    } else {
      // Check if there's a lawyer with the same email
      lawyer = await Lawyer.findOne({ email: suhasUser.email });
      
      if (lawyer) {
        console.log(`\n✅ Found lawyer record with same email, updating userId...`);
        lawyer.userId = suhasUser._id;
        await lawyer.save();
        console.log(`   Updated lawyer record: ${lawyer._id}`);
      } else {
        // Create new lawyer record
        console.log(`\n⚠️  No lawyer record found, creating new one...`);
        lawyer = await Lawyer.create({
          userId: suhasUser._id,
          name: suhasUser.name,
          email: suhasUser.email,
          phone: suhasUser.phone || suhasUser.mobile || '9876543210',
          barRegistrationNo: `KAR${Date.now()}`,
          specialization: ['Civil Law', 'Criminal Law'],
          experience: 5,
          location: 'Bangalore',
          court: 'Karnataka High Court',
          description: 'Experienced lawyer specializing in civil and criminal cases',
          consultationFee: 1000,
          isVerified: true,
          availability: true
        });
        console.log(`✅ Created new lawyer record: ${lawyer._id}`);
      }
    }

    // Final verification
    console.log('\n=== FINAL VERIFICATION ===');
    const verifyLawyer = await Lawyer.findOne({ userId: suhasUser._id });
    if (verifyLawyer) {
      console.log('✅ SUCCESS! Lawyer record is properly linked');
      console.log(`   User: ${suhasUser.name} (${suhasUser.email})`);
      console.log(`   User ID: ${suhasUser._id}`);
      console.log(`   Lawyer ID: ${verifyLawyer._id}`);
      console.log(`   Lawyer Email: ${verifyLawyer.email}`);
    } else {
      console.log('❌ FAILED! No lawyer record found for this user');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

createLawyerForUser();
