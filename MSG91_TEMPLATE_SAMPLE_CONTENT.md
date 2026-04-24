# MSG91 WhatsApp Template - Correct Sample Content

## The Issue
MSG91 requires you to provide **sample content** with actual example values, NOT variable placeholders. The sample helps MSG91/WhatsApp understand what your message will look like.

## ✅ CORRECT Way to Create Template

### Template Name
```
consultation_booked_client
```

### Category
```
UTILITY
```

### Language
```
English (en)
```

### Header (Optional)
**Type:** TEXT

**Content:**
```
Consultation Booked Successfully!
```

**Sample (if required):**
```
Consultation Booked Successfully!
```

---

### Body (Required)
**Content with Variables:**
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

**Sample Content (MANDATORY - Enter this in the "Sample" field):**
```
Hi Yogesh Singh,

Your consultation has been booked:
Professional: Sreeram Singh
Case Type: Criminal Law
Date: Saturday 25 April 2026
Time: 11:00 AM

Status: Pending Confirmation
You will be notified once the professional confirms.
```

**Variable Examples (if MSG91 asks for individual samples):**
- Variable {{1}} Sample: `Yogesh Singh`
- Variable {{2}} Sample: `Sreeram Singh`
- Variable {{3}} Sample: `Criminal Law`
- Variable {{4}} Sample: `Saturday 25 April 2026`
- Variable {{5}} Sample: `11:00 AM`

---

### Footer (Optional)
**Content:**
```
LegalIQ - Your Legal Partner
```

**Sample:**
```
LegalIQ - Your Legal Partner
```

---

### Buttons (Optional)
**Button 1:**
- Type: QUICK_REPLY
- Text: `View Details`

**Button 2:**
- Type: QUICK_REPLY
- Text: `Contact Support`

---

## Complete Template Preview

When approved, your template will send messages like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Consultation Booked Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi Yogesh Singh,

Your consultation has been booked:
Professional: Sreeram Singh
Case Type: Criminal Law
Date: Saturday 25 April 2026
Time: 11:00 AM

Status: Pending Confirmation
You will be notified once the professional confirms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LegalIQ - Your Legal Partner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[View Details]  [Contact Support]
```

---

## All Templates You Need to Create

### 1. consultation_booked_client ✅ (Main one you're working on)

**Body:**
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

**Sample:**
```
Hi Yogesh Singh,

Your consultation has been booked:
Professional: Sreeram Singh
Case Type: Criminal Law
Date: Saturday 25 April 2026
Time: 11:00 AM

Status: Pending Confirmation
You will be notified once the professional confirms.
```

---

### 2. consultation_booked_professional

**Body:**
```
Hi {{1}},

New consultation request:
Client: {{2}}
Type: {{3}}
Case: {{4}}
Date: {{5}}
Time: {{6}}

Please review and confirm the appointment.
```

**Sample:**
```
Hi Sreeram Singh,

New consultation request:
Client: Yogesh Singh
Type: In-Person
Case: Criminal Law
Date: Saturday 25 April 2026
Time: 11:00 AM

Please review and confirm the appointment.
```

---

### 3. appointment_accepted_client

**Body:**
```
Hi {{1}},

Great news! Your {{3}} consultation with {{2}} has been confirmed.

Date: {{4}}
Time: {{5}}

We look forward to serving you.
```

**Sample:**
```
Hi Yogesh Singh,

Great news! Your In-Person consultation with Sreeram Singh has been confirmed.

Date: Saturday 25 April 2026
Time: 11:00 AM

We look forward to serving you.
```

---

### 4. appointment_cancelled_client

**Body:**
```
Hi {{1}},

Your {{3}} consultation with {{2}} scheduled for {{4}} at {{5}} has been cancelled.

Reason: {{6}}

You can book another consultation anytime.
```

**Sample:**
```
Hi Yogesh Singh,

Your In-Person consultation with Sreeram Singh scheduled for Saturday 25 April 2026 at 11:00 AM has been cancelled.

Reason: Schedule conflict

You can book another consultation anytime.
```

---

### 5. video_consultation_booked_client

**Body:**
```
Hi {{1}},

Your video consultation has been booked:
Professional: {{2}}
Date: {{3}}
Time: {{4}}
Fee: {{5}}

You will receive the video call link once confirmed.
```

**Sample:**
```
Hi Yogesh Singh,

Your video consultation has been booked:
Professional: Sreeram Singh
Date: Saturday 25 April 2026
Time: 11:00 AM
Fee: ₹500

You will receive the video call link once confirmed.
```

---

### 6. welcome_user

**Body:**
```
Welcome to LegalIQ, {{1}}!

Thank you for registering. You can now:
• Search for legal professionals
• Book consultations
• Get legal advice

