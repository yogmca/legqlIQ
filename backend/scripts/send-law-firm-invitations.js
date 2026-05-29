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

// Generate personalized email HTML for law firm invitation
function generateEmailHTML(firmName) {
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
      max-width: 650px;
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
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 18px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .intro {
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 30px;
      color: #555;
    }
    .section {
      margin-bottom: 35px;
    }
    .section h2 {
      color: #667eea;
      font-size: 24px;
      margin-bottom: 20px;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    .benefits {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      border-radius: 10px;
      margin: 25px 0;
      border-left: 5px solid #667eea;
    }
    .benefit-item {
      display: flex;
      align-items: start;
      margin-bottom: 20px;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .benefit-item:last-child {
      margin-bottom: 0;
    }
    .benefit-icon {
      font-size: 28px;
      margin-right: 15px;
      min-width: 35px;
    }
    .benefit-text {
      flex: 1;
    }
    .benefit-text strong {
      color: #667eea;
      display: block;
      margin-bottom: 8px;
      font-size: 18px;
    }
    .benefit-text p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      padding: 18px 45px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 700;
      font-size: 18px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.3s;
    }
    .cta-section {
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 40px 30px;
      border-radius: 10px;
      margin: 35px 0;
      border: 2px solid #667eea;
    }
    .cta-section h3 {
      color: #667eea;
      margin-top: 0;
      font-size: 26px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
      border-left: 5px solid #ffc107;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(255, 193, 7, 0.2);
    }
    .highlight-box strong {
      color: #856404;
      font-size: 20px;
      display: block;
      margin-bottom: 10px;
    }
    .highlight-box p {
      margin: 0;
      color: #856404;
      font-size: 16px;
    }
    .stats-box {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-left: 5px solid #28a745;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .stats-box strong {
      color: #155724;
      font-size: 20px;
      display: block;
      margin-bottom: 15px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .stat-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      display: block;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .steps {
      counter-reset: step-counter;
      list-style: none;
      padding: 0;
    }
    .steps li {
      counter-increment: step-counter;
      margin-bottom: 25px;
      padding-left: 60px;
      position: relative;
      background: #f8f9fa;
      padding: 20px 20px 20px 70px;
      border-radius: 8px;
    }
    .steps li::before {
      content: counter(step-counter);
      position: absolute;
      left: 20px;
      top: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    }
    .steps li strong {
      color: #667eea;
      font-size: 18px;
      display: block;
      margin-bottom: 8px;
    }
    .footer {
      background: #2c3e50;
      color: white;
      padding: 35px 30px;
      text-align: center;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: white;
      text-decoration: none;
      font-size: 16px;
    }
    .value-props {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 25px 0;
    }
    .value-prop {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e9ecef;
      text-align: center;
    }
    .value-prop-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
    .value-prop strong {
      color: #667eea;
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LegalIQ</h1>
      <p>Transform Your Legal Practice with Digital Excellence</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${firmName} Team,</p>
      
      <p class="intro">
        We are excited to invite you to join <strong>LegalIQ</strong>, India's fastest-growing digital platform connecting legal professionals with clients nationwide. In today's digital age, your firm deserves a powerful online presence that drives client acquisition and enhances your professional reputation.
      </p>
      
      <div class="highlight-box">
        <strong>🎉 100% FREE Registration - Zero Cost, Maximum Value!</strong>
        <p>Join LegalIQ at absolutely no cost. No signup fees, no monthly charges, no hidden costs. Start growing your practice today!</p>
      </div>
      
      <div class="section">
        <h2>🚀 Accelerate Client Acquisition</h2>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">🎯</div>
            <div class="benefit-text">
              <strong>Reach Clients Actively Seeking Legal Services</strong>
              <p>Connect with pre-qualified clients who are actively searching for legal expertise in your specialization areas. Our platform brings clients directly to you, eliminating cold outreach and reducing client acquisition costs.</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🌐</div>
            <div class="benefit-text">
              <strong>Expand Beyond Geographic Boundaries</strong>
              <p>Break free from local limitations. Serve clients across India through our secure video consultation platform. Grow your practice without opening new offices or increasing overhead costs.</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">📈</div>
            <div class="benefit-text">
              <strong>Increase Revenue Streams</strong>
              <p>Offer flexible consultation options - in-person, video, or phone. Set your own fees, manage your availability, and maximize your billable hours with efficient online consultations.</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">⚡</div>
            <div class="benefit-text">
              <strong>Instant Client Notifications</strong>
              <p>Receive real-time alerts when clients book consultations. Never miss an opportunity with our instant notification system via email and WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>💎 Enhance Your Professional Value</h2>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">⭐</div>
            <div class="benefit-text">
              <strong>Build a Powerful Online Reputation</strong>
              <p>Showcase your expertise with a comprehensive professional profile featuring your credentials, specializations, experience, and client testimonials. Let your achievements speak for themselves.</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🏆</div>
            <div class="benefit-text">
              <strong>Establish Credibility Through Reviews</strong>
              <p>Build trust with potential clients through authentic reviews and ratings from satisfied clients. A strong reputation attracts premium clients and higher-value cases.</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🎓</div>
            <div class="benefit-text">
              <strong>Highlight Your Expertise</strong>
              <p>Display your educational qualifications, bar registration, court admissions, notable cases, and areas of specialization. Position yourself as the go-to expert in your practice areas.</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <div class="benefit-icon">🔍</div>
            <div class="benefit-text">
              <strong>Enhanced Visibility in Search Results</strong>
              <p>Our SEO-optimized platform ensures your profile appears when clients search for legal services in your specialization and location. Get discovered by clients who need your expertise.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stats-box">
        <strong>📊 Why Legal Professionals Choose LegalIQ</strong>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">1000+</span>
            <div class="stat-label">Active Legal Professionals</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">5000+</span>
            <div class="stat-label">Client Consultations</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">50+</span>
            <div class="stat-label">Practice Areas Covered</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <div class="stat-label">Free Registration</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>🎯 Platform Features That Drive Results</h2>
        <div class="value-props">
          <div class="value-prop">
            <div class="value-prop-icon">💼</div>
            <strong>Professional Dashboard</strong>
            <p>Manage consultations, track earnings, and update your profile from one central hub</p>
          </div>
          <div class="value-prop">
            <div class="value-prop-icon">📱</div>
            <strong>Video Consultations</strong>
            <p>Secure, high-quality video calls with built-in scheduling and payment processing</p>
          </div>
          <div class="value-prop">
            <div class="value-prop-icon">💰</div>
            <strong>Flexible Pricing</strong>
            <p>Set your own consultation fees and control your earning potential</p>
          </div>
          <div class="value-prop">
            <div class="value-prop-icon">🔒</div>
            <strong>Secure & Confidential</strong>
            <p>Bank-grade security ensures all client communications remain private</p>
          </div>
          <div class="value-prop">
            <div class="value-prop-icon">📅</div>
            <strong>Smart Scheduling</strong>
            <p>Automated calendar management prevents double-bookings and conflicts</p>
          </div>
          <div class="value-prop">
            <div class="value-prop-icon">📊</div>
            <strong>Analytics & Insights</strong>
            <p>Track profile views, consultation requests, and client engagement metrics</p>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>✅ Simple 4-Step Registration Process</h2>
        <ol class="steps">
          <li>
            <strong>Visit LegalIQ.in</strong><br>
            Navigate to <a href="https://legaliq.in" style="color: #667eea;">https://legaliq.in</a> and click on "Register as Lawyer" to begin your journey
          </li>
          <li>
            <strong>Complete Your Professional Profile</strong><br>
            Provide your credentials including Bar registration number, specializations, experience, education, and professional achievements
          </li>
          <li>
            <strong>Verify Your Account</strong><br>
            Quick verification process to ensure platform integrity and build client trust
          </li>
          <li>
            <strong>Go Live & Start Receiving Clients</strong><br>
            Your profile becomes immediately visible to thousands of potential clients searching for legal services
          </li>
        </ol>
      </div>
      
      <div class="cta-section">
        <h3>🎯 Ready to Transform Your Practice?</h3>
        <p style="font-size: 18px; margin: 20px 0;">Join hundreds of successful legal professionals already growing their practice with LegalIQ</p>
        <a href="https://legaliq.in/register-lawyer" class="cta-button">Register Now - 100% FREE! 🚀</a>
        <p style="margin-top: 25px; font-size: 15px; color: #666;">
          ⏱️ Registration takes less than 5 minutes<br>
          ✅ No credit card required | ✅ No hidden fees | ✅ Cancel anytime
        </p>
      </div>
      
      <div class="section">
        <h2>🤝 What Sets LegalIQ Apart</h2>
        <ul style="line-height: 2.2; font-size: 16px;">
          <li><strong>Verified Professionals Only:</strong> Maintain platform credibility with strict verification standards</li>
          <li><strong>Client-Centric Design:</strong> Intuitive interface makes it easy for clients to find and book you</li>
          <li><strong>Transparent Pricing:</strong> Clients see your fees upfront, reducing negotiation friction</li>
          <li><strong>Complete Control:</strong> You decide your availability, fees, and consultation types</li>
          <li><strong>Multi-Specialization Support:</strong> List all your practice areas to attract diverse clients</li>
          <li><strong>24/7 Technical Support:</strong> Our dedicated team ensures your success on the platform</li>
          <li><strong>Mobile-Optimized:</strong> Manage your practice on-the-go with our responsive platform</li>
          <li><strong>Marketing Support:</strong> Benefit from our ongoing marketing efforts to drive client traffic</li>
        </ul>
      </div>
      
      <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #28a745;">
        <p style="margin: 0; font-size: 17px;">
          <strong style="color: #155724; font-size: 20px; display: block; margin-bottom: 10px;">💬 Need Assistance?</strong>
          Our dedicated support team is ready to help you get started and answer any questions about the platform.<br><br>
          📧 Email: <a href="mailto:support@legaliq.in" style="color: #667eea; font-weight: 600;">support@legaliq.in</a><br>
          🌐 Website: <a href="https://legaliq.in" style="color: #667eea; font-weight: 600;">https://legaliq.in</a>
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #ffc107;">
        <p style="margin: 0; font-size: 16px; color: #856404;">
          <strong style="font-size: 18px; display: block; margin-bottom: 10px;">⚡ Limited Time Opportunity</strong>
          As an early adopter, you'll benefit from increased visibility as we continue to grow our client base through aggressive marketing campaigns. Join now to establish your presence before your competitors do!
        </p>
      </div>
      
      <p style="margin-top: 35px; font-size: 16px; line-height: 1.8;">
        We are committed to helping legal professionals like you thrive in the digital age. LegalIQ is more than just a platform—it's your partner in building a successful, modern legal practice.
      </p>
      
      <p style="margin-top: 30px; font-size: 16px;">
        We look forward to welcoming ${firmName} to the LegalIQ community and supporting your growth journey.
      </p>
      
      <p style="margin-top: 35px; font-size: 16px;">
        Best regards,<br>
        <strong style="font-size: 18px;">The LegalIQ Team</strong><br>
        <a href="https://legaliq.in" style="color: #667eea; font-weight: 600;">https://legaliq.in</a><br>
        <span style="color: #666;">Empowering Legal Professionals Across India</span>
      </p>
    </div>
    
    <div class="footer">
      <p style="font-size: 18px;"><strong>LegalIQ</strong> - Your Digital Gateway to Legal Success</p>
      <p style="font-size: 14px; opacity: 0.9;">Connecting Legal Professionals with Clients Nationwide</p>
      
      <div class="social-links">
        <a href="https://legaliq.in">🌐 Website</a>
        <a href="mailto:support@legaliq.in">📧 Email Support</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 25px; opacity: 0.8; line-height: 1.6;">
        You received this email as a personal invitation to join LegalIQ's network of legal professionals.<br>
        If you wish to unsubscribe from future communications, please reply with "UNSUBSCRIBE" in the subject line.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Parse email addresses from command line arguments or file
function parseEmailAddresses() {
  const args = process.argv.slice(2);
  const recipients = [];

  // Check if a file path is provided
  if (args.length === 1 && args[0].endsWith('.txt')) {
    const filePath = path.resolve(args[0]);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          recipients.push({ name: parts[0], email: parts[1] });
        } else if (parts.length === 1 && parts[0].includes('@')) {
          const email = parts[0];
          const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          recipients.push({ name, email });
        }
      });
    } else {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
  } else if (args.length > 0) {
    // Parse email addresses from command line
    args.forEach(arg => {
      if (arg.includes('@')) {
        const email = arg.trim();
        const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        recipients.push({ name, email });
      }
    });
  } else {
    // Default recipients if no arguments provided
    return [
      { name: 'Shoolin Consultancy', email: 'info@shoolinconsultancy.in' },
      { name: 'Reddy Law', email: 'info@reddylaw.in' },
      { name: 'Fathom Legal', email: 'assist@fathomlegal.com' },
      { name: 'SS Law', email: 'info@sslaw.co.in' },
      { name: 'Anjan Kumar', email: 'anjankumar5328@gmail.com' }
    ];
  }

  return recipients;
}

// Send email to a single recipient
async function sendInvitationEmail(recipient, index, total) {
  const mailOptions = {
    from: `LegalIQ <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    bcc: 'yogmca@gmail.com', // BCC to admin for tracking
    subject: '🚀 Invitation: Join LegalIQ - Increase Client Acquisition & Enhance Professional Value | 100% FREE',
    // Request read receipt and delivery notification
    headers: {
      'Disposition-Notification-To': process.env.EMAIL_USER,
      'Return-Receipt-To': process.env.EMAIL_USER,
      'X-Confirm-Reading-To': process.env.EMAIL_USER
    },
    html: generateEmailHTML(recipient.name),
    text: `
Dear ${recipient.name} Team,

We are excited to invite you to join LegalIQ, India's fastest-growing digital platform connecting legal professionals with clients nationwide.

🎉 100% FREE REGISTRATION - ZERO COST, MAXIMUM VALUE!
Join LegalIQ at absolutely no cost. No signup fees, no monthly charges, no hidden costs.

🚀 ACCELERATE CLIENT ACQUISITION

✓ Reach Clients Actively Seeking Legal Services
  Connect with pre-qualified clients searching for legal expertise in your specialization areas.

✓ Expand Beyond Geographic Boundaries
  Serve clients across India through our secure video consultation platform.

✓ Increase Revenue Streams
  Offer flexible consultation options and maximize your billable hours.

✓ Instant Client Notifications
  Receive real-time alerts when clients book consultations.

💎 ENHANCE YOUR PROFESSIONAL VALUE

✓ Build a Powerful Online Reputation
  Showcase your expertise with a comprehensive professional profile.

✓ Establish Credibility Through Reviews
  Build trust with authentic reviews and ratings from satisfied clients.

✓ Highlight Your Expertise
  Display your qualifications, specializations, and notable achievements.

✓ Enhanced Visibility in Search Results
  Our SEO-optimized platform ensures clients find you easily.

📊 WHY LEGAL PROFESSIONALS CHOOSE LEGALIQ

• 1000+ Active Legal Professionals
• 5000+ Client Consultations Completed
• 50+ Practice Areas Covered
• 100% Free Registration

🎯 PLATFORM FEATURES THAT DRIVE RESULTS

• Professional Dashboard - Manage everything from one central hub
• Video Consultations - Secure, high-quality video calls
• Flexible Pricing - Set your own consultation fees
• Secure & Confidential - Bank-grade security
• Smart Scheduling - Automated calendar management
• Analytics & Insights - Track your performance metrics

✅ SIMPLE 4-STEP REGISTRATION PROCESS

1. Visit https://legaliq.in and click "Register as Lawyer"
2. Complete your professional profile with credentials
3. Quick verification process
4. Go live and start receiving clients immediately

🤝 WHAT SETS LEGALIQ APART

• Verified Professionals Only
• Client-Centric Design
• Transparent Pricing
• Complete Control Over Your Practice
• Multi-Specialization Support
• 24/7 Technical Support
• Mobile-Optimized Platform
• Ongoing Marketing Support

REGISTER NOW: https://legaliq.in/register-lawyer

⏱️ Registration takes less than 5 minutes
✅ No credit card required
✅ No hidden fees
✅ Cancel anytime

💬 NEED ASSISTANCE?
Email: support@legaliq.in
Website: https://legaliq.in

We look forward to welcoming ${recipient.name} to the LegalIQ community and supporting your growth journey.

Best regards,
The LegalIQ Team
https://legaliq.in
Empowering Legal Professionals Across India

---
You received this email as a personal invitation to join LegalIQ.
To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [${index + 1}/${total}] Email sent to ${recipient.name} (${recipient.email})`);
    return { success: true, recipient };
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] Failed to send to ${recipient.name} (${recipient.email}):`, error.message);
    return { success: false, recipient, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 LegalIQ Law Firm Invitation Campaign\n');
  
  const recipients = parseEmailAddresses();
  
  if (recipients.length === 0) {
    console.error('❌ No valid email addresses found.');
    console.log('\n📖 Usage:');
    console.log('   node send-law-firm-invitations.js                          # Use default recipients');
    console.log('   node send-law-firm-invitations.js email1@example.com ...   # Provide emails as arguments');
    console.log('   node send-law-firm-invitations.js emails.txt               # Load from file (format: Name, email@example.com)');
    process.exit(1);
  }

  console.log('📋 Target recipients:\n');
  recipients.forEach((recipient, i) => {
    console.log(`   ${i + 1}. ${recipient.name} - ${recipient.email}`);
  });

  console.log(`\n📧 Preparing to send invitation emails to ${recipients.length} recipients...`);
  console.log(`📋 BCC: yogmca@gmail.com (admin will receive all emails)`);
  console.log(`📬 Read receipts enabled: You'll be notified when emails are opened\n`);

  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`Do you want to proceed with sending ${recipients.length} emails? (yes/no): `, async (answer) => {
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
    for (let i = 0; i < recipients.length; i++) {
      const result = await sendInvitationEmail(recipients[i], i, recipients.length);

      if (result.success) {
        results.sent.push(result.recipient);
      } else {
        results.failed.push({ recipient: result.recipient, error: result.error });
      }

      // Wait 2 seconds between emails to avoid rate limiting
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CAMPAIGN SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully sent: ${results.sent.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📧 Total: ${recipients.length}`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed emails:');
      results.failed.forEach(({ recipient, error }) => {
        console.log(`   - ${recipient.name} (${recipient.email}): ${error}`);
      });
    }

    console.log('\n✨ Campaign completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Check yogmca@gmail.com for BCC copies of all sent emails');
    console.log('   2. Monitor for read receipts in your inbox');
    console.log('   3. Track responses and follow up as needed');
    console.log('   4. Monitor registrations from these recipients\n');
    
    process.exit(0);
  });
}

// Run the campaign
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
