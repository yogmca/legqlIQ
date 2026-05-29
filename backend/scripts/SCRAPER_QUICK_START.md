# 🚀 Quick Start: Scrape & Email Top 50 Law Firms

## One-Command Setup

```bash
cd backend/scripts && node scrape-law-firms.js
```

## Then Send Emails

```bash
node send-law-firm-invitations.js law-firms-2026-05-19.txt
```

*(Replace date with actual generated file)*

---

## What This Does

### Step 1: Scraper (`scrape-law-firms.js`)
- ✅ Fetches data from: https://neetishastra.com/email-ids-office-locations-of-top-50-corporate-law-firms-for-lawyers-and-law-students-legal-jobs-internships-2026/
- ✅ Extracts law firm names and email addresses
- ✅ Removes duplicates
- ✅ Saves 3 files: JSON, TXT, CSV

### Step 2: Email Sender (`send-law-firm-invitations.js`)
- ✅ Reads the TXT file
- ✅ Sends personalized invitation emails
- ✅ Includes BCC to yogmca@gmail.com
- ✅ 2-second delay between emails
- ✅ Professional HTML email template

---

## Output Files

| File | Purpose |
|------|---------|
| `law-firms-YYYY-MM-DD.json` | Full data with metadata |
| `law-firms-YYYY-MM-DD.txt` | **Use this for email script** ⭐ |
| `law-firms-YYYY-MM-DD.csv` | Open in Excel/Sheets |

---

## Complete Workflow

```bash
# 1. Navigate to scripts directory
cd backend/scripts

# 2. Run scraper
node scrape-law-firms.js

# 3. Review scraped data (optional)
cat law-firms-2026-05-19.txt

# 4. Send emails
node send-law-firm-invitations.js law-firms-2026-05-19.txt

# 5. Type 'yes' when prompted
```

---

## Email Template Highlights

✅ **Subject:** 🚀 Invitation: Join LegalIQ - Increase Client Acquisition & Enhance Professional Value | 100% FREE

✅ **Key Points:**
- 100% FREE Registration
- Reach clients actively seeking legal services
- Expand beyond geographic boundaries
- Video consultation platform
- Professional dashboard
- Build online reputation

✅ **Call-to-Action:** Register Now button linking to https://legaliq.in/register-lawyer

---

## Troubleshooting

### No law firms found?
```bash
# Check if URL is accessible
curl -I https://neetishastra.com/email-ids-office-locations-of-top-50-corporate-law-firms-for-lawyers-and-law-students-legal-jobs-internships-2026/

# If website is down, use manual entry
nano law-firms-manual.txt
# Format: Firm Name, email@example.com
```

### Email sending fails?
```bash
# Check .env file has:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Dependencies

✅ Already installed in backend/package.json:
- `axios` - HTTP requests
- `cheerio` - HTML parsing
- `nodemailer` - Email sending

---

## Support

📧 **Email:** yogmca@gmail.com  
📖 **Full Guide:** [`WEB_SCRAPER_USAGE_GUIDE.md`](./WEB_SCRAPER_USAGE_GUIDE.md)  
📧 **Email Guide:** [`LAW_FIRM_INVITATION_GUIDE.md`](./LAW_FIRM_INVITATION_GUIDE.md)

---

## Success Checklist

- [ ] Run scraper successfully
- [ ] Review generated TXT file
- [ ] Verify EMAIL_USER and EMAIL_PASSWORD in .env
- [ ] Send test email to yourself first
- [ ] Send to all scraped law firms
- [ ] Check yogmca@gmail.com for BCC copies
- [ ] Monitor for responses and registrations

---

**Ready to go!** 🎉 All dependencies are already installed. Just run the commands above.
