require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

async function migrateProfessionalType() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all lawyers without professionalType field
    const lawyersWithoutType = await Lawyer.find({
      $or: [
        { professionalType: { $exists: false } },
        { professionalType: null },
        { professionalType: '' }
      ]
    });

    console.log(`Found ${lawyersWithoutType.length} lawyers without professionalType`);

    if (lawyersWithoutType.length > 0) {
      // Update all lawyers without professionalType to 'lawyer'
      const result = await Lawyer.updateMany(
        {
          $or: [
            { professionalType: { $exists: false } },
            { professionalType: null },
            { professionalType: '' }
          ]
        },
        {
          $set: { professionalType: 'lawyer' }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} lawyers with professionalType='lawyer'`);
    }

    // Verify the update
    const allLawyers = await Lawyer.find({});
    console.log('\n📊 All lawyers in database:');
    allLawyers.forEach(lawyer => {
      console.log(`  - ${lawyer.name}: professionalType='${lawyer.professionalType}', verified=${lawyer.isVerified}`);
    });

    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateProfessionalType();
