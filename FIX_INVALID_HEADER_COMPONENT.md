# 🔧 Fix: Invalid Header Component Error

## 🚨 The Problem

You're getting this error:
```
Failure Reason: Invalid Header Component in request payload, 
Please check Code{JSON} in Template section for Valid Example.
```

## 🎯 Root Cause

Your MSG91 template `consultation_booked_professional` has a **HEADER component with a variable** (likely an image or dynamic text), but your code is NOT sending the header value.

## ✅ Solution Options

### Option 1: Remove Header from Template (Recommended)

If you don't need a dynamic header (image/variable text), edit your template in MSG91:

1. Login to MSG91 dashboard: https://msg91.com
2. Go to **WhatsApp** → **Templates**
3. Find `consultation_booked_professional`
4. Click **Edit** or **Delete and Recreate**
5. **Remove the HEADER component** or make it static text only
6. Keep only BODY and FOOTER
7. Save and resubmit for approval

**Template Structure (Without Header Variable):**
```
HEADER: New Consultation Request! (static text, no variables)
BODY: Hi {{1}}, You have a new {{3}} consultation... (6 variables)
FOOTER: LegalIQ - Your Legal Partner (static text)
```

### Option 2: Add Header Value in Code

If your template REQUIRES a header variable, update the code to send it:

**Edit [`whatsappService.js`](backend/services/whatsappService.js:403):**

```javascript
async sendConsultationBookedToProfessional(consultationData) {
  console.log('📱 WhatsApp: sendConsultationBookedToProfessional called');
  const { professionalPhone, clientName, lawyerName, caseType, preferredDate, preferredTime, consultationType } = consultationData;
  if (!professionalPhone) {
    console.warn('⚠️ WhatsApp: No professional phone number provided');
    return { success: false, reason: 'no_professional_phone' };
  }

  const formattedDate = this._formatDate(preferredDate);
  const type = consultationType === 'video' ? 'Video' : 'In-Person';

  return this.sendWhatsAppMessage(professionalPhone, 'consultation_booked_professional', {
    header: ['New Consultation Request!'], // ADD THIS LINE if header has variable
    body: [
      lawyerName || 'Professional',
      clientName || 'Client',
      type,
      caseType || 'General',
      formattedDate,
      preferredTime || 'TBD'
    ]
  });
}
```

### Option 3: Check Template Type in MSG91

Your template might have:

**Type A: Header with IMAGE variable**
```json
{
  "components": {
    "header_1": "https://example.com/image.jpg",
    "body_1": "Sreeram Singh",
    "body_2": "Yogesh Singh",
    ...
  }
}
```

**Type B: Header with TEXT variable**
```json
{
  "components": {
    "header_1": "New Consultation Request!",
    "body_1": "Sreeram Singh",
    ...
  }
}
```

**Type C: Header with NO variables (static text)**
```json
{
  "components": {
    "body_1": "Sreeram Singh",
    "body_2": "Yogesh Singh",
    ...
  }
}
```

## 🧪 How to Identify Your Template Type

### Method 1: Check MSG91 Dashboard

1. Login to MSG91: https://msg91.com
2. Go to **WhatsApp** → **Templates**
3. Find `consultation_booked_professional`
4. Look at the **HEADER** section:
   - If it says "TEXT" with `{{1}}` → You need to send `header_1`
   - If it says "IMAGE" with `{{1}}` → You need to send image URL as `header_1`
   - If it's just text with no `{{}}` → Don't send header at all

### Method 2: Check the Sample JSON in MSG91

MSG91 shows example JSON for each template. Look for:

```json
// If you see this - template HAS header variable:
{
  "components": {
    "header_1": "example value",  ← HEADER VARIABLE EXISTS
    "body_1": "...",
    "body_2": "..."
  }
}

// If you see this - template has NO header variable:
{
  "components": {
    "body_1": "...",  ← NO HEADER KEYS
    "body_2": "..."
  }
}
```

## 🎯 Quick Fix Steps

### Step 1: Determine Template Structure

Go to MSG91 dashboard and check if your template has:
- [ ] HEADER with variable ({{1}})
- [ ] HEADER with static text only
- [ ] No HEADER at all

### Step 2: Apply the Fix

**If HEADER has variable:**
```javascript
// In whatsappService.js, line 414
return this.sendWhatsAppMessage(professionalPhone, 'consultation_booked_professional', {
  header: ['Your Header Text Here'], // or image URL
  body: [lawyerName, clientName, type, caseType, formattedDate, preferredTime]
});
```

**If HEADER is static text (no variable):**
```javascript
// Current code is correct - don't include header
return this.sendWhatsAppMessage(professionalPhone, 'consultation_booked_professional', {
  body: [lawyerName, clientName, type, caseType, formattedDate, preferredTime]
});
```

### Step 3: Test Again

```bash
cd backend && node scripts/diagnose-whatsapp-issue.js
```

## 📋 Template Recommendation

For simplicity, I recommend this template structure:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADER (Static Text - No Variables):
New Consultation Request!

BODY (6 Variables):
Hi {{1}},

You have a new {{3}} consultation request:
Client: {{2}}
Case Type: {{4}}
Date: {{5}}
Time: {{6}}

Please log in to accept or reschedule.

FOOTER (Static Text):
LegalIQ - Your Legal Partner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Why this works:**
- ✅ No header variables = no header component needed in API
- ✅ 6 body variables = matches your code exactly
- ✅ Static footer = no footer component needed
- ✅ Simple and reliable

## 🚀 Next Steps

1. **Check your MSG91 template** - Does it have a header variable?
2. **Choose a solution** - Remove header variable OR add it to code
3. **Test again** - Run the diagnostic script
4. **Verify delivery** - Check WhatsApp for the message

## 💡 Pro Tip

The easiest solution is to **recreate the template without any header variables**. This way:
- No header component needed in API payload
- Simpler code
- Fewer potential errors
- Faster approval from WhatsApp

---

**Need Help?**
Share a screenshot of your template from MSG91 dashboard showing the HEADER section, and I can provide exact code to fix it.
