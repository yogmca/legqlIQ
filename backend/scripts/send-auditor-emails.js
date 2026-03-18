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

// Load auditors
function loadAuditors() {
  const filePath = path.join(__dirname, 'auditors-list.json');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Generate personalized email HTML for auditors
function generateEmailHTML(auditorName, auditorType, location) {
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
      <a href="https://legaliq.in/register-auditor" style="text-decoration: none;">
        <img src="https://legaliq.in/Legaliq.jpg" alt="LegalIQ Logo - Click to Register" class="logo">
      </a>
      <h1><a href="https://legaliq.in">LegalIQ</a></h1>
      <p>India's Premier Multi-Professional Services Platform</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${auditorName},</p>
      
      <p>We hope this email finds you well. We are excited to introduce <strong>LegalIQ</strong>, a comprehensive platform that now extends beyond legal services to include <strong>Chartered Accountants, Auditors, Tax Consultants, and Financial Professionals</strong>.</p>
      
      <p>As a respected ${auditorType} based in ${location}, we believe LegalIQ can significantly enhance your professional reach and client acquisition.</p>
      
      <div class="section">
        <h2>🎯 Why Join LegalIQ as an Auditor?</h2>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">🌐</div>
            <div class="benefit-text">
              <strong>Expand Your Client Base</strong>
              Connect with businesses and individuals across India seeking audit, tax, and financial services.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">💼</div>
            <div class="benefit-text">
              <strong>Professional Profile</strong>
              Showcase your firm's expertise, certifications, specializations, and successful audit engagements.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">📱</div>
            <div class="benefit-text">
              <strong>Virtual Consultations</strong>
              Offer online consultations for preliminary discussions, tax planning, and advisory services.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">⭐</div>
            <div class="benefit-text">
              <strong>Build Your Reputation</strong>
              Receive client reviews and ratings to establish credibility and attract more business.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">💰</div>
            <div class="benefit-text">
              <strong>Set Your Own Fees</strong>
              You control your consultation fees, service charges, and availability.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🔒</div>
            <div class="benefit-text">
              <strong>Secure Platform</strong>
              All client communications, documents, and financial data are encrypted and confidential.
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🤝</div>
            <div class="benefit-text">
              <strong>Cross-Professional Network</strong>
              Collaborate with lawyers, tax consultants, and other professionals for comprehensive client solutions.
            </div>
          </div>
        </div>
      </div>
      
      <div class="highlight-box">
        <strong>🎉 100% FREE Registration - No Hidden Costs!</strong>
        <p style="margin: 10px 0 0 0;">Join hundreds of auditing and financial professionals already benefiting from LegalIQ. There are no signup fees, no monthly charges, and no hidden costs.</p>
      </div>
      
      <div class="section">
        <h2>📝 Simple Registration Process</h2>
        <ol class="steps">
          <li>
            <strong>Visit LegalIQ.in</strong><br>
            Go to <a href="https://legaliq.in/register-auditor" style="color: #667eea;">https://legaliq.in/register-auditor</a> and start registration
          </li>
          <li>
            <strong>Enter Your Details</strong><br>
            Provide your firm name, contact details, ICAI registration, specializations, and experience
          </li>
          <li>
            <strong>Verification</strong><br>
            Our team will verify your credentials (typically within 24 hours)
          </li>
          <li>
            <strong>Start Receiving Clients</strong><br>
            Your profile goes live and clients can start booking consultations immediately
          </li>
        </ol>
      </div>
      
      <div class="cta-section">
        <h3 style="color: #667eea; margin-top: 0;">Ready to Grow Your Practice?</h3>
        <p>Join LegalIQ today and start connecting with clients who need your audit and financial expertise.</p>
        <a href="https://legaliq.in/register-auditor" class="cta-button">Register Now - It's FREE!</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Registration takes less than 5 minutes
        </p>
      </div>
      
      <div class="section">
        <h2>💡 What Makes LegalIQ Different?</h2>
        <ul style="line-height: 2;">
          <li><strong>Multi-Professional Platform:</strong> Lawyers, CAs, Tax Consultants, and Auditors in one place</li>
          <li><strong>Verified Professionals:</strong> All professionals are verified for authenticity and credentials</li>
          <li><strong>Client-Friendly:</strong> Easy booking and consultation process for clients</li>
          <li><strong>Transparent Pricing:</strong> Clients see your fees upfront - no surprises</li>
          <li><strong>Flexible Scheduling:</strong> You control your availability and working hours</li>
          <li><strong>Multiple Specializations:</strong> List all your areas of expertise (Statutory Audit, Tax Audit, GST, etc.)</li>
          <li><strong>Document Sharing:</strong> Secure document upload and sharing with clients</li>
          <li><strong>24/7 Support:</strong> Our team is here to help you succeed</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>🎯 Services You Can Offer</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <ul style="line-height: 2; margin: 0;">
            <li>Statutory Audits</li>
            <li>Tax Audits & GST Audits</li>
            <li>Internal Audits</li>
            <li>Financial Consulting</li>
            <li>Tax Planning & Advisory</li>
            <li>Company Formation & Compliance</li>
            <li>ROC Filings & Annual Returns</li>
            <li>Financial Statement Preparation</li>
            <li>Due Diligence Services</li>
            <li>And much more...</li>
          </ul>
        </div>
      </div>
      
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0; font-size: 16px;">
          <strong style="color: #2e7d32;">📞 Need Assistance?</strong><br>
          Our team is available to help with registration or answer any questions.<br>
          Email: <a href="mailto:support@legaliq.in" style="color: #667eea;">support@legaliq.in</a><br>
          Phone: +91 1800-123-4567
        </p>
      </div>
      
      <p style="margin-top: 30px;">We look forward to welcoming you to the LegalIQ community and helping you grow your auditing and financial services practice.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The LegalIQ Team</strong><br>
        <a href="https://legaliq.in" style="color: #667eea;">https://legaliq.in</a>
      </p>
    </div>
    
    <div class="footer">
      <a href="https://legaliq.in/register-auditor" style="text-decoration: none;">
        <img src="https://legaliq.in/Legaliq.jpg" alt="LegalIQ - Click to Register" class="footer-logo">
      </a>
      <p><strong>LegalIQ</strong> - Connecting Professionals with Clients</p>
      <p>Bangalore, Karnataka, India</p>
      
      <div class="social-links">
        <a href="https://legaliq.in">🌐 Website</a>
        <a href="https://legaliq.in/register-auditor">📝 Register</a>
        <a href="mailto:support@legaliq.in">📧 Email</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
        You received this email as a distinguished auditing professional.
        If you wish to unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send email to a single auditor
async function sendAuditorEmail(auditor, index, total) {
  const mailOptions = {
    from: `LegalIQ <${process.env.EMAIL_USER}>`,
    to: auditor.email,
    bcc: 'yogmca@gmail.com', // BCC to admin for tracking
    subject: '🏛️ Join LegalIQ - Free Registration for Auditors & CA Firms',
    html: generateEmailHTML(auditor.name, auditor.type, auditor.location),
    text: `
Dear ${auditor.name},

We hope this email finds you well. We are excited to introduce LegalIQ, a comprehensive platform that now extends beyond legal services to include Chartered Accountants, Auditors, Tax Consultants, and Financial Professionals.

As a respected ${auditor.type} based in ${auditor.location}, we believe LegalIQ can significantly enhance your professional reach and client acquisition.

WHY JOIN LEGALIQ AS AN AUDITOR?

✓ Expand Your Client Base - Connect with businesses and individuals across India
✓ Professional Profile - Showcase your expertise, certifications, and specializations
✓ Virtual Consultations - Offer online consultations for preliminary discussions
✓ Build Your Reputation - Receive client reviews and ratings
✓ Set Your Own Fees - You control your consultation fees and charges
✓ Secure Platform - All communications and data are encrypted
✓ Cross-Professional Network - Collaborate with lawyers and tax consultants

100% FREE REGISTRATION - NO HIDDEN COSTS!

SIMPLE REGISTRATION PROCESS:

1. Visit https://legaliq.in/register-auditor
2. Enter your firm details and professional information
3. Verification within 24 hours
4. Profile goes live and start receiving clients

SERVICES YOU CAN OFFER:

• Statutory Audits
• Tax Audits & GST Audits
• Internal Audits
• Financial Consulting
• Tax Planning & Advisory
• Company Formation & Compliance
• ROC Filings & Annual Returns
• Financial Statement Preparation
• Due Diligence Services
• And much more...

WHAT MAKES LEGALIQ DIFFERENT?

• Multi-Professional Platform (Lawyers, CAs, Tax Consultants, Auditors)
• Verified Professionals Only
• Client-Friendly Booking System
• Transparent Pricing
• Flexible Scheduling
• Document Sharing Capabilities
• 24/7 Technical Support

Register now at: https://legaliq.in/register-auditor

Need assistance?
Email: support@legaliq.in
Phone: +91 1800-123-4567

We look forward to welcoming you to the LegalIQ community and helping you grow your practice.

Best regards,
The LegalIQ Team
https://legaliq.in

---
You received this email as a distinguished auditing professional.
To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [${index + 1}/${total}] Email sent to ${auditor.name} (${auditor.email})`);
    return { success: true, auditor };
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] Failed to send to ${auditor.name} (${auditor.email}):`, error.message);
    return { success: false, auditor, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 LegalIQ Auditors Email Campaign\n');
  
  // Load auditors from JSON file
  const auditors = loadAuditors();
  
  if (auditors.length === 0) {
    console.log('❌ No auditors found in the JSON file.');
    process.exit(1);
  }
  
  console.log(`📧 Loaded ${auditors.length} auditors and CA firms\n`);
  console.log(`📋 BCC: yogmca@gmail.com (admin will receive all emails)\n`);
  console.log(`🖼️  Logo: Clickable LegalIQ logo linking to https://legaliq.in/register-auditor\n`);
  
  // Show all auditors
  console.log('Auditors to receive emails:');
  auditors.forEach((aud, i) => {
    console.log(`  ${i + 1}. ${aud.name} (${aud.type}) - ${aud.email} - ${aud.location}`);
  });
  console.log('');
  
  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question(`Do you want to proceed with sending ${auditors.length} emails? (yes/no): `, async (answer) => {
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
    for (let i = 0; i < auditors.length; i++) {
      const result = await sendAuditorEmail(auditors[i], i, auditors.length);
      
      if (result.success) {
        results.sent.push(result.auditor);
      } else {
        results.failed.push({ auditor: result.auditor, error: result.error });
      }
      
      // Wait 2 seconds between emails to avoid rate limiting
      if (i < auditors.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 CAMPAIGN SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully sent: ${results.sent.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📧 Total: ${auditors.length}`);
    console.log(`📋 BCC to admin: yogmca@gmail.com`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed emails:');
      results.failed.forEach(({ auditor, error }) => {
        console.log(`   - ${auditor.name} (${auditor.email}): ${error}`);
      });
    }
    
    if (results.sent.length > 0) {
      console.log('\n✅ Successfully sent to:');
      results.sent.forEach((auditor) => {
        console.log(`   - ${auditor.name} (${auditor.email}) - ${auditor.location}`);
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
