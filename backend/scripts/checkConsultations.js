const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function checkConsultations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Find Suhas user
    const suhasUser = await User.findOne({ email: 'yogemca@gmail.com' });
    console.log('\n=== Suhas User ===');
    console.log('User ID:', suhasUser._id);
    console.log('Name:', suhasUser.name);
    console.log('Email:', suhasUser.email);
    console.log('Role:', suhasUser.role);

    // Find linked lawyer
    const lawyer = await Lawyer.findOne({ userId: suhasUser._id });
    console.log('\n=== Linked Lawyer ===');
    if (lawyer) {
      console.log('Lawyer ID:', lawyer._id);
      console.log('Name:', lawyer.name);
      console.log('Email:', lawyer.email);
    } else {
      console.log('❌ No lawyer record found');
      await mongoose.connection.close();
      return;
    }

    // Find all consultations
    const allConsultations = await Consultation.find({}).lean();
    console.log('\n=== All Consultations in Database ===');
    console.log('Total consultations:', allConsultations.length);

    // Find consultations where this lawyer is the lawyer
    const lawyerConsultations = await Consultation.find({ lawyerId: lawyer._id }).lean();
    console.log('\n=== Consultations for Suhas (as lawyer) ===');
    console.log('Total:', lawyerConsultations.length);
    
    if (lawyerConsultations.length > 0) {
      lawyerConsultations.forEach((c, i) => {
        console.log(`\n${i + 1}. Consultation ID: ${c._id}`);
        console.log(`   Client: ${c.clientInfo?.name || 'N/A'}`);
        console.log(`   Case Type: ${c.caseType}`);
        console.log(`   Status: ${c.status}`);
        console.log(`   Date: ${c.preferredDate}`);
        console.log(`   Time: ${c.preferredTime}`);
        console.log(`   Created: ${c.createdAt}`);
      });
    } else {
      console.log('No consultations found for this lawyer');
      
      // Check if there are consultations with different lawyerId
      console.log('\n=== Checking all unique lawyer IDs in consultations ===');
      const uniqueLawyerIds = [...new Set(allConsultations.map(c => c.lawyerId?.toString()))];
      console.log('Unique lawyer IDs:', uniqueLawyerIds);
      console.log('Looking for lawyer ID:', lawyer._id.toString());
    }

    // Find consultations where this user is the client
    const clientConsultations = await Consultation.find({ clientId: suhasUser._id }).lean();
    console.log('\n=== Consultations for Suhas (as client) ===');
    console.log('Total:', clientConsultations.length);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

checkConsultations();
