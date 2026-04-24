const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const baseUrl = 'https://legaliq.in';
const publicDir = path.join(__dirname, '../../public');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Generate sitemap-index.xml
function generateSitemapIndex() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  const sitemaps = [
    'sitemap-static.xml',
    'sitemap-lawyers.xml',
    'sitemap-tax-consultants.xml',
    'sitemap-auditors.xml',
    'sitemap-locations.xml'
  ];
  
  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/${sitemap}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n\n';
  });
  
  xml += '</sitemapindex>';
  
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), xml);
  console.log('✅ Generated sitemap-index.xml');
}

// Generate sitemap-static.xml
function generateStaticSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/articles', priority: '0.9', changefreq: 'weekly' },
    { url: '/consultation', priority: '0.9', changefreq: 'monthly' },
    { url: '/login', priority: '0.7', changefreq: 'monthly' },
    { url: '/register', priority: '0.7', changefreq: 'monthly' }
  ];
  
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });
  
  xml += '</urlset>';
  
  fs.writeFileSync(path.join(publicDir, 'sitemap-static.xml'), xml);
  console.log('✅ Generated sitemap-static.xml');
}

// Generate sitemap-locations.xml
function generateLocationsSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  const majorCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Surat', 'Nagpur',
    'Kochi', 'Coimbatore', 'Visakhapatnam', 'Bhopal', 'Patna', 'Vadodara'
  ];
  
  const professionalTypes = ['lawyers', 'tax-consultants', 'auditors'];
  
  majorCities.forEach(city => {
    professionalTypes.forEach(type => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${type}/${city.toLowerCase().replace(/\s+/g, '-')}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n\n';
    });
  });
  
  xml += '</urlset>';
  
  fs.writeFileSync(path.join(publicDir, 'sitemap-locations.xml'), xml);
  console.log('✅ Generated sitemap-locations.xml (60 location pages)');
}

// Generate sitemap-lawyers.xml
async function generateLawyersSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  const User = require('../models/User');
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  try {
    const lawyers = await User.find({
      role: 'lawyer',
      isVerified: true
    }).select('_id updatedAt').lean();
    
    lawyers.forEach(lawyer => {
      const lastMod = lawyer.updatedAt 
        ? new Date(lawyer.updatedAt).toISOString().split('T')[0]
        : currentDate;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/profile/${lawyer._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n\n';
    });
    
    console.log(`✅ Generated sitemap-lawyers.xml (${lawyers.length} lawyers)`);
  } catch (error) {
    console.error('⚠️  Error fetching lawyers:', error.message);
    console.log('⚠️  Generated empty sitemap-lawyers.xml');
  }
  
  xml += '</urlset>';
  fs.writeFileSync(path.join(publicDir, 'sitemap-lawyers.xml'), xml);
}

// Generate sitemap-tax-consultants.xml
async function generateTaxConsultantsSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  const User = require('../models/User');
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  try {
    const consultants = await User.find({
      role: 'tax-consultant',
      isVerified: true
    }).select('_id updatedAt').lean();
    
    consultants.forEach(consultant => {
      const lastMod = consultant.updatedAt 
        ? new Date(consultant.updatedAt).toISOString().split('T')[0]
        : currentDate;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/profile/${consultant._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n\n';
    });
    
    console.log(`✅ Generated sitemap-tax-consultants.xml (${consultants.length} consultants)`);
  } catch (error) {
    console.error('⚠️  Error fetching tax consultants:', error.message);
    console.log('⚠️  Generated empty sitemap-tax-consultants.xml');
  }
  
  xml += '</urlset>';
  fs.writeFileSync(path.join(publicDir, 'sitemap-tax-consultants.xml'), xml);
}

// Generate sitemap-auditors.xml
async function generateAuditorsSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  const User = require('../models/User');
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
  
  try {
    const auditors = await User.find({
      role: 'auditor',
      isVerified: true
    }).select('_id updatedAt').lean();
    
    auditors.forEach(auditor => {
      const lastMod = auditor.updatedAt 
        ? new Date(auditor.updatedAt).toISOString().split('T')[0]
        : currentDate;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/profile/${auditor._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n\n';
    });
    
    console.log(`✅ Generated sitemap-auditors.xml (${auditors.length} auditors)`);
  } catch (error) {
    console.error('⚠️  Error fetching auditors:', error.message);
    console.log('⚠️  Generated empty sitemap-auditors.xml');
  }
  
  xml += '</urlset>';
  fs.writeFileSync(path.join(publicDir, 'sitemap-auditors.xml'), xml);
}

// Main function
async function generateAllSitemaps() {
  console.log('🚀 Starting sitemap generation...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Generate all sitemaps
    generateSitemapIndex();
    generateStaticSitemap();
    generateLocationsSitemap();
    await generateLawyersSitemap();
    await generateTaxConsultantsSitemap();
    await generateAuditorsSitemap();
    
    console.log('\n✅ All sitemaps generated successfully!');
    console.log(`📁 Location: ${publicDir}`);
    console.log('\n📋 Generated files:');
    console.log('   - sitemap-index.xml');
    console.log('   - sitemap-static.xml');
    console.log('   - sitemap-locations.xml');
    console.log('   - sitemap-lawyers.xml');
    console.log('   - sitemap-tax-consultants.xml');
    console.log('   - sitemap-auditors.xml');
    console.log('\n🌐 Accessible at:');
    console.log('   - https://legaliq.in/sitemap-index.xml');
    console.log('   - https://legaliq.in/sitemap-static.xml');
    console.log('   - https://legaliq.in/sitemap-locations.xml');
    console.log('   - https://legaliq.in/sitemap-lawyers.xml');
    console.log('   - https://legaliq.in/sitemap-tax-consultants.xml');
    console.log('   - https://legaliq.in/sitemap-auditors.xml');
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

// Run the script
generateAllSitemaps();
