# Fix MSG91 WhatsApp Template Variable Type Issue

## Problem
Your WhatsApp template is showing garbled output like:
```
Hi {{1}}=Yogesh Singh, {{1}}=Yogesh Singh, {{2}}=Sreeram Singh...
```

This happens because the template variables are set to type **"number"** instead of **"text"**.

## Solution: Change Variable Type to "text"

### Step 1: Login to MSG91 Dashboard
1. Go to https://msg91.com
2. Login to your account
3. Navigate to **WhatsApp** section

### Step 2: Edit Your Template
1. Find your template: **"consultation_booked_client"**
2. Click **Edit** or **View Details**
3. Look for the **Variables** section

### Step 3: Change Variable Type
For each variable ({{1}}, {{2}}, {{3}}, {{4}}, {{5}}):
1. Find the **"Variable Type"** or **"Type"** dropdown
2. Change from **"number"** to **"text"**
3. Save the changes

### Step 4: Resubmit for Approval (if needed)
- If the template was already approved, you may need to resubmit it
- WhatsApp/Meta will need to re-approve the template with the new variable types
- This usually takes 1-24 hours

## Correct Template Configuration

### Template Name
`consultation_booked_client`

### Template Category
`UTILITY` or `ACCOUNT_UPDATE`

### Template Language
`English (en)`

### Template Header (Optional)
```
Consultation Booked Successfully!
```
**Type:** TEXT (no variables needed in header)

### Template Body
```
Hi {{1}},

Your consultation has been booked:
Professional: {{2}}
Case Type: {{3}}
Date: {{4}}
Time: {{5}}

Status: Pending Confirmation
You will be notified once the professional confirms.
```

**Variables:**
- {{1}} - Type: **text** - Example: "Yogesh Singh" (Client Name)
- {{2}} - Type: **text** - Example: "Sreeram Singh" (Lawyer Name)
- {{3}} - Type: **text** - Example: "Criminal Law" (Case Type)
- {{4}} - Type: **text** - Example: "Saturday 25 April 2026" (Date)
- {{5}} - Type: **text** - Example: "11:00 AM" (Time)

### Template Footer (Optional)
```
LegalIQ - Your Legal Partner
```
**Type:** TEXT (no variables)

### Template Buttons (Optional)
- **Button 1:** Quick Reply - "View Details"
- **Button 2:** Quick Reply - "Contact Support"

## Important Notes

### ✅ DO:
- Use **"text"** type for ALL variables ({{1}}, {{2}}, {{3}}, etc.)
- Use simple, clear variable names in examples
- Keep the template professional and concise
- Follow WhatsApp's template guidelines

### ❌ DON'T:
- Use **"number"** type for name/text variables
- Use complex expressions in template variables
- Include URLs without proper button configuration
- Use promotional language (use UTILITY category)

## Variable Type Reference

| Variable Content | Correct Type | Wrong Type |
|-----------------|--------------|------------|
| Person's name | **text** | ~~number~~ |
| Date string | **text** | ~~number~~ |
| Time string | **text** | ~~number~~ |
| Case type | **text** | ~~number~~ |
| Status | **text** | ~~number~~ |
| Amount (₹500) | **text** | ~~number~~ |
| Phone number | **text** | ~~number~~ |
| Actual number (5) | number | text |

## After Fixing

Once you've changed the variable types to "text" and the template is approved:

1. **Test the template** using MSG91's test feature
2. **Verify** the output looks correct
3. Your backend code will work correctly (no changes needed)

## Backend Code (Already Correct)

Your backend code in [`whatsappService.js`](backend/services/whatsappService.js:385-393) is already sending the correct data:

```javascript
return this.sendWhatsAppMessage(clientPhone, 'consultation_booked_client', {
  body: [
    clientName || 'Client',           // {{1}} - text
    lawyerName || 'Professional',     // {{2}} - text
    caseType || 'General',            // {{3}} - text
    formattedDate,                    // {{4}} - text
    preferredTime || 'TBD'            // {{5}} - text
  ]
});
```

## Expected Output After Fix

```
Consultation Booked Successfully!

Hi Yogesh Singh,

Your consultation has been booked:
Professional: Sreeram Singh
Case Type: Criminal Law
Date: Saturday 25 April 2026
Time: 11:00 AM

Status: Pending Confirmation
You will be notified once the professional confirms.

LegalIQ - Your Legal Partner
```

## Need Help?

If you're still seeing issues after changing to "text" type:
1. Check MSG91 logs for the actual payload sent
2. Verify template approval status
3. Test with MSG91's template testing tool
4. Contact MSG91 support if the issue persists

## Quick Checklist

- [ ] Login to MSG91 dashboard
- [ ] Navigate to WhatsApp templates
- [ ] Find "consultation_booked_client" template
- [ ] Edit template variables
- [ ] Change ALL variable types from "number" to "text"
- [ ] Save changes
- [ ] Resubmit for approval (if needed)
- [ ] Wait for approval
- [ ] Test the template
- [ ] Verify output is correct

---

**Remember:** The variable **type** in MSG91 must be **"text"** for string values like names, dates, and descriptions. Only use "number" type for actual numeric values (like counts: 1, 2, 3).