We're here to help with all your legal needs.
```

**Sample:**
```
Welcome to LegalIQ, Yogesh Singh!

Thank you for registering. You can now:
• Search for legal professionals
• Book consultations
• Get legal advice

We're here to help with all your legal needs.
```

---

### 7. welcome_professional

**Body:**
```
Welcome to LegalIQ, {{1}}!

Your {{2}} profile has been created successfully.

You can now:
• Manage your profile
• Accept consultations
• Connect with clients

Thank you for joining our platform.
```

**Sample:**
```
Welcome to LegalIQ, Sreeram Singh!

Your Lawyer/Advocate profile has been created successfully.

You can now:
• Manage your profile
• Accept consultations
• Connect with clients

Thank you for joining our platform.
```

---

## Important MSG91 Template Rules

### ✅ DO:
1. **Always provide sample content** with realistic example values
2. Use **actual names, dates, and values** in samples (not placeholders)
3. Keep samples **realistic and professional**
4. Use **UTILITY** category for transactional messages
5. Make sure sample matches the variable structure exactly

### ❌ DON'T:
1. ❌ Use variable placeholders in samples: `{{1}}`, `{{2}}`
2. ❌ Use real customer data in samples
3. ❌ Use promotional language in UTILITY templates
4. ❌ Include URLs without proper button configuration
5. ❌ Leave sample field empty

---

## Step-by-Step Template Creation

### Step 1: Login to MSG91
1. Go to https://msg91.com
2. Login to your account
3. Click on **WhatsApp** in the left menu

### Step 2: Create New Template
1. Click **"Create Template"** or **"Add Template"**
2. Select **WhatsApp** as the channel

### Step 3: Fill Template Details
1. **Template Name:** `consultation_booked_client`
2. **Category:** `UTILITY`
3. **Language:** `English (en)`

### Step 4: Add Header (Optional)
1. Select **TEXT** type
2. Enter: `Consultation Booked Successfully!`

### Step 5: Add Body (Required)
1. Enter the body content with variables:
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

2. **In the "Sample Content" field**, enter:
   ```
   Hi Yogesh Singh,

   Your consultation has been booked:
   Professional: Sreeram Singh
   Case Type: Criminal Law
   Date: Saturday 25 April 2026
   Time: 11:00 AM

   Status: Pending Confirmation
   You will be notified once the professional confirms.
   ```

### Step 6: Add Footer (Optional)
1. Enter: `LegalIQ - Your Legal Partner`

### Step 7: Add Buttons (Optional)
1. **Button 1:** Quick Reply - `View Details`
2. **Button 2:** Quick Reply - `Contact Support`

### Step 8: Submit for Approval
1. Review all details
2. Click **Submit** or **Create**
3. Wait for WhatsApp/Meta approval (1-24 hours)

---

## Troubleshooting

### Issue: "Sample is mandatory" error
**Solution:** Make sure you filled the "Sample Content" field with actual example values, not variable placeholders.

### Issue: Template rejected
**Reasons:**
- Sample content doesn't match template structure
- Using promotional language in UTILITY category
- Variables don't match between template and sample
- Missing required sample content

**Solution:** Review WhatsApp's template guidelines and resubmit with corrections.

### Issue: Variables showing as numbers
**Solution:** This was your original issue - it happens when the template is incorrectly configured. Follow this guide exactly to avoid it.

---

## Backend Code (No Changes Needed)

Your backend code in [`whatsappService.js`](backend/services/whatsappService.js:385-393) is already correct:

```javascript
return this.sendWhatsAppMessage(clientPhone, 'consultation_booked_client', {
  body: [
    clientName || 'Client',           // {{1}}
    lawyerName || 'Professional',     // {{2}}
    caseType || 'General',            // {{3}}
    formattedDate,                    // {{4}}
    preferredTime || 'TBD'            // {{5}}
  ]
});
```

The code sends an array of values that will replace {{1}}, {{2}}, {{3}}, {{4}}, {{5}} in order.

---

## Quick Reference: Sample Values

Use these sample values when creating templates:

| Variable | Sample Value |
|----------|-------------|
| Client Name | Yogesh Singh |
| Professional Name | Sreeram Singh |
| Case Type | Criminal Law |
| Date | Saturday 25 April 2026 |
| Time | 11:00 AM |
| Consultation Type | In-Person / Video |
| Fee | ₹500 |
| Status | Pending Confirmation |
| Reason | Schedule conflict |

---

## After Template Approval

Once your template is approved by WhatsApp/Meta:

1. ✅ Template will appear as "APPROVED" in MSG91 dashboard
2. ✅ You can start sending messages using this template
3. ✅ Your backend code will work automatically
4. ✅ Messages will be delivered to users' WhatsApp

**No code changes needed** - just create the template correctly in MSG91!
