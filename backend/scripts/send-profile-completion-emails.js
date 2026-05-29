require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const emailService = require('../services/emailService');

async function sendProfileCompletionEmails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // List of professionals to email
    const emailList = [
      'akashaparmar7@gmail.com',
      'tharun@mtrandco.com',
      'lunawat123@gmail.com',
      'chandrashekarsj@mail.ca.in',
      'admin@apcaassociates.pro',
      'cachetnaandco@gmail.com'
    ];

    console.log(`\n📧 Sending profile completion emails to ${emailList.length} professionals...\n`);

    let sentCount = 0;
    let failedCount = 0;

    for (const email of emailList) {
      try {
        // Find user
        const user = await User.findOne({ email });

        if (!user) {
          console.log(`❌ ${email} - User not found`);
          failedCount++;
          continue;
        }

        // Find professional profile
        const professional = await Lawyer.findOne({ userId: user._id });

        if (!professional) {
          console.log(`❌ ${email} - Professional profile not found`);
          failedCount++;
          continue;
        }

        const professionalType = professional.professionalType === 'tax-consultant' ? 'Tax Consultant' :
                                professional.professionalType === 'auditor' ? 'Auditor' : 'Lawyer';

        console.log(`📤 Sending to: ${user.name} (${email}) - ${professionalType}`);

        // Send email using transporter directly
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@legaliq.in',
          to: email,
          subject: `Complete Your ${professionalType} Profile on LegalIQ`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                .checklist { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                .checklist li { margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎯 Complete Your Professional Profile</h1>
                </div>
                <div class="content">
                  <p>Dear ${user.name},</p>
                  
                  <p>Thank you for registering as a <strong>${professionalType}</strong> on <strong>LegalIQ</strong>!</p>
                  
                  <p>We noticed that your profile is missing some important information. Completing your profile will help potential clients find and connect with you more easily.</p>
                  
                  <div class="checklist">
                    <h3>📋 Please update the following:</h3>
                    <ul>
                      <li>✅ Professional specialization</li>
                      <li>✅ Years of experience</li>
                      <li>✅ Location/City</li>
                      <li>✅ Office/Firm name</li>
                      <li>✅ Education details</li>
                      <li>✅ Professional description</li>
                      <li>✅ Consultation fee</li>
                      <li>✅ Languages spoken</li>
                      ${professional.professionalType !== 'lawyer' ? '<li>✅ Registration number (optional)</li>' : '<li>✅ Bar registration number (optional)</li>'}
                    </ul>
                  </div>
                  
                  <p style="text-align: center;">
                    <a href="https://legaliq.in/profile" class="button">Complete Your Profile Now</a>
                  </p>
                  
                  <p><strong>Why complete your profile?</strong></p>
                  <ul>
                    <li>📈 Increase your visibility to potential clients</li>
                    <li>💼 Build trust with detailed professional information</li>
                    <li>🎯 Get matched with relevant client queries</li>
                    <li>⭐ Stand out from other professionals</li>
                  </ul>
                  
                  <p>If you need any assistance, please don't hesitate to contact us.</p>
                  
                  <p>Best regards,<br>
                  <strong>The LegalIQ Team</strong></p>
                </div>
                <div class="footer">
                  <p>LegalIQ - Your Trusted Legal Platform</p>
                  <p>📧 Email: support@legaliq.in | 🌐 Website: https://legaliq.in</p>
                </div>
              </div>
              </body>
              </html>
            `
          };
  
          const info = await emailService.transporter.sendMail(mailOptions);
          console.log(`   ✅ Email sent successfully (ID: ${info.messageId})`);
          sentCount++;

        // Add a small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`❌ ${email} - Error: ${error.message}`);
        failedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Emails sent: ${sentCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📧 Total: ${emailList.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

sendProfileCompletionEmails();
