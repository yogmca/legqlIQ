# Web Scraper for Top 50 Corporate Law Firms - Usage Guide

## Overview
This guide explains how to use the web scraper to extract law firm contact information from the Neetishastra website and automatically send invitation emails using the existing email script.

## Files Involved

### 1. Web Scraper Script
**Location:** [`backend/scripts/scrape-law-firms.js`](./scrape-law-firms.js)

**Purpose:** Scrapes law firm names, email addresses, and locations from the target URL

**Target URL:** https://neetishastra.com/email-ids-office-locations-of-top-50-corporate-law-firms-for-lawyers-and-law-students-legal-jobs-internships-2026/

### 2. Email Invitation Script (Already Exists)
**Location:** [`backend/scripts/send-law-firm-invitations.js`](./send-law-firm-invitations.js)

**Purpose:** Sends professional invitation emails to law firms

## Quick Start

### Step 1: Install Dependencies
```bash
cd backend
npm install axios cheerio
```

### Step 2: Run the Web Scraper
```bash
cd backend/scripts
node scrape-law-firms.js
```

### Step 3: Review Scraped Data
The scraper will create three files with timestamp:
- `law-firms-YYYY-MM-DD.json` - JSON format with all details
- `law-firms-YYYY-MM-DD.txt` - Text format (Name, Email) - **Use this for email script**
- `law-firms-YYYY-MM-DD.csv` - CSV format for spreadsheet analysis

### Step 4: Send Invitation Emails
```bash
cd backend/scripts
node send-law-firm-invitations.js law-firms-YYYY-MM-DD.txt
```

Replace `YYYY-MM-DD` with the actual date from the generated file.

## Detailed Usage

### Web Scraper Features

#### 🔍 Multi-Strategy Scraping
The scraper uses three different strategies to find law firm data:

1. **List Items & Tables** - Extracts data from structured HTML lists and tables
2. **Paragraphs** - Finds email addresses in paragraph content with context
3. **Pattern Matching** - Uses regex patterns to identify firm names and emails

#### 📊 Output Information
For each law firm found, the scraper extracts:
- **Name** - Law firm or company name
- **Email** - Contact email address
- **Location** - Office location (if available)
- **Source** - Which scraping strategy found this entry

#### 🧹 Data Cleaning
- Removes duplicate entries based on email addresses
- Filters out example/placeholder emails
- Cleans firm names (removes numbering, extra spaces)
- Converts emails to lowercase for consistency

### Output Files Explained

#### JSON File (`law-firms-YYYY-MM-DD.json`)
```json
[
  {
    "name": "ABC Law Associates",
    "email": "info@abclaw.com",
    "location": "Mumbai",
    "source": "list_item"
  }
]
```
**Use for:** Data analysis, backup, integration with other tools

#### TXT File (`law-firms-YYYY-MM-DD.txt`)
```
ABC Law Associates, info@abclaw.com
XYZ Legal Partners, contact@xyzlegal.in
```
**Use for:** Direct input to the email invitation script

#### CSV File (`law-firms-YYYY-MM-DD.csv`)
```csv
Name,Email,Location,Source
"ABC Law Associates","info@abclaw.com","Mumbai","list_item"
```
**Use for:** Excel/Google Sheets analysis, tracking, reporting

## Complete Workflow Example

### Scenario: Scrape and Email Top 50 Law Firms

```bash
# 1. Navigate to scripts directory
cd backend/scripts

# 2. Run the scraper
node scrape-law-firms.js

# Output will show:
# ✅ Found 50 unique law firms with email addresses
# 💾 Saved TXT data to: law-firms-2026-05-19.txt

# 3. Review the scraped data (optional but recommended)
cat law-firms-2026-05-19.txt

# 4. Send invitation emails using the scraped data
node send-law-firm-invitations.js law-firms-2026-05-19.txt

# 5. Confirm when prompted
# Do you want to proceed with sending 50 emails? (yes/no): yes

# 6. Monitor the campaign
# ✅ Successfully sent: 48
# ❌ Failed: 2
# 📧 Total: 50
```

