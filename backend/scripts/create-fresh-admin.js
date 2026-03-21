const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createOrUpdateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'yoggmca@gmail.com' });
    console.log('Removed existing admin user if any\n');

    // Create new admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'yoggmca@gmail.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      phone: '9999999999',
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('==========================================');
    console.log('Email: yoggmca@gmail.com');
    console.log('Password: Admin@123');
    console.log('Role: admin');
    console.log('==========================================\n');
    console.log('You can now login at: http://localhost:5173/login');
    console.log('Then visit: http://localhost:5173/admin/dashboard\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createOrUpdateAdmin();
