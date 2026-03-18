const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Load Supreme Court advocates
function loadAdvocates() {
  const filePath = path.join(__dirname, 'supreme-court-advocates.json');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Generate personalized email HTML with clickable LegalIQ logo
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
    .logo {
      max-width: 120px;
      height: auto;
      margin-bottom: 15px;
      transition: transform 0.3s;
    }
    .logo:hover {
      transform: scale(1.05);
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .header h1 a {
      color: white;
      text-decoration: none;
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
      color: white !important;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      transition: transform 0.3s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
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
    .footer-logo {
      max-width: 80px;
      margin-bottom: 15px;
      transition: transform 0.3s;
    }
    .footer-logo:hover {
      transform: scale(1.05);
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
      <a href="https://legaliq.in/register-lawyer" style="text-decoration: none;">
        <img src="https://legaliq.in/Legaliq.jpg" alt="LegalIQ Logo - Click to Register" class="logo">
      </a>
      <h1><a href="https://legaliq.in">LegalIQ</a></h1>
      <p>India's Premier Legal Services Platform</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${advocateName},</p>
      
      <p>We hope this email finds you well. We are honored to introduce <strong>LegalIQ</strong> to the esteemed members of the Supreme Court Bar Association.</p>
      
      <p>LegalIQ is a revolutionary platform designed to connect India's finest legal professionals with clients across the nation, making quality legal services more accessible while helping advocates expand their practice.</p>
      
      <div class="section">
        <h2>🎯 Why Join LegalIQ?</h2>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">🌐</div>
            <div class="benefit-text">
              <strong>National Reach</strong>
              Connect with clients from across India seeking Supreme Court-level expertise.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">💼</div>
            <div class="benefit-text">
              <strong>Distinguished Profile</strong>
              Showcase your Supreme Court practice, landmark cases, and specialized expertise.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">📱</div>
            <div class="benefit-text">
              <strong>Video Consultations</strong>
              Offer preliminary consultations remotely, saving time for both you and your clients.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">⭐</div>
            <div class="benefit-text">
              <strong>Enhanced Visibility</strong>
              Increase your professional visibility among clients seeking top-tier legal representation.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">💰</div>
            <div class="benefit-text">
              <strong>Full Control</strong>
              Set your own consultation fees, availability, and practice areas.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🔒</div>
            <div class="benefit-text">
              <strong>Secure & Confidential</strong>
              All client communications and data are encrypted and confidential.
            </div>
          </div>
        </div>
      </div>
      
      <div class="highlight-box">
        <strong>🎉 Complimentary Registration for Supreme Court Advocates</strong>
        <p style="margin: 10px 0 0 0;">As a mark of respect for your distinguished practice, we offer 100% free registration with no hidden costs or monthly fees.</p>
      </div>
      
      <div class="section">
        <h2>📝 Simple Registration Process</h2>
        <ol class="steps">
          <li>
            <strong>Visit LegalIQ.in</strong><br>
            Go to <a href="https://legaliq.in/register-lawyer" style="color: #667eea;">https://legaliq.in/register-lawyer</a> and start registration
          </li>
          <li>
            <strong>Enter Your Details</strong><br>
            Provide your name, email, phone, Bar registration number, and areas of practice
          </li>
          <li>
            <strong>Verification</strong><br>
            Our team will verify your credentials (typically within 24 hours)
          </li>
          <li>
            <strong>Go Live</strong><br>
            Your profile becomes visible to clients seeking expert legal counsel
          </li>
        </ol>
      </div>
      
      <div class="cta-section">
        <h3 style="color: #667eea; margin-top: 0;">Join India's Leading Legal Platform</h3>
        <p>Be part of a select community of verified legal professionals serving clients nationwide.</p>
        <a href="https://legaliq.in/register-lawyer" class="cta-button">Register Now - Complimentary</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Registration takes less than 5 minutes
        </p>
      </div>
      
      <div class="section">
        <h2>💡 Platform Features</h2>
        <ul style="line-height: 2;">
          <li><strong>Verified Professionals Only:</strong> Rigorous verification process ensures credibility</li>
          <li><strong>Client Management:</strong> Track consultations and client communications</li>
          <li><strong>Flexible Scheduling:</strong> Manage your availability according to your court schedule</li>
          <li><strong>Secure Payments:</strong> Transparent and secure payment processing</li>
          <li><strong>Professional Networking:</strong> Connect with other legal professionals</li>
          <li><strong>24/7 Technical Support:</strong> Dedicated support team for any assistance</li>
        </ul>
      </div>
      
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0; font-size: 16px;">
          <strong style="color: #2e7d32;">📞 Need Assistance?</strong><br>
          Our team is available to help with registration or answer any questions.<br>
          Email: <a href="mailto:support@legaliq.in" style="color: #667eea;">support@legaliq.in</a><br>
          Phone: +91 1800-123-4567
        </p>
      </div>
      
      <p style="margin-top: 30px;">We would be honored to have you as part of the LegalIQ community and look forward to supporting your distinguished practice.</p>
      
      <p style="margin-top: 30px;">
        With highest regards,<br>
        <strong>The LegalIQ Team</strong><br>
        <a href="https://legaliq.in" style="color: #667eea;">https://legaliq.in</a>
      </p>
    </div>
    
    <div class="footer">
      <a href="https://legaliq.in/register-lawyer" style="text-decoration: none;">
        <img src="https://legaliq.in/Legaliq.jpg" alt="LegalIQ - Click to Register" class="footer-logo">
      </a>
      <p><strong>LegalIQ</strong> - Connecting Legal Professionals with Clients</p>
      <p>Bangalore, Karnataka, India</p>
      
      <div class="social-links">
        <a href="https://legaliq.in">🌐 Website</a>
        <a href="https://legaliq.in/register-lawyer">📝 Register</a>
        <a href="mailto:support@legaliq.in">📧 Email</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
        You received this email as a distinguished member of the Supreme Court Bar Association.
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
    subject: '🏛️ Invitation to Join LegalIQ - India\'s Premier Legal Platform',
    html: generateEmailHTML(advocate.name),
    text: `
Dear ${advocate.name},

We hope this email finds you well. We are honored to introduce LegalIQ to the esteemed members of the Supreme Court Bar Association.

LegalIQ is a revolutionary platform designed to connect India's finest legal professionals with clients across the nation.

WHY JOIN LEGALIQ?

✓ National Reach - Connect with clients seeking Supreme Court-level expertise
✓ Distinguished Profile - Showcase your practice and landmark cases
✓ Video Consultations - Offer remote preliminary consultations
✓ Enhanced Visibility - Increase your professional presence
✓ Full Control - Set your own fees and availability
✓ Secure & Confidential - Encrypted communications

COMPLIMENTARY REGISTRATION FOR SUPREME COURT ADVOCATES
100% free registration with no hidden costs or monthly fees.

SIMPLE REGISTRATION PROCESS:

1. Visit https://legaliq.in/register-lawyer
2. Enter your professional details
3. Verification within 24 hours
4. Profile goes live

PLATFORM FEATURES:

• Verified Professionals Only
• Client Management System
• Flexible Scheduling
• Secure Payments
• Professional Networking
• 24/7 Technical Support

Register now at: https://legaliq.in/register-lawyer

Need assistance?
Email: support@legaliq.in
Phone: +91 1800-123-4567

We would be honored to have you as part of the LegalIQ community.

With highest regards,
The LegalIQ Team
https://legaliq.in

---
You received this email as a distinguished member of the Supreme Court Bar Association.
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
  console.log('🚀 LegalIQ Supreme Court Advocates Email Campaign\n');
  
  // Load advocates from JSON file
  const advocates = loadAdvocates();
  
  if (advocates.length === 0) {
    console.log('❌ No advocates found in the JSON file.');
    process.exit(1);
  }
  
  console.log(`📧 Loaded ${advocates.length} Supreme Court advocates\n`);
  console.log(`📋 BCC: yogmca@gmail.com (admin will receive all emails)\n`);
  console.log(`🖼️  Logo: Clickable LegalIQ logo linking to https://legaliq.in/register-lawyer\n`);
  
  // Show first 5 advocates
  console.log('First 5 advocates:');
  advocates.slice(0, 5).forEach((adv, i) => {
    console.log(`  ${i + 1}. ${adv.name} - ${adv.email}`);
  });
  console.log(`  ... and ${advocates.length - 5} more\n`);
  
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
    console.log(`📋 BCC to admin: yogmca@gmail.com`);
    
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
