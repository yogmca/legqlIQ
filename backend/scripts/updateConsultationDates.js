const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
require('dotenv').config({ path: '../.env' });

async function updateConsultationDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Today:', today);
    console.log('Tomorrow:', tomorrow);

    // Find all consultations with status 'confirmed' or 'pending_payment'
    const consultations = await Consultation.find({
      status: { $in: ['confirmed', 'pending_payment', 'pending'] }
    });

    console.log(`\nFound ${consultations.length} active consultations`);

    // Update each consultation to tomorrow
    for (const consultation of consultations) {
      const oldDate = consultation.preferredDate;
      consultation.preferredDate = tomorrow;
      await consultation.save();
      
      console.log(`\n✅ Updated consultation ${consultation._id}`);
      console.log(`   Client: ${consultation.clientInfo?.name}`);
      console.log(`   Old date: ${oldDate}`);
      console.log(`   New date: ${consultation.preferredDate}`);
      console.log(`   Status: ${consultation.status}`);
    }

    console.log(`\n✅ Successfully updated ${consultations.length} consultations to tomorrow`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

updateConsultationDates();
