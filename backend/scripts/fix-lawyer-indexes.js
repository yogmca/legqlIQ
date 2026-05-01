const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function fixLawyerIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const db = mongoose.connection.db;
    const collection = db.collection('lawyers');

    // Get existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the problematic indexes if they exist
    try {
      console.log('\n🗑️  Dropping barRegistrationNo_1 index...');
      await collection.dropIndex('barRegistrationNo_1');
      console.log('   ✅ Dropped barRegistrationNo_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('   ℹ️  Index barRegistrationNo_1 does not exist');
      } else {
        console.log('   ⚠️  Error dropping barRegistrationNo_1:', err.message);
      }
    }

    try {
      console.log('\n🗑️  Dropping registrationNo_1 index...');
      await collection.dropIndex('registrationNo_1');
      console.log('   ✅ Dropped registrationNo_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('   ℹ️  Index registrationNo_1 does not exist');
      } else {
        console.log('   ⚠️  Error dropping registrationNo_1:', err.message);
      }
    }

    // Create sparse indexes
    console.log('\n📝 Creating sparse indexes...');
    
    await collection.createIndex(
      { barRegistrationNo: 1 },
      { sparse: true, unique: true, name: 'barRegistrationNo_1_sparse' }
    );
    console.log('   ✅ Created sparse unique index on barRegistrationNo');

    await collection.createIndex(
      { registrationNo: 1 },
      { sparse: true, unique: true, name: 'registrationNo_1_sparse' }
    );
    console.log('   ✅ Created sparse unique index on registrationNo');

    // Show updated indexes
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key), index.sparse ? '(sparse)' : '');
    });

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixLawyerIndexes();
