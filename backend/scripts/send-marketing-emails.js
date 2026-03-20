const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Scrape advocates from KSBC website
async function scrapeAdvocates() {
  try {
    console.log('🔍 Scraping advocates from KSBC website...');
    const response = await axios.get('https://ksbc.org.in/senior_advocates_list.php');
    const $ = cheerio.load(response.data);
    
    const advocates = [];
    const emailRegex = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
    
    // Get all text content from the page
    const pageText = $('body').text();
    
    // Split by advocate entries (they start with "Shri." or "Smt.")
    const entries = pageText.split(/(?=Shri\.|Smt\.)/);
    
    entries.forEach(entry => {
      // Extract name (first line after Shri./Smt.)
      const nameMatch = entry.match(/(?:Shri\.|Smt\.)\s*([^,\n]+)/);
      if (!nameMatch) return;
      
      const name = nameMatch[1].trim();
      
      // Extract email
      const emailMatches = entry.match(emailRegex);
      if (emailMatches && emailMatches.length > 0) {
        const email = emailMatches[0].toLowerCase();
        
        // Validate it's a proper email
        if (email.includes('@') && email.includes('.')) {
          advocates.push({ name, email });
        }
      }
    });
    
    console.log(`✅ Found ${advocates.length} advocates with valid emails`);
    return advocates;
  } catch (error) {
    console.error('❌ Error scraping advocates:', error.message);
    return [];
  }
}

