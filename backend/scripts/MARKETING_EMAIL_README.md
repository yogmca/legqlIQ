# LegalIQ Marketing Email Campaign

This script automatically sends marketing emails to advocates listed on the Karnataka State Bar Council website, inviting them to join LegalIQ.

## Features

- ✅ Scrapes advocate emails from KSBC website
- ✅ Sends personalized HTML emails
- ✅ BCC to admin (yogmca@gmail.com) for tracking
- ✅ Professional email template with LegalIQ branding
- ✅ Highlights free registration and benefits
- ✅ Rate limiting to avoid spam filters
- ✅ Detailed campaign summary

## Prerequisites

1. **Node.js packages** (already installed):
   - axios
   - cheerio
   - nodemailer

2. **Gmail credentials** in `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

## How to Run

1. **Navigate to backend directory**:
   ```bash
   cd karnataka-bar-association/backend
   ```

2. **Run the script**:
   ```bash
   node scripts/send-marketing-emails.js
   ```

3. **Confirm the campaign**:
   - The script will show how many advocates were found
   - Type `yes` to proceed or `no` to cancel

## What the Script Does

1. **Scrapes** advocate names and emails from https://ksbc.org.in/senior_advocates_list.php
2. **Validates** email addresses
3. **Sends** personalized emails to each advocate
4. **BCCs** yogmca@gmail.com on every email for tracking
5. **Waits** 2 seconds between emails to avoid rate limiting
6. **Reports** success/failure for each email

## Email Content

The email includes:

### Subject
🏛️ Join LegalIQ - Free Registration for Legal Professionals

### Key Points
- Introduction to LegalIQ platform
- 6 main benefits (Expand Reach, Professional Profile, Video Consultations, etc.)
- **100% FREE Registration** - prominently highlighted
- Simple 4-step registration process
- What makes LegalIQ different
- Call-to-action button to register
- Support contact information

### Design
- Professional HTML template with LegalIQ branding
- Gradient header with purple theme
- Responsive layout
- Clear call-to-action buttons
- Footer with unsubscribe information

## Rate Limiting

- **2 seconds delay** between each email
- Prevents Gmail from flagging as spam
- For 100 advocates: ~3.5 minutes total

## Campaign Summary

After completion, you'll see:
- ✅ Number of successfully sent emails
- ❌ Number of failed emails
- 📧 Total emails attempted
- Detailed list of any failures with error messages

## BCC Tracking

Every email sent includes `yogmca@gmail.com` in BCC, so you will:
- Receive a copy of every email sent
- Track which advocates received the email
- Monitor the campaign progress in real-time

## Important Notes

⚠️ **Before Running**:
1. Ensure your Gmail App Password is correctly set in `.env`
2. Check that Gmail allows "Less secure app access" or use App Password
3. Test with a small batch first (modify the script to limit emails)

⚠️ **Gmail Limits**:
- Gmail has a daily sending limit (~500 emails/day for regular accounts)
- If you have many advocates, you may need to run the script over multiple days

⚠️ **Legal Compliance**:
- Emails include unsubscribe information
- Only sent to publicly listed advocates
- Professional business communication

## Testing

To test before sending to all advocates, modify line 365:

```javascript
// Test with first 5 advocates only
const testAdvocates = advocates.slice(0, 5);
for (let i = 0; i < testAdvocates.length; i++) {
  const result = await sendMarketingEmail(testAdvocates[i], i, testAdvocates.length);
  // ...
}
```

## Troubleshooting

### "No advocates found"
- Check if the KSBC website structure has changed
- Update the cheerio selectors in `scrapeAdvocates()` function

### "Authentication failed"
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Use Gmail App Password instead of regular password
- Enable 2-factor authentication and generate App Password

### "Rate limit exceeded"
- Increase delay between emails (change 2000 to 5000 ms)
- Split campaign into smaller batches

## Example Output

```
🚀 LegalIQ Marketing Email Campaign

🔍 Scraping advocates from KSBC website...
✅ Found 150 advocates with valid emails

📧 Preparing to send emails to 150 advocates...
📋 BCC: yogmca@gmail.com (admin will receive all emails)

Do you want to proceed with sending 150 emails? (yes/no): yes

📤 Sending emails...

✅ [1/150] Email sent to Advocate Name (email@example.com)
✅ [2/150] Email sent to Another Advocate (email2@example.com)
...

==================================================
📊 CAMPAIGN SUMMARY
==================================================
✅ Successfully sent: 148
❌ Failed: 2
📧 Total: 150

✨ Campaign completed!
```

## Support

For issues or questions:
- Email: yogmca@gmail.com
- Check Gmail sent folder for confirmation
- Review BCC emails in your inbox

---

**Created for LegalIQ Marketing Campaign**
*Last updated: March 2026*
