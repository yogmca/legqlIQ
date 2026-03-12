const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legaliq');

async function enableDocumentUpload() {
  try {
    console.log('🔧 Enabling document upload for test users...\n');

    // Enable for santuzing@gmail.com
    const user1 = await User.findOneAndUpdate(
      { email: 'santuzing@gmail.com' },
      {
        $set: {
          'features.documentUpload': true,
          'features.videoConsultation': true
        }
      },
      { returnDocument: 'after' }
    );

    if (user1) {
      console.log('✅ Enabled for:', user1.email);
      console.log('   Document Upload:', user1.features?.documentUpload);
    } else {
      console.log('❌ User not found: santuzing@gmail.com');
    }

    // Enable for sanjay.sngh@gmail.com
    const user2 = await User.findOneAndUpdate(
      { email: 'sanjay.sngh@gmail.com' },
      {
        $set: {
          'features.documentUpload': true,
          'features.videoConsultation': true
        }
      },
      { returnDocument: 'after' }
    );

    if (user2) {
      console.log('✅ Enabled for:', user2.email);
      console.log('   Document Upload:', user2.features?.documentUpload);
    } else {
      console.log('❌ User not found: sanjay.sngh@gmail.com');
    }

    console.log('\n✨ Document upload feature enabled for test users!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

enableDocumentUpload();
