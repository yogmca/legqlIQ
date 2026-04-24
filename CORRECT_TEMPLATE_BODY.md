# ✅ CORRECT Template Body for MSG91

## 🚨 THE PROBLEM

Your current template body has variables in the wrong positions:

### ❌ WRONG (What you have now):
```
New Consultation Request!

Hi {{1}},

You have a new {{3}} consultation request:
Client: {{2}}
Case Type: {{4}}
Date: {{5}}
Time: {{6}}
```

This produces:
```
Hi Sreeram Singh,
You have a new Yogesh Singh consultation request:  ← WRONG!
Client: In-Person                                   ← WRONG!
```

---

## ✅ CORRECT Template Body

### What Your Code Sends (in order):
```javascript
[
  lawyerName,        // {{1}} - "Sreeram Singh"
  clientName,        // {{2}} - "Yogesh Singh"
  type,              // {{3}} - "In-Person"
  caseType,          // {{4}} - "Criminal Law"
  formattedDate,     // {{5}} - "Sunday, 26 April 2026"
  preferredTime      // {{6}} - "12:00 PM"
]
```

### Correct Template Body:
```
New Consultation Request!

Hi {{1}},

You have a new {{3}} consultation request:
Client: {{2}}
Case Type: {{4}}
Date: {{5}}
Time: {{6}}

Please log in to accept or reschedule.
```

### Correct Sample Content:
```
New Consultation Request!

Hi Sreeram Singh,

You have a new In-Person consultation request:
Client: Yogesh Singh
Case Type: Criminal Law
Date: Sunday, 26 April 2026
Time: 12:00 PM

Please log in to accept or reschedule.
```

---

## 📋 STEP-BY-STEP FIX

### Step 1: Edit Your Template in MSG91
1. Login to MSG91 dashboard
2. Go to WhatsApp → Templates
3. Find `consultation_booked_professional`
4. Click **Edit**

### Step 2: Fix the Body

**Replace the current body with this EXACT text:**

```
New Consultation Request!

Hi {{1}},

You have a new {{3}} consultation request:
Client: {{2}}
Case Type: {{4}}
Date: {{5}}
Time: {{6}}

Please log in to accept or reschedule.
```

### Step 3: Fix the Sample Content

**Replace the sample with this EXACT text:**

```
New Consultation Request!

Hi Sreeram Singh,

You have a new In-Person consultation request:
Client: Yogesh Singh
Case Type: Criminal Law
Date: Sunday, 26 April 2026
Time: 12:00 PM

Please log in to accept or reschedule.
```

### Step 4: Verify Variable Mapping

Make sure each variable shows:

| Variable | Type | Sample Value |
|----------|------|--------------|
| {{1}} | text | Sreeram Singh |
| {{2}} | text | Yogesh Singh |
| {{3}} | text | In-Person |
| {{4}} | text | Criminal Law |
| {{5}} | text | Sunday, 26 April 2026 |
| {{6}} | text | 12:00 PM |

### Step 5: Save and Resubmit
1. Click **Save**
2. Click **Submit for Approval**
3. Wait for WhatsApp/Meta approval (1-24 hours)

---

## 🎯 EXPECTED OUTPUT

After fixing, your WhatsApp message should look like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New Consultation Request!

Hi Sreeram Singh,

You have a new In-Person consultation request:
Client: Yogesh Singh
Case Type: Criminal Law
Date: Sunday, 26 April 2026
Time: 12:00 PM

Please log in to accept or reschedule.

LegalIQ - Your Legal Partner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Variable Order Reference

### For Template: consultation_booked_professional

**Code sends (from [`whatsappService.js`](backend/services/whatsappService.js:407-415)):**
```javascript
body: [
  lawyerName,        // Position 1 → {{1}}
  clientName,        // Position 2 → {{2}}
  type,              // Position 3 → {{3}}
  caseType,          // Position 4 → {{4}}
  formattedDate,     // Position 5 → {{5}}
  preferredTime      // Position 6 → {{6}}
]
```

**Template must use:**
```
{{1}} = Professional/Lawyer Name (Sreeram Singh)
{{2}} = Client Name (Yogesh Singh)
{{3}} = Consultation Type (In-Person / Video)
{{4}} = Case Type (Criminal Law)
{{5}} = Date (Sunday, 26 April 2026)
{{6}} = Time (12:00 PM)
```

---

## ✅ CHECKLIST

Before resubmitting:

- [ ] Template body uses {{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}} in correct positions
- [ ] {{1}} is used for professional name (Hi {{1}})
- [ ] {{2}} is used for client name (Client: {{2}})
- [ ] {{3}} is used for consultation type (new {{3}} consultation)
- [ ] {{4}} is used for case type (Case Type: {{4}})
- [ ] {{5}} is used for date (Date: {{5}})
- [ ] {{6}} is used for time (Time: {{6}})
- [ ] Sample content matches the template structure exactly
- [ ] All variable types are set to "text"
- [ ] Sample values are realistic (not placeholders)

---

## 🧪 TEST AFTER APPROVAL

Once approved, run:
```bash
node backend/scripts/test-whatsapp-template.js
```

Expected output:
```
✅ SUCCESS! MSG91 Response:
{
  "status": "success",
  "hasError": false
}

✅ Check your WhatsApp for the test message.
```

Then check your WhatsApp - you should see the message with correct values in correct positions!

---

## 🎯 SUMMARY

**Problem:** Variables in template body don't match the order your code sends them

**Solution:** Update template body to use {{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}} in the correct positions as shown above

**Result:** Messages will display correctly with proper values in proper places
