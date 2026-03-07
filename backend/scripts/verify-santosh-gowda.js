require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

async function verifySantoshGowda() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Santosh Gowda (case-insensitive search)
    const santosh = await Lawyer.findOne({
      name: { $regex: /santosh.*gowda/i }
    });

    if (!santosh) {
      console.log('❌ Santosh Gowda not found in database');
      console.log('\nSearching for all unverified lawyers...');
      
      const unverifiedLawyers = await Lawyer.find({ isVerified: false });
      console.log(`\nFound ${unverifiedLawyers.length} unverified lawyers:`);
      unverifiedLawyers.forEach(lawyer => {
        console.log(`- ${lawyer.name} (${lawyer.email}) - Professional Type: ${lawyer.professionalType}`);
      });
      
      if (unverifiedLawyers.length > 0) {
        console.log('\n⚠️  These lawyers need to be verified to appear in search results');
      }
    } else {
      console.log('\n✅ Found Santosh Gowda:');
      console.log(`   Name: ${santosh.name}`);
      console.log(`   Email: ${santosh.email}`);
      console.log(`   Phone: ${santosh.phone}`);
      console.log(`   Professional Type: ${santosh.professionalType}`);
      console.log(`   Bar Registration No: ${santosh.barRegistrationNo}`);
      console.log(`   Specialization: ${santosh.specialization}`);
      console.log(`   Location: ${santosh.location}`);
      console.log(`   Is Verified: ${santosh.isVerified}`);

      if (!santosh.isVerified) {
        console.log('\n🔧 Verifying Santosh Gowda...');
        santosh.isVerified = true;
        await santosh.save();
        console.log('✅ Santosh Gowda has been verified and will now appear in search results!');
      } else {
        console.log('\n✅ Santosh Gowda is already verified');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifySantoshGowda();
