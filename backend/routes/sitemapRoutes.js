const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// Generate XML sitemap for all professionals
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Check if MongoDB is connected
    let professionals = [];
    if (mongoose.connection.readyState === 1) {
      try {
        // Fetch all verified professionals with a timeout
        professionals = await User.find({
          role: { $in: ['lawyer', 'tax-consultant', 'auditor'] },
          isVerified: true
        })
        .select('_id role city state specialization updatedAt')
        .maxTimeMS(5000) // 5 second timeout
        .lean()
        .exec();
      } catch (dbError) {
        console.error('Database query error in sitemap:', dbError.message);
        // Continue with empty professionals array
      }
    } else {
      console.warn('MongoDB not connected, generating sitemap without professional profiles');
    }

    // Start XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

    // Static pages
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

    // Professional profiles
    professionals.forEach(professional => {
      const lastMod = professional.updatedAt 
        ? new Date(professional.updatedAt).toISOString().split('T')[0]
        : currentDate;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/profile/${professional._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n\n';
    });

    // Location-based pages (major cities)
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

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate sitemap index (for large sites)
router.get('/sitemap-index.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

    // Main sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/api/sitemap/sitemap-static.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n\n';

    // Lawyers sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/api/sitemap/sitemap-lawyers.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n\n';

    // Tax consultants sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/api/sitemap/sitemap-tax-consultants.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n\n';

    // Auditors sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/api/sitemap/sitemap-auditors.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n\n';

    // Locations sitemap
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/api/sitemap/sitemap-locations.xml</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '  </sitemap>\n\n';

    xml += '</sitemapindex>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
});

// Generate sitemap for lawyers only
router.get('/sitemap-lawyers.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Use lean() for better performance and limit to 50,000 URLs (sitemap limit)
    const lawyers = await User.find({
      role: 'lawyer',
      isVerified: true
    })
    .select('_id updatedAt')
    .limit(50000)
    .lean()
    .maxTimeMS(10000) // 10 second timeout
    .exec();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

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

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating lawyers sitemap:', error);
    // Return valid empty sitemap on error instead of 500
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }
});

// Generate sitemap for tax consultants only
router.get('/sitemap-tax-consultants.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Use lean() for better performance and limit to 50,000 URLs (sitemap limit)
    const taxConsultants = await User.find({
      role: 'tax-consultant',
      isVerified: true
    })
    .select('_id updatedAt')
    .limit(50000)
    .lean()
    .maxTimeMS(10000) // 10 second timeout
    .exec();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

    taxConsultants.forEach(consultant => {
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

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating tax consultants sitemap:', error);
    // Return valid empty sitemap on error instead of 500
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }
});

// Generate sitemap for auditors only
router.get('/sitemap-auditors.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Use lean() for better performance and limit to 50,000 URLs (sitemap limit)
    const auditors = await User.find({
      role: 'auditor',
      isVerified: true
    })
    .select('_id updatedAt')
    .limit(50000)
    .lean()
    .maxTimeMS(10000) // 10 second timeout
    .exec();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

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

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating auditors sitemap:', error);
    // Return valid empty sitemap on error instead of 500
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }
});

// Generate sitemap for location pages
router.get('/sitemap-locations.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
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

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating locations sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate static pages sitemap
router.get('/sitemap-static.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://legaliq.in';
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

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating static sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