## Scraper Output Example

```
╔════════════════════════════════════════════════════════════════╗
║     LegalIQ - Top 50 Corporate Law Firms Web Scraper          ║
╚════════════════════════════════════════════════════════════════╝

🔍 Starting web scraper for top 50 corporate law firms...

📍 Target URL: https://neetishastra.com/email-ids-office-locations-of-top-50-corporate-law-firms-for-lawyers-and-law-students-legal-jobs-internships-2026/

📥 Fetching webpage...
✅ Webpage fetched successfully

🔍 Parsing HTML content...

✅ Scraping completed!

📊 Found 50 unique law firms with email addresses

📋 Scraped Law Firms:

================================================================================
1. Khaitan & Co
   📧 Email: info@khaitanco.com
   📍 Location: Mumbai
   🔍 Source: list_item
--------------------------------------------------------------------------------
2. AZB & Partners
   📧 Email: contact@azbpartners.com
   📍 Location: Delhi
   🔍 Source: list_item
--------------------------------------------------------------------------------
...

💾 Saved JSON data to: law-firms-2026-05-19.json
💾 Saved TXT data to: law-firms-2026-05-19.txt
💾 Saved CSV data to: law-firms-2026-05-19.csv

✅ All files saved successfully!

================================================================================
📬 NEXT STEPS - Send Invitation Emails
================================================================================

To send invitation emails to these law firms, run:

   cd backend/scripts
   node send-law-firm-invitations.js law-firms-2026-05-19.txt

This will use the existing email invitation script with the scraped data.

💡 Tip: Review the scraped data before sending emails to ensure accuracy.

✨ Scraping process completed!
```

## Troubleshooting

### Issue: "Cannot find module 'axios'" or "Cannot find module 'cheerio'"

**Solution:**
```bash
cd backend
npm install axios cheerio
```

### Issue: "No law firms found"

**Possible Causes:**
1. Website structure has changed
2. Website is blocking automated requests
3. Network connectivity issues

**Solutions:**
1. Check if the URL is accessible in your browser
2. Try running the script again (temporary network issue)
3. Use manual data entry as fallback:
   ```bash
   # Create a text file manually
   nano law-firms-manual.txt
   
   # Add entries in format: Name, email@example.com
   # Then use with email script
   node send-law-firm-invitations.js law-firms-manual.txt
   ```

### Issue: "Request timed out"

**Solution:**
```bash
# The website might be slow. The script has a 30-second timeout.
# Try again after a few minutes
node scrape-law-firms.js
```

### Issue: Scraped data looks incorrect

**Solution:**
1. Open the JSON file to review all extracted data
2. Open the CSV file in Excel/Google Sheets for easier review
3. Manually edit the TXT file to correct any errors before sending emails

## Best Practices

### 1. Review Before Sending
Always review the scraped data before sending emails:
```bash
# View the text file
cat law-firms-2026-05-19.txt

# Or open in a text editor
nano law-firms-2026-05-19.txt
```

### 2. Test with Small Batch First
```bash
# Create a test file with 2-3 entries
head -n 3 law-firms-2026-05-19.txt > law-firms-test.txt

# Send to test batch
node send-law-firm-invitations.js law-firms-test.txt
```

### 3. Keep Records
- Save all generated files for future reference
- Track which firms received emails
- Monitor responses and registrations

### 4. Respect Rate Limits
The email script includes a 2-second delay between emails. Don't modify this to avoid:
- Gmail rate limiting
- Being marked as spam
- Email delivery issues

### 5. Verify Email Credentials
Before running the email script, ensure your `.env` file has:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Advanced Usage

### Scrape and Filter by Location
```bash
# Scrape all firms
node scrape-law-firms.js

# Filter by location using grep
grep -i "mumbai" law-firms-2026-05-19.csv > mumbai-firms.txt

# Send to Mumbai firms only
node send-law-firm-invitations.js mumbai-firms.txt
```

