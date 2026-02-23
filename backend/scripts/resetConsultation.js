const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
require('dotenv').config({ path: '../.env' });

async function resetConsultation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');
    console.log('Connected to MongoDB');

    // Find the consultation
    const consultation = await Consultation.findById('69995e8dff97397a06735ae7');
    
    if (!consultation) {
      console.log('❌ Consultation not found');
      await mongoose.connection.close();
      return;
    }

    console.log('\n=== Before Update ===');
    console.log('Consultation ID:', consultation._id);
    console.log('Client:', consultation.clientInfo?.name);
    console.log('Lawyer:', consultation.lawyerInfo?.name);
    console.log('Status:', consultation.status);
    console.log('Date:', consultation.preferredDate);
    console.log('Time:', consultation.preferredTime);

    // Get tomorrow's date at 2 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM

    // Update the consultation
    consultation.status = 'confirmed';
    consultation.preferredDate = tomorrow;
    consultation.preferredTime = '14:00';
    await consultation.save();

    console.log('\n=== After Update ===');
    console.log('Status:', consultation.status);
    console.log('Date:', consultation.preferredDate);
    console.log('Time:', consultation.preferredTime);

    console.log('\n✅ Consultation updated successfully!');
    console.log('Both Ocean Fins and Suhas should now see this in the "Upcoming" tab');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
}

resetConsultation();
