const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// List of lawyers to send signup invitation emails
const allLawyers = [
  // --- Original list ---
  { name: 'Tanvi Nigam', email: 'nigam.tanvi@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/2657/2019' },
  { name: 'Shighra Kumar', email: 'adv.shighra@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/899/2022' },
  { name: 'Harsh Kumar', email: 'advocateharshkumar@gmail.com', location: 'NOIDA-based Advocate', enrollment: '' },
  { name: 'Ngnagom Junior', email: 'juniorluwang1@gmail.com', location: 'Advocate', enrollment: '' },
  { name: 'Niyati Sharma', email: 'sharma.niyati29@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/5550/2019' },
  { name: 'Arijit Singh', email: 'udhakar.sci@gmail.com', location: 'Advocate', enrollment: 'D/2389/2011' },
  { name: 'Rajat Sharma', email: 'rajat.lexbearers@gmail.com', location: 'Advocate', enrollment: 'D/4360/2016' },
  { name: 'Himanshu Tyagi', email: 'adv.himanshutyagi@gmail.com', location: 'Advocate', enrollment: 'UP/5116/08' },
  { name: 'Rinchen Wangmo', email: 'rtwangmo@gmail.com', location: 'Advocate', enrollment: 'W-00060' },
  { name: 'Aabhas Parimal', email: 'aabhasparimal@gmail.com', location: 'Advocate', enrollment: 'A-00813' },
  // --- Second batch ---
  { name: 'Astha Singh', email: 'asthasinghaor@gmail.com', location: 'Advocate', enrollment: 'BR/1132/2017' },
  { name: 'Pracheta Kar', email: 'pracheta.kar28@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/2856/2016' },
  { name: 'Sanjana Saddy', email: 'sanjanasaddy@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/1812/2015' },
  { name: 'Samapika Biswal', email: 'samapikabiswal91@gmail.com', location: 'Maharashtra-based Advocate', enrollment: 'MAH/514/2014' },
  { name: 'Megha Sharma', email: 'mslegal.co@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/10306/2019' },
  { name: 'Anuj Verma', email: 'anmr2040@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/924/2015' },
  { name: 'Chitvan Singhal', email: 'chitvan.govt@cnmlaw.in', location: 'Delhi-based Advocate', enrollment: 'D/1641/2016' },
  { name: 'Ankit Agarwal', email: 'ankitlawz@gmail.com', location: 'Delhi-based Advocate', enrollment: 'D/21907/2012' },
  // --- Simdega, Jharkhand advocates ---
  { name: 'Bhushan Singh', email: 'bhushansinghsimdega@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Shamim Akhtar', email: 'advshamim4@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Bijay Kumar Bakshi', email: 'bijaybakshi007@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Ravi Kumar Bakshi', email: 'advravibakshi@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Praduman Singh', email: 'pradumansingh9876@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Girish Chandra Gupta', email: 'girishchandragupta360@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Manoj Kumar Nag', email: 'advmanojnag@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Basant Kumar', email: 'basantkumaradvo@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Ajay Kumar', email: 'advajaykrsim@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Arun Unmesh Tirkey', email: 'aruntirkey@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sagir Ahmad', email: 'sagirahmad078@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Md. Yusuf', email: 'mdyusuf1029@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Suresh Prasad', email: 'sureshprasad684@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Rajendra Prasad', email: 'rp6797095@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Shyam Narayan Sahu', email: 'shyamnarayansahu48@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Hira Sahu', email: 'advhirasahu123@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Jagdishwar Sahu', email: 'jagdishwarsahuadv290@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Md. Zakee Ahmad', email: 'zzakianmad41@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sidhan Prasad', email: 'sidhanprasad@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Prabhat Kumar Srivasta', email: 'pksimdega@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Anuj Kumar', email: 'anujkumar1949@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Vijoy Kumar Mishra', email: 'vijoymishra.sim@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Narayan Bansal', email: 'narayanbansal56@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Dipesh Prashant Xess', email: 'deepeshprashantxess@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Brikhbhan Agarwal', email: 'bbagrawal@outlook.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Santu Prasad', email: 'santoshakla617@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Amit Kumar', email: 'amitbantu79@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Ludam Baha Sanga', email: 'ludambaha@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Premanand Shil Topno', email: 'advtopno@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Jitendra Ashok', email: 'jitendra.ashok1@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Clement Tirkey', email: 'clementtirkey69@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sunil Lugun', email: 'sunillugun33@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Arun Kumar', email: 'arun101954@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Ramprit Prasad', email: 'rampritprsd@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sanjay Kumar Mahto', email: 'adv.sanjaymahto@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Shiv Kumar Singh', email: 'shivkrsingh53@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Pramod Kr Dungdung', email: 'dungdungpramod123@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Kameshwar Prasad', email: 'kameshwarsmd@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Manish Tirkey', email: 'oraon04tirkey@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sanjay Binod Dungdung', email: 'sbdung02@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Pushpa Hans', email: 'pushpahans16@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Kiran Chaudhary', email: 'k.c-5062346@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Mangernath Singh', email: 'mnsingh856@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Nand Kishore Prasad', email: 'nandkishor.nrp@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Kailash Prasad', email: 'prasadkailash704@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Gauri Shankar', email: 'gorishanker1939@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sita Ram Mahto', email: 'mahtositaram367@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Saryu Baraik', email: 'saryubaraik1974@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sunil Kumar Bakshi', email: 'sunilkrbakshi@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Devendra Nag', email: 'devendranag49@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Jugal Kishore Ram', email: 'jugalkishorram@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Komal Das', email: 'advdaskomal@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Omkar Prasad', email: 'advomkarprasad@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Md. Shakeel', email: 'mdshaakeel1806@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sant Prasad Singh', email: 'santpdsng@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Rameshwar Sahu', email: 'rameshsahu1503@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Rajendra Kr. Yadav', email: 'yadavrajendrakumar247@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'James Marki', email: 'jamesmarki@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Anup Kr. Toppo', email: 'anuptoppo69@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Bipin Chandra Dungdung', email: 'advbcdungdung72@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Bipin Tete', email: 'bipintete9@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Govind Das', email: 'dasgovind95@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Bhubaneshwar Soi', email: 'saibhuuneshwar169@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Snehlata Soreng', email: 'snehlatasoreng1974@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Anil Pradeep Surin', email: 'anilpradeepsurin@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Scholastica Soreng', email: 'scholasticasoreng07022@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Vibhaw Marki', email: 'vibhawmarki@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Sushil Sorengh', email: 'advocatesushilsoreng@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
  { name: 'Shanker Mahto', email: 'shankermahto1971@gmail.com', location: 'Simdega, Jharkhand', enrollment: '' },
];

// Send to all lawyers (change to allLawyers.slice(0, 5) for testing with first 5)
const lawyers = allLawyers;

// Generate personalized email HTML for LegalIQ signup invitation
function generateEmailHTML(lawyerName) {
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
      <h1>LegalIQ</h1>
      <p>India's Premier Legal Services Platform</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear ${lawyerName},</p>
      
      <p>We hope this email finds you well. We are reaching out to personally invite you to join <strong>LegalIQ</strong>, a revolutionary platform designed to connect legal professionals with clients across India.</p>
      
      <div class="section">
        <h2>Why Join LegalIQ?</h2>
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
        <strong>100% FREE Registration - No Hidden Costs!</strong>
        <p style="margin: 10px 0 0 0;">Join thousands of legal professionals already benefiting from LegalIQ. There are no signup fees, no monthly charges, and no hidden costs.</p>
      </div>
      
      <div class="section">
        <h2>Simple Signup Process</h2>
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
        <a href="https://legaliq.in/register-lawyer" class="cta-button">Sign Up Now - It's FREE!</a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Registration takes less than 5 minutes
        </p>
      </div>
      
      <div class="section">
        <h2>What Makes LegalIQ Different?</h2>
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
          <strong style="color: #2e7d32;">Need Help?</strong><br>
          Our support team is available to assist you with registration or answer any questions.<br>
          Email: <a href="mailto:support@legaliq.in" style="color: #667eea;">support@legaliq.in</a>
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
      <p>India</p>
      
      <div class="social-links">
        <a href="https://legaliq.in">🌐 Website</a>
        <a href="mailto:support@legaliq.in">📧 Email</a>
      </div>
      
      <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
        You received this email as a personal invitation to join LegalIQ.
        If you wish to unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send email to a single lawyer
async function sendSignupEmail(lawyer, index, total) {
  const mailOptions = {
    from: `LegalIQ <${process.env.EMAIL_USER}>`,
    to: lawyer.email,
    bcc: 'yogmca@gmail.com', // BCC to admin for tracking
    subject: 'Join LegalIQ - Free Registration for Legal Professionals | Grow Your Practice Online',
    html: generateEmailHTML(lawyer.name),
    text: `
Dear ${lawyer.name},

We are reaching out to personally invite you to join LegalIQ, India's premier legal services platform designed to connect legal professionals with clients across the country.

WHY JOIN LEGALIQ?

- Expand Your Reach - Connect with clients nationwide
- Professional Profile - Showcase your expertise and credentials
- Video Consultations - Offer convenient online services
- Build Your Reputation - Receive client reviews and ratings
- Set Your Own Fees - You control your consultation charges
- Secure Platform - All communications are confidential

100% FREE REGISTRATION - NO HIDDEN COSTS!

SIMPLE SIGNUP PROCESS:

1. Visit https://legaliq.in
2. Click "Register as Lawyer"
3. Fill in your professional details
4. Start receiving clients immediately

WHAT MAKES LEGALIQ DIFFERENT?

- Verified Professionals
- Client-Friendly Platform
- Transparent Pricing
- Flexible Scheduling
- 24/7 Support

Sign up now at: https://legaliq.in/register-lawyer

Need help? Contact us:
Email: support@legaliq.in

Best regards,
The LegalIQ Team
https://legaliq.in

---
You received this email as a personal invitation to join LegalIQ.
To unsubscribe, reply with "UNSUBSCRIBE" in the subject line.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [${index + 1}/${total}] Email sent to ${lawyer.name} (${lawyer.email}) - ${lawyer.location}`);
    return { success: true, lawyer };
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] Failed to send to ${lawyer.name} (${lawyer.email}):`, error.message);
    return { success: false, lawyer, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 LegalIQ Signup Invitation Email Campaign\n');
  console.log('📋 Target lawyers:\n');

  lawyers.forEach((lawyer, i) => {
    console.log(`   ${i + 1}. ${lawyer.name} - ${lawyer.email} (${lawyer.location})${lawyer.enrollment ? ' [' + lawyer.enrollment + ']' : ''}`);
  });

  console.log(`\n📧 Preparing to send signup invitation emails to ${lawyers.length} lawyers...`);
  console.log(`📋 BCC: yogmca@gmail.com (admin will receive all emails)\n`);

  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`Do you want to proceed with sending ${lawyers.length} emails? (yes/no): `, async (answer) => {
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
    for (let i = 0; i < lawyers.length; i++) {
      const result = await sendSignupEmail(lawyers[i], i, lawyers.length);

      if (result.success) {
        results.sent.push(result.lawyer);
      } else {
        results.failed.push({ lawyer: result.lawyer, error: result.error });
      }

      // Wait 2 seconds between emails to avoid rate limiting
      if (i < lawyers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 CAMPAIGN SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully sent: ${results.sent.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📧 Total: ${lawyers.length}`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed emails:');
      results.failed.forEach(({ lawyer, error }) => {
        console.log(`   - ${lawyer.name} (${lawyer.email}): ${error}`);
      });
    }

    console.log('\n✨ Campaign completed!');
    process.exit(0);
  });
}

// Run the campaign
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
