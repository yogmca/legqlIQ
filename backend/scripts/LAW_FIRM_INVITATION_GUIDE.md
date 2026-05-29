# Law Firm Invitation Email Campaign Guide

## Overview
This guide explains how to use the reusable email invitation script to send professional invitations to law firms and legal professionals to join LegalIQ.

## Script Location
[`backend/scripts/send-law-firm-invitations.js`](./send-law-firm-invitations.js)

## Features

### ✅ Email Content Highlights
- **100% FREE Registration** - Prominently displayed throughout the email
- **Client Acquisition Benefits**:
  - Reach clients actively seeking legal services
  - Expand beyond geographic boundaries
  - Increase revenue streams
  - Instant client notifications
- **Professional Value Enhancement**:
  - Build powerful online reputation
  - Establish credibility through reviews
  - Highlight expertise and credentials
  - Enhanced visibility in search results
- **Platform Features**: Dashboard, video consultations, flexible pricing, security, scheduling, analytics
- **Simple 4-step registration process**

### ✅ Technical Features
- **Read Receipts Enabled** - Get notified when recipients open emails
- **BCC to Admin** - All emails are BCC'd to yogmca@gmail.com for tracking
- **Rate Limiting** - 2-second delay between emails to avoid spam filters
- **Error Handling** - Detailed success/failure reporting
- **Reusable Design** - Multiple ways to specify recipients

## Usage

### Method 1: Use Default Recipients (Current Campaign)
```bash
cd backend/scripts
node send-law-firm-invitations.js
```

**Default recipients:**
1. Shoolin Consultancy - info@shoolinconsultancy.in
2. Reddy Law - info@reddylaw.in
3. Fathom Legal - assist@fathomlegal.com
4. SS Law - info@sslaw.co.in
5. Anjan Kumar - anjankumar5328@gmail.com

### Method 2: Provide Email Addresses as Arguments
```bash
cd backend/scripts
node send-law-firm-invitations.js email1@example.com email2@example.com email3@example.com
```

The script will automatically extract names from email addresses (e.g., `info@lawfirm.com` → "Info Lawfirm").

### Method 3: Load from a Text File
Create a file `emails.txt` with one entry per line:

**Format Option 1** (Name, Email):
```
Law Firm Name, info@lawfirm.com
Another Firm, contact@anotherfirm.in
John Doe, john@example.com
```

**Format Option 2** (Email only):
```
info@lawfirm.com
contact@anotherfirm.in
john@example.com
```

Then run:
```bash
cd backend/scripts
node send-law-firm-invitations.js emails.txt
```

## Email Template Details

### Subject Line
```
🚀 Invitation: Join LegalIQ - Increase Client Acquisition & Enhance Professional Value | 100% FREE
```

### Key Sections
1. **Header** - LegalIQ branding with gradient design
2. **FREE Registration Highlight** - Yellow highlight box emphasizing zero cost
3. **Client Acquisition Benefits** - 4 detailed benefit cards
4. **Professional Value Enhancement** - 4 detailed benefit cards
5. **Statistics Box** - Platform metrics (1000+ professionals, 5000+ consultations)
6. **Platform Features** - 6 feature cards in grid layout
7. **Registration Steps** - 4-step process with numbered icons
8. **Call-to-Action** - Prominent "Register Now" button
9. **What Sets LegalIQ Apart** - 8 differentiating factors
10. **Support Information** - Contact details for assistance
11. **Limited Time Opportunity** - Urgency messaging

### Design Features
- Professional gradient color scheme (purple/blue)
- Responsive HTML email template
- Emoji icons for visual appeal
- Clean, modern layout with proper spacing
- Mobile-friendly design

## Read Receipts

The script includes three types of read receipt headers:
- `Disposition-Notification-To`
- `Return-Receipt-To`
- `X-Confirm-Reading-To`

**Note:** Read receipts depend on the recipient's email client settings. Not all email clients support or honor read receipt requests.

## Monitoring Results

### Check Admin BCC
All sent emails are BCC'd to `yogmca@gmail.com`. Check this inbox to:
- Verify emails were sent successfully
- Review the actual email content received
- Track the campaign

### Read Receipts
If recipients have read receipts enabled, you'll receive notifications at the sender email address when they open the emails.

### Campaign Summary
After completion, the script displays:
```
============================================================
📊 CAMPAIGN SUMMARY
============================================================
✅ Successfully sent: X
❌ Failed: Y
📧 Total: Z
```

## Troubleshooting

### Email Sending Fails
1. **Check .env file** - Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
2. **Gmail App Password** - If using Gmail, you need an App Password, not your regular password
3. **Rate Limiting** - If many emails fail, increase the delay between sends (currently 2 seconds)

### Read Receipts Not Working
- Read receipts are optional and depend on recipient settings
- Many corporate email systems disable read receipts
- Consider using email tracking services for better analytics

### Script Won't Run
```bash
# Make sure you're in the right directory
cd backend/scripts

# Check if Node.js is installed
node --version

# Check if dependencies are installed
cd ../.. && npm install
```

## Best Practices

1. **Test First** - Send to your own email address first to verify formatting
2. **Batch Sending** - For large lists, send in batches to avoid rate limiting
3. **Personalization** - Use proper names when possible (Method 3 with name,email format)
4. **Timing** - Send during business hours (9 AM - 5 PM) for better open rates
5. **Follow-up** - Plan follow-up emails for non-responders after 1-2 weeks

## Customization

To customize the email content, edit the [`generateEmailHTML()`](./send-law-firm-invitations.js) function in the script.

Key areas to customize:
- Subject line (line 621)
- Email body HTML (lines 18-536)
- Plain text version (lines 623-638)
- Sender name (line 619)

## Campaign Tracking

Create a spreadsheet to track:
- Date sent
- Recipient name and email
- Email opened (if read receipt received)
- Response received
- Registration completed
- Follow-up needed

## Next Steps After Sending

1. ✅ Check `yogmca@gmail.com` for BCC copies
2. ✅ Monitor for read receipts
3. ✅ Track responses and inquiries
4. ✅ Monitor new registrations on the platform
5. ✅ Follow up with non-responders after 1 week
6. ✅ Send thank you emails to those who register

## Support

For issues or questions:
- Email: yogmca@gmail.com
- Check the script output for detailed error messages
- Review the `.env` file for correct email credentials

---

**Last Updated:** May 6, 2026
**Script Version:** 1.0
**Campaign:** Law Firm Invitations - Initial Batch
