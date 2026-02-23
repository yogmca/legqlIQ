const mongoose = require('mongoose');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
require('dotenv').config({ path: '../.env' });

async function checkOceanFins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Find Ocean Fins user
    const oceanFins = await User.findById('69969ee48edc59e684a7d122');
    console.log('\n=== Ocean Fins User ===');
    if (oceanFins) {
      console.log('User ID:', oceanFins._id);
      console.log('Name:', oceanFins.name);
      console.log('Email:', oceanFins.email);
      console.log('Role:', oceanFins.role);
    } else {
      console.log('❌ User not found');
    }

    // Find the consultation with Ocean Fins
    const consultation = await Consultation.findById('69995e8dff97397a06735ae7');
    console.log('\n=== Consultation 69995e8dff97397a06735ae7 ===');
    if (consultation) {
      console.log('Consultation ID:', consultation._id);
      console.log('Client ID:', consultation.clientId);
      console.log('Client Name:', consultation.clientInfo?.name);
      console.log('Client Email:', consultation.clientInfo?.email);
      console.log('Lawyer ID:', consultation.lawyerId);
      console.log('Lawyer Name:', consultation.lawyerInfo?.name);
      console.log('Status:', consultation.status);
      console.log('Date:', consultation.preferredDate);
      console.log('Time:', consultation.preferredTime);
      console.log('Type:', consultation.consultationType);
      
      // Check if clientId matches Ocean Fins
      if (oceanFins && consultation.clientId.toString() === oceanFins._id.toString()) {
        console.log('\n✅ This consultation belongs to Ocean Fins as CLIENT');
      } else {
        console.log('\n❌ Client ID mismatch!');
        console.log('Expected:', oceanFins?._id.toString());
        console.log('Got:', consultation.clientId.toString());
      }
    } else {
      console.log('❌ Consultation not found');
    }

    // Find all consultations for Ocean Fins
    const oceanConsultations = await Consultation.find({ clientId: '69969ee48edc59e684a7d122' });
    console.log(`\n=== All Consultations for Ocean Fins ===`);
    console.log('Total:', oceanConsultations.length);
    oceanConsultations.forEach((c, i) => {
      console.log(`\n${i + 1}. ID: ${c._id}`);
      console.log(`   Lawyer: ${c.lawyerInfo?.name}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Date: ${c.preferredDate}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

checkOceanFins();
