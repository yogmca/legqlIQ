require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Get all lawyers
    const allLawyers = await Lawyer.find({});
    console.log(`\nTotal lawyers in database: ${allLawyers.length}`);
    console.log(`Verified: ${allLawyers.filter(l => l.isVerified).length}`);
    console.log(`Not verified: ${allLawyers.filter(l => !l.isVerified).length}`);
    
    // Update all to verified
    const result = await Lawyer.updateMany(
      {},
      { $set: { isVerified: true } }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} lawyers to verified status`);
    
    const verifiedCount = await Lawyer.countDocuments({ isVerified: true });
    console.log(`✅ Total verified lawyers now: ${verifiedCount}`);
    
    // Show first 5 lawyers
    const lawyers = await Lawyer.find({ isVerified: true }).limit(5).select('name location specialization');
    console.log('\nFirst 5 verified lawyers:');
    lawyers.forEach((l, i) => {
      console.log(`${i+1}. ${l.name} - ${l.location} - ${l.specialization.join(', ')}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
