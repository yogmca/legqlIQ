const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'lawyer1@test.com';
    const newPassword = 'Test@123'; // Change this to your desired password

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    const result = await User.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ Password updated successfully!');
      console.log('Email:', email);
      console.log('New Password:', newPassword);
      console.log('\nYou can now login with these credentials.');
    } else {
      console.log('\n❌ No account found or password already set to this value.');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