### Combine Multiple Sources
```bash
# Scrape from website
node scrape-law-firms.js

# Combine with manual entries
cat law-firms-2026-05-19.txt manual-firms.txt > combined-firms.txt

# Remove duplicates
sort combined-firms.txt | uniq > final-firms.txt

# Send emails
node send-law-firm-invitations.js final-firms.txt
```

### Schedule Regular Scraping
```bash
# Create a cron job to scrape weekly
# Edit crontab
crontab -e

# Add line (runs every Monday at 9 AM)
0 9 * * 1 cd /path/to/backend/scripts && node scrape-law-firms.js
```

## Integration with Existing Email Script

The scraper is designed to work seamlessly with [`send-law-firm-invitations.js`](./send-law-firm-invitations.js):

1. **Compatible Format** - TXT output matches the expected format
2. **Automatic Parsing** - Email script reads the TXT file automatically
3. **Name Extraction** - Firm names are used for email personalization
4. **No Manual Intervention** - Direct pipeline from scraping to emailing

## Monitoring Campaign Success

### Check Admin BCC
All emails are BCC'd to `yogmca@gmail.com`:
```bash
# Check your admin inbox for:
# - Confirmation that emails were sent
# - Actual email content received
# - Any bounce-back messages
```

### Track Registrations
Monitor your LegalIQ platform for new registrations from these firms:
```bash
# Check database for new lawyer registrations
cd backend/scripts
node check-lawyer-registrations.js
```

### Follow-up Strategy
1. **Day 1:** Send initial invitation emails
2. **Day 3:** Check open rates (if read receipts enabled)
3. **Day 7:** Send follow-up to non-responders
4. **Day 14:** Final follow-up with special offer

## Data Privacy & Ethics

### Responsible Scraping
- The scraper respects website structure
- Uses appropriate User-Agent headers
- Includes timeout to avoid overwhelming servers
- Only scrapes publicly available information

### Email Best Practices
- All emails include unsubscribe option
- Emails are personalized with firm names
- Clear value proposition provided
- Professional tone maintained

### GDPR Compliance
- Only use publicly available contact information
- Provide clear opt-out mechanism
- Store data securely
- Delete data upon request

## Support & Maintenance

### Script Maintenance
If the website structure changes:
1. Update the scraping strategies in [`scrape-law-firms.js`](./scrape-law-firms.js)
2. Test with small samples first
3. Verify data quality before bulk emailing

### Getting Help
- **Email Issues:** Check [`LAW_FIRM_INVITATION_GUIDE.md`](./LAW_FIRM_INVITATION_GUIDE.md)
- **Scraper Issues:** Review error messages in console output
- **Technical Support:** Contact yogmca@gmail.com

## Summary

### Complete Command Sequence
```bash
# 1. Install dependencies (one-time)
cd backend && npm install axios cheerio

# 2. Scrape law firms
cd backend/scripts
node scrape-law-firms.js

# 3. Review data (recommended)
cat law-firms-YYYY-MM-DD.txt

# 4. Send invitation emails
node send-law-firm-invitations.js law-firms-YYYY-MM-DD.txt

# 5. Monitor results
# Check yogmca@gmail.com for BCC copies
# Track responses and registrations
```

### Key Files Generated
- `law-firms-YYYY-MM-DD.json` - Full data with metadata
- `law-firms-YYYY-MM-DD.txt` - Email script input format ⭐
- `law-firms-YYYY-MM-DD.csv` - Spreadsheet analysis

### Success Metrics
- ✅ Number of firms scraped
- ✅ Number of emails sent successfully
- ✅ Email open rates (if available)
- ✅ Number of registrations from campaign
- ✅ Response rate to invitations

---

**Last Updated:** May 19, 2026  
**Script Version:** 1.0  
**Target:** Top 50 Corporate Law Firms from Neetishastra  
**Integration:** Works with existing [`send-law-firm-invitations.js`](./send-law-firm-invitations.js)
