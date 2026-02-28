require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq';

// Get command line argument
const command = process.argv[2]; // 'populate' or 'delete'

const sampleLawyers = [
  {
    name: 'Adv. Suhas',
    email: 'lawyer1@test.com',
    password: 'test@123',
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
    consultationFee: 1500
  },
  {
    name: 'Adv. Rajesh Kumar',
    email: 'rajesh.kumar@kbalaw.in',
    password: 'test@123',
    phone: '+91 98450 12345',
    barRegistrationNo: 'KBA/2005/1234',
    specialization: ['Criminal Law', 'Constitutional Law'],
    experience: 18,
    location: 'Bangalore',
    court: 'High Court of Karnataka',
    address: '123, MG Road, Bangalore - 560001',
    languages: ['English', 'Kannada', 'Hindi'],
    education: 'LLB, LLM (Criminal Law)',
    description: 'Specialized in criminal defense and constitutional matters with extensive experience in High Court and Supreme Court cases.',
    consultationFee: 1000
  },
  {
    name: 'Adv. Priya Sharma',
    email: 'priya.sharma@kbalaw.in',
    password: 'test@123',
    phone: '+91 98765 43210',
    barRegistrationNo: 'KBA/2010/5678',
    specialization: ['Civil Law', 'Property Law'],
    experience: 12,
    location: 'Bangalore',
    court: 'District Court',
    address: '456, Brigade Road, Bangalore - 560025',
    languages: ['English', 'Hindi'],
    education: 'LLB, LLM (Property Law)',
    description: 'Expert in property disputes and civil litigation with a strong track record in land acquisition cases.',
    consultationFee: 800
  },
  {
    name: 'Adv. Mohammed Farooq',
    email: 'mohammed.farooq@kbalaw.in',
    password: 'test@123',
    phone: '+91 99876 54321',
    barRegistrationNo: 'KBA/2008/9012',
    specialization: ['Family Law', 'Civil Law'],
    experience: 14,
    location: 'Mysore',
    court: 'Family Court',
    address: '789, Sayyaji Rao Road, Mysore - 570001',
    languages: ['English', 'Kannada', 'Urdu'],
    education: 'LLB, Diploma in Family Law',
    description: 'Compassionate family law practitioner specializing in divorce, custody, and matrimonial disputes.',
    consultationFee: 750
  },
  {
    name: 'Adv. Lakshmi Venkatesh',
    email: 'lakshmi.v@kbalaw.in',
    password: 'test@123',
    phone: '+91 97654 32109',
    barRegistrationNo: 'KBA/2012/3456',
    specialization: ['Corporate Law', 'Tax Law'],
    experience: 10,
    location: 'Bangalore',
    court: 'High Court of Karnataka',
    address: '321, Residency Road, Bangalore - 560025',
    languages: ['English', 'Tamil', 'Kannada'],
    education: 'LLB, LLM (Corporate Law), CA',
    description: 'Corporate legal advisor with expertise in mergers, acquisitions, and tax compliance for startups and SMEs.',
    consultationFee: 1200
  }
];

async function populateLawyers() {
  console.log('✅ Connected to MongoDB');
  console.log('\n📝 Populating sample lawyers for testing...\n');
  
  let created = 0;
  let skipped = 0;
  
  for (const lawyerData of sampleLawyers) {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: lawyerData.email });
      
      if (!user) {
        // Create user account
        const hashedPassword = await bcrypt.hash(lawyerData.password, 10);
        user = await User.create({
          name: lawyerData.name,
          email: lawyerData.email,
          password: hashedPassword,
          phone: lawyerData.phone,
          role: 'lawyer',
          isVerified: true,
          address: {
            street: lawyerData.address,
            city: lawyerData.location,
            state: 'Karnataka',
            pincode: ''
          }
        });
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`⏭️  User already exists: ${user.email}`);
      }
      
      // Check if lawyer profile exists
      let lawyer = await Lawyer.findOne({ email: lawyerData.email });
      
      if (!lawyer) {
        // Create lawyer profile
        lawyer = await Lawyer.create({
          userId: user._id,
          name: lawyerData.name,
          email: lawyerData.email,
          phone: lawyerData.phone,
          barRegistrationNo: lawyerData.barRegistrationNo,
          specialization: lawyerData.specialization,
          experience: lawyerData.experience,
          location: lawyerData.location,
          court: lawyerData.court,
          address: lawyerData.address,
          languages: lawyerData.languages,
          education: lawyerData.education,
          description: lawyerData.description,
          rating: 4.5,
          totalReviews: 0,
          consultationFee: lawyerData.consultationFee,
          availability: true,
          isVerified: true,
          source: 'manual'
        });
        console.log(`   ✅ Created lawyer profile: ${lawyer.name}`);
        created++;
      } else {
        console.log(`   ⏭️  Lawyer profile already exists: ${lawyer.name}`);
        skipped++;
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating ${lawyerData.name}:`, error.message);
    }
  }
  
  const total = await Lawyer.countDocuments({ isVerified: true });
  console.log(`\n✅ Population complete!`);
  console.log(`   Created: ${created} new lawyers`);
  console.log(`   Skipped: ${skipped} existing lawyers`);
  console.log(`   Total verified lawyers: ${total}`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Email: lawyer1@test.com (Suhas)');
  console.log('   Email: rajesh.kumar@kbalaw.in (Rajesh)');
  console.log('   Password: test@123 (for all sample lawyers)');
}

async function deleteSampleLawyers() {
  console.log('✅ Connected to MongoDB');
  console.log('\n🗑️  Deleting sample lawyers with password test@123...\n');
  
  const sampleEmails = sampleLawyers.map(l => l.email);
  
  // First, verify which users have the test password
  const usersToDelete = [];
  for (const email of sampleEmails) {
    const user = await User.findOne({ email, role: 'lawyer' });
    if (user && user.password) {
      const isTestPassword = await bcrypt.compare('test@123', user.password);
      if (isTestPassword) {
        usersToDelete.push(email);
        console.log(`✓ Verified test password for: ${email}`);
      } else {
        console.log(`✗ Skipping ${email} - not using test password`);
      }
    } else {
      console.log(`✗ User not found or no password: ${email}`);
    }
  }
  
  if (usersToDelete.length === 0) {
    console.log('\n⚠️  No users with test@123 password found to delete');
    return;
  }
  
  console.log(`\n📋 Will delete ${usersToDelete.length} lawyers with test password\n`);
  
  // Delete lawyer profiles
  const lawyerResult = await Lawyer.deleteMany({
    email: { $in: usersToDelete },
    source: 'manual'
  });
  console.log(`✅ Deleted ${lawyerResult.deletedCount} lawyer profiles`);
  
  // Delete user accounts
  const userResult = await User.deleteMany({
    email: { $in: usersToDelete },
    role: 'lawyer'
  });
  console.log(`✅ Deleted ${userResult.deletedCount} user accounts`);
  
  const remaining = await Lawyer.countDocuments({ isVerified: true });
  console.log(`\n✅ Deletion complete!`);
  console.log(`   Remaining verified lawyers: ${remaining}`);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    if (command === 'delete') {
      await deleteSampleLawyers();
    } else {
      await populateLawyers();
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
