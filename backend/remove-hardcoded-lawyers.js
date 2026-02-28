require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Delete all hardcoded lawyers (those with source: 'manual' or 'hardcoded')
    const result = await Lawyer.deleteMany({
      $or: [
        { source: 'manual' },
        { source: 'hardcoded' },
        { source: { $exists: false } }
      ]
    });
    
    console.log(`\n✅ Deleted ${result.deletedCount} hardcoded lawyers`);
    
    // Now create Suhas lawyer profile if user exists
    const suhasUser = await User.findOne({ email: 'lawyer1@test.com' });
    
    if (suhasUser) {
      const suhasLawyer = await Lawyer.create({
        userId: suhasUser._id,
        name: 'Adv. Suhas',
        email: 'lawyer1@test.com',
        phone: '6361793004',
        barRegistrationNo: 'KAR/2018/128',
        specialization: ['Criminal Law', 'Civil Law'],
        experience: 15,
        location: 'Bangalore',
        court: 'High Court of Karnataka',
        address: 'MG Road, Bangalore - 560001',
        languages: ['English', 'Kannada', 'Hindi'],
        education: 'LLB, LLM',
        description: 'Experienced criminal and civil lawyer with 15 years of practice in High Court',
        rating: 4.5,
        totalReviews: 0,
        consultationFee: 1500,
        availability: true,
        isVerified: true,
        source: 'registered' // Mark as registered, not hardcoded
      });
      
      console.log('\n✅ Created Suhas lawyer profile');
      console.log('   Name:', suhasLawyer.name);
      console.log('   Email:', suhasLawyer.email);
      console.log('   Location:', suhasLawyer.location);
      console.log('   Verified:', suhasLawyer.isVerified);
    } else {
      console.log('\n⚠️  Suhas user not found - please register first');
    }
    
    const total = await Lawyer.countDocuments({});
    console.log(`\n✅ Total lawyers in database now: ${total}`);
    console.log('✅ System is now ready for real lawyer registrations');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
