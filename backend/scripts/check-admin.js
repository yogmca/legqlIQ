const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check for the admin user
    const admin = await User.findOne({ email: 'yoggmca@gmail.com' });
    
    if (admin) {
      console.log('✅ Admin user found!');
      console.log('==================');
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Role:', admin.role);
      console.log('Is Verified:', admin.isVerified);
      console.log('Email Verified:', admin.emailVerified);
      console.log('Has Password:', admin.password ? 'Yes' : 'No');
      console.log('==================\n');
      console.log('Login with:');
      console.log('Email: yoggmca@gmail.com');
      console.log('Password: Admin@123');
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('Creating admin user now...\n');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      const newAdmin = new User({
        name: 'Admin',
        email: 'yoggmca@gmail.com',
        password: hashedPassword,
        role: 'admin',
        phone: '9999999999',
        isVerified: true,
        emailVerified: true
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created!');
      console.log('Email: yoggmca@gmail.com');
      console.log('Password: Admin@123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();