// Generate personalized email HTML
function generateEmailHTML(advocateName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #667eea;
      font-size: 22px;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .benefits {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .benefit-item {
      display: flex;
      align-items: start;
      margin-bottom: 15px;
    }
    .benefit-icon {
      font-size: 24px;
      margin-right: 15px;
      min-width: 30px;
    }
    .benefit-text {
      flex: 1;
    }
    .benefit-text strong {
      color: #667eea;
      display: block;
      margin-bottom: 5px;
    }
    .cta-button {
      display: inline-block;
      padding: 15px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-section {
      text-align: center;
      background: #f8f9fa;
      padding: 30px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .highlight-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .highlight-box strong {
      color: #856404;
      font-size: 18px;
    }
    .steps {
      counter-reset: step-counter;
      list-style: none;
      padding: 0;
    }
    .steps li {
      counter-increment: step-counter;
      margin-bottom: 20px;
      padding-left: 50px;
      position: relative;
    }
    .steps li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .footer {
      background: #2c3e50;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: white;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ LegalIQ</h1>
      <p>India's Premier Legal Services Platform</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${advocateName},</p>
      
      <p>We hope this email finds you well. We are excited to introduce <strong>LegalIQ</strong>, a revolutionary platform designed to connect legal professionals with clients across India.</p>
      
      <div class="section">
        <h2>🎯 Why Join LegalIQ?</h2>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">🌐</div>
            <div class="benefit-text">
              <strong>Expand Your Reach</strong>
              Connect with clients beyond your local area and grow your practice nationwide.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">💼</div>
            <div class="benefit-text">
              <strong>Professional Profile</strong>
              Showcase your expertise, specializations, experience, and credentials to potential clients.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">📱</div>
            <div class="benefit-text">
              <strong>Video Consultations</strong>
              Offer convenient online consultations and expand your service offerings.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">⭐</div>
            <div class="benefit-text">
              <strong>Build Your Reputation</strong>
              Receive client reviews and ratings to establish your credibility.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">💰</div>
            <div class="benefit-text">
              <strong>Set Your Own Fees</strong>
              You control your consultation fees and availability.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🔒</div>
            <div class="benefit-text">
              <strong>Secure Platform</strong>
              All client communications and payments are secure and confidential.
            </div>
          </div>
        </div>
      </div>
      
      <div class="highlight-box">
        <strong>🎉 100% FREE Registration - No Hidden Costs!</strong>
        <p style="margin: 10px 0 0 0;">Join thousands of legal professionals already benefiting from LegalIQ. There are no signup fees, no monthly charges, and no hidden costs.</p>
      </div>
      
      <div class="section">
        <h2>📝 Simple Registration Process</h2>
        <ol class="steps">
          <li>
            <strong>Visit LegalIQ.in</strong><br>
            Go to <a href="https://legaliq.in" style="color: #667eea;">https://legaliq.in</a> and click "Register as Lawyer"
          </li>
          <li>
            <strong>Fill Your Details</strong><br>
            Provide your name, email, phone, Bar registration number, and professional details
          </li>
          <li>
            <strong>Verify Your Account</strong><br>
            Complete the simple verification process
          </li>
          <li>
            <strong>Start Receiving Clients</strong><br>
            Your profile goes live immediately and clients can start booking consultations
          </li>
        </ol>
      </div>
      
      <div class="cta-section">
        <h3 style="color: #667eea; margin-top: 0;">Ready to Grow Your Practice?</h3>
        <p>Join LegalIQ today and start connecting with clients who need your expertise.</p>
        <a href="https://legaliq.in/register-lawyer" class="cta-button">Register Now - It's FREE!</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Registration takes less than 5 minutes
        </p>
      </div>
      
      <div class="section">
        <h2>💡 What Makes LegalIQ Different?</h2>
        <ul style="line-height: 2;">
          <li><strong>Verified Professionals:</strong> All lawyers are verified for authenticity</li>
          <li><strong>Client-Friendly:</strong> Easy booking and consultation process</li>
          <li><strong>Transparent Pricing:</strong> Clients see your fees upfront</li>
          <li><strong>Flexible Scheduling:</strong> You control your availability</li>
          <li><strong>Multiple Specializations:</strong> List all your areas of expertise</li>
          <li><strong>24/7 Support:</strong> Our team is here to help you succeed</li>
        </ul>
      </div>
      
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0; font-size: 16px;">
          <strong style="color: #2e7d32;">📞 Need Help?</strong><br>
          Our support team is available to assist you with registration or answer any questions.<br>
          Email: <a href="mailto:support@legaliq.in" style="color: #667eea;">support@legaliq.in</a><br>
          Phone: +91 1800-123-4567
        </p>
      </div>
      
      <p style="margin-top: 30px;">We look forward to welcoming you to the LegalIQ community and helping you grow your legal practice.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The LegalIQ Team</strong><br>
        <a href="https://legaliq.in" style="color: #667eea;">https://legaliq.in</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>LegalIQ</strong> - Connecting Legal Professionals with Clients</p>
      <p>Bangalore, Karnataka, India</p>
      
      <div class="social-links">
        <a href="https://legaliq.in">🌐 Website</a>
        <a href="mailto:support@legaliq.in">📧 Email</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
        You received this email because you are listed as a Senior Advocate on the Karnataka State Bar Council website.
        If you wish to unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send email to a single advocate
async function sendMarketingEmail(advocate, index, total) {
  const mailOptions = {
    from: `LegalIQ <${process.env.EMAIL_USER}>`,
    to: advocate.email,
    bcc: 'yogmca@gmail.com', // BCC to admin for tracking
    subject: '🏛️ Join LegalIQ - Free Registration for Legal Professionals',
    html: generateEmailHTML(advocate.name),
    text: `
Dear ${advocate.name},

We are excited to introduce LegalIQ, India's premier legal services platform designed to connect legal professionals with clients across the country.

WHY JOIN LEGALIQ?

✓ Expand Your Reach - Connect with clients nationwide
✓ Professional Profile - Showcase your expertise and credentials
✓ Video Consultations - Offer convenient online services
✓ Build Your Reputation - Receive client reviews and ratings
✓ Set Your Own Fees - You control your consultation charges
✓ Secure Platform - All communications are confidential

100% FREE REGISTRATION - NO HIDDEN COSTS!

SIMPLE REGISTRATION PROCESS:

1. Visit https://legaliq.in
2. Click "Register as Lawyer"
3. Fill in your professional details
4. Start receiving clients immediately

WHAT MAKES LEGALIQ DIFFERENT?

• Verified Professionals
• Client-Friendly Platform
• Transparent Pricing
• Flexible Scheduling
• 24/7 Support

Register now at: https://legaliq.in/register-lawyer

Need help? Contact us:
Email: support@legaliq.in
Phone: +91 1800-123-4567

Best regards,
The LegalIQ Team
https://legaliq.in

---
You received this email because you are listed as a Senior Advocate on the Karnataka State Bar Council website.
To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [${index + 1}/${total}] Email sent to ${advocate.name} (${advocate.email})`);
    return { success: true, advocate };
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] Failed to send to ${advocate.name} (${advocate.email}):`, error.message);
    return { success: false, advocate, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 LegalIQ Marketing Email Campaign\n');
  
  // Scrape advocates
  const advocates = await scrapeAdvocates();
  
  if (advocates.length === 0) {
    console.log('❌ No advocates found. Please check the website structure.');
    process.exit(1);
  }
  
  console.log(`\n📧 Preparing to send emails to ${advocates.length} advocates...\n`);
  console.log(`📋 BCC: yogmca@gmail.com (admin will receive all emails)\n`);
  
  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question(`Do you want to proceed with sending ${advocates.length} emails? (yes/no): `, async (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Campaign cancelled.');
      process.exit(0);
    }
    
    console.log('\n📤 Sending emails...\n');
    
    const results = {
      sent: [],
      failed: []
    };
    
    // Send emails with delay to avoid rate limiting
    for (let i = 0; i < advocates.length; i++) {
      const result = await sendMarketingEmail(advocates[i], i, advocates.length);
      
      if (result.success) {
        results.sent.push(result.advocate);
      } else {
        results.failed.push({ advocate: result.advocate, error: result.error });
      }
      
      // Wait 2 seconds between emails to avoid rate limiting
      if (i < advocates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 CAMPAIGN SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully sent: ${results.sent.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📧 Total: ${advocates.length}`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed emails:');
      results.failed.forEach(({ advocate, error }) => {
        console.log(`   - ${advocate.name} (${advocate.email}): ${error}`);
      });
    }
    
    console.log('\n✨ Campaign completed!');
    process.exit(0);
  });
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
