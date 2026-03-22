const mongoose = require('mongoose');
require('dotenv').config();

const Article = require('../models/Article');

async function updateAdminArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all articles where author.profession is 'admin'
    const adminArticles = await Article.find({ 'author.profession': 'admin' });
    
    console.log(`Found ${adminArticles.length} admin articles to update`);

    // Update each article to show "LegalIQ" as author name
    let updated = 0;
    for (const article of adminArticles) {
      article.author.name = 'LegalIQ';
      await article.save();
      updated++;
      console.log(`Updated article: ${article.title}`);
    }

    console.log(`\n✅ Successfully updated ${updated} articles`);
    console.log('All admin articles now show "LegalIQ" as the author name');

  } catch (error) {
    console.error('❌ Error updating articles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

updateAdminArticles();
