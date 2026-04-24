const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function checkLawyerAccount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const lawyer = await User.findOne({ email: 'lawyer1@test.com' });
    
    if (lawyer) {
      console.log('\n=== Lawyer Account Found ===');
      console.log('Email:', lawyer.email);
      console.log('Name:', lawyer.name);
      console.log('Role:', lawyer.role);
      console.log('Created At:', lawyer.createdAt);
      console.log('\nNote: Password is hashed with bcrypt for security.');
      console.log('Hashed Password:', lawyer.password);
      console.log('\n=== Password Reset Options ===');
      console.log('1. Use the "Forgot Password" feature on the login page');
      console.log('2. Register a new test lawyer account with known credentials');
      console.log('3. Update the password hash in the database directly');
    } else {
      console.log('\n❌ No account found for lawyer1@test.com');
      console.log('This account may not exist in the database.');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLawyerAccount();
