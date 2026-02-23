const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

// Import models
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

// Import lawyers data
const { lawyersData } = require('../lawyersData');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Populate lawyers
const populateLawyers = async () => {
  try {
    console.log('\n🚀 Starting lawyer population process...\n');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const lawyerData of lawyersData) {
      try {
        // Check if lawyer profile already exists
        const existingLawyer = await Lawyer.findOne({
          $or: [
            { email: lawyerData.email },
            { barRegistrationNo: lawyerData.barRegistrationNo }
          ]
        });

        if (existingLawyer) {
          console.log(`⏭️  Skipping ${lawyerData.name} - Lawyer profile already exists`);
          skipCount++;
          continue;
        }

        // Check if user already exists
        let user = await User.findOne({ email: lawyerData.email });
        
        if (user) {
          // User exists, just update role to 'lawyer' if needed
          if (user.role !== 'lawyer') {
            user.role = 'lawyer';
            await user.save();
            console.log(`🔄 Updated ${lawyerData.name} role to 'lawyer'`);
          }
        } else {
          // Create new user account with role 'lawyer'
          user = await User.create({
            name: lawyerData.name,
            email: lawyerData.email,
            phone: lawyerData.phone,
            password: 'Legal@2026', // Default password
            role: 'lawyer',
            isVerified: true,
            address: {
              street: lawyerData.address,
              city: lawyerData.location,
              state: 'Karnataka',
              pincode: ''
            }
          });
        }

        // Create Lawyer profile
        const lawyer = await Lawyer.create({
          userId: user._id,
          name: lawyerData.name,
          email: lawyerData.email,
          phone: lawyerData.phone,
          barRegistrationNo: lawyerData.barRegistrationNo,
          specialization: lawyerData.specialization,
          experience: lawyerData.experience,
          location: lawyerData.location,
          court: lawyerData.court,
          education: lawyerData.education,
          languages: lawyerData.languages,
          description: lawyerData.description,
          address: lawyerData.address,
          consultationFee: 1000, // Default consultation fee
          rating: 4.5, // Default rating
          totalReviews: 0,
          availability: true, // Lawyer is available
          isVerified: true // Mark as verified
        });

        console.log(`✅ Created: ${lawyerData.name} (${lawyerData.email})`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error creating ${lawyerData.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Population Summary:');
    console.log(`   ✅ Successfully created: ${successCount} lawyers`);
    console.log(`   ⏭️  Skipped (already exist): ${skipCount} lawyers`);
    console.log(`   ❌ Errors: ${errorCount} lawyers`);
    console.log(`   📝 Total processed: ${lawyersData.length} lawyers\n`);

    console.log('🎉 Lawyer population process completed!\n');
    console.log('📌 Default credentials for all lawyers:');
    console.log('   Username: [lawyer email]');
    console.log('   Password: Legal@2026\n');

  } catch (error) {
    console.error('❌ Fatal error during population:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await populateLawyers();
};

run();
