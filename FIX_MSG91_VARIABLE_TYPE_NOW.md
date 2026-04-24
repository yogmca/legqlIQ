# 🚨 URGENT FIX: Change MSG91 Variable Type from "Number" to "text"

## ❌ THE PROBLEM

Your MSG91 template has:
```
Variable Type: Number  ❌ WRONG!
```

This is why messages aren't being delivered!

---

## ✅ THE SOLUTION

Change to:
```
Variable Type: text  ✅ CORRECT!
```

---

## 📋 STEP-BY-STEP FIX

### Step 1: Login to MSG91
1. Go to https://msg91.com
2. Login to your account

### Step 2: Navigate to Templates
1. Click **WhatsApp** in the left sidebar
2. Click **Templates**

### Step 3: Edit Your Template
1. Find template: **`consultation_booked_professional`**
2. Click **Edit** or **View Details** or the **⋮** menu

### Step 4: Change Variable Type
Look for a section that says:
```
Variable Type
Number  ← Click this dropdown
```

Change it to:
```
Variable Type
text  ← Select this option
```

### Step 5: Save Changes
1. Click **Save** or **Update**
2. If prompted, click **Resubmit for Approval**
3. Wait for WhatsApp/Meta to approve (usually 1-24 hours)

---

## 🔍 WHY THIS IS THE ISSUE

### What Your Code Sends (All TEXT):
```javascript
[
  "Sreeram Singh",           // {{1}} - TEXT (name)
  "Yogesh Singh",            // {{2}} - TEXT (name)
  "In-Person",               // {{3}} - TEXT (consultation type)
  "Criminal Law",            // {{4}} - TEXT (case type)
  "Sunday, 26 April 2026",   // {{5}} - TEXT (date)
  "12:00 PM"                 // {{6}} - TEXT (time)
]
```

### What MSG91 Expects When Variable Type = "Number":
```javascript
[
  123,    // {{1}} - NUMBER
  456,    // {{2}} - NUMBER
  789,    // {{3}} - NUMBER
  // etc.
]
```

### The Mismatch:
- **You're sending:** Text strings like "Sreeram Singh"
- **MSG91 expects:** Numbers like 123
- **Result:** MSG91 rejects the message ❌

---

## ✅ CORRECT CONFIGURATION

### For ALL Your Templates:

| Variable | Content | Correct Type |
|----------|---------|--------------|
| {{1}} | Person's name (Sreeram Singh) | **text** |
| {{2}} | Person's name (Yogesh Singh) | **text** |
| {{3}} | Consultation type (In-Person) | **text** |
| {{4}} | Case type (Criminal Law) | **text** |
| {{5}} | Date (Sunday, 26 April 2026) | **text** |
| {{6}} | Time (12:00 PM) | **text** |

### When to Use "Number" Type:
Only use "Number" type for actual numeric values like:
- Quantity: 5 items
- Count: 3 appointments
- Amount: 500 (without currency symbol)

**For everything else (names, dates, text), use "text"!**

---

## 🎯 AFTER YOU FIX IT

### 1. Wait for Approval
- Template status will change to "PENDING"
- WhatsApp/Meta will review it
- Usually takes 1-24 hours
- Status will change to "APPROVED"

### 2. Test Again
Once approved, run the test script:
```bash
node backend/scripts/test-whatsapp-template.js
```

### 3. Check Your WhatsApp
You should receive the test message on your phone (916361793003)

---

## 📱 WHAT YOU SHOULD SEE IN MSG91

### ❌ WRONG (Current):
```
Template: consultation_booked_professional
Variable Type: Number  ← This is wrong!
Status: APPROVED
```

### ✅ CORRECT (After Fix):
```
Template: consultation_booked_professional
Variable Type: text  ← This is correct!
Status: PENDING → APPROVED (after review)
```

---

## 🔄 IF YOU HAVE MULTIPLE TEMPLATES

Check ALL your templates and make sure:
- [ ] `consultation_booked_client` - Variable Type: **text**
- [ ] `consultation_booked_professional` - Variable Type: **text**
- [ ] `appointment_accepted_client` - Variable Type: **text**
- [ ] `appointment_cancelled_client` - Variable Type: **text**
- [ ] Any other templates - Variable Type: **text**

---

## 💡 QUICK CHECK

In MSG91 dashboard, your template configuration should look like this:

```
Template Name: consultation_booked_professional
Category: UTILITY
Language: en
Variable Type: text  ← MUST BE "text"

Body:
New Consultation Request!

Hi {{1}},

You have a new {{3}} consultation request:
Client: {{2}}
Case Type: {{4}}
Date: {{5}}
Time: {{6}}

Please log in to accept or reschedule.

Footer: LegalIQ - Your Legal Partner
```

---

## 🚀 NEXT STEPS

1. **Right now:** Change Variable Type to "text" in MSG91
2. **Wait:** For WhatsApp/Meta approval (1-24 hours)
3. **Test:** Run the test script again
4. **Verify:** Check your WhatsApp for the message
5. **Celebrate:** 🎉 WhatsApp integration working!

---

## ❓ STILL NOT WORKING?

If you change to "text" and it still doesn't work:

1. **Check template status:** Must be "APPROVED"
2. **Check phone number:** Must have WhatsApp installed
3. **Check MSG91 logs:** Dashboard → WhatsApp → Logs
4. **Check backend logs:** Look for error messages
5. **Run test script:** See exact error from MSG91

---

## 📞 SUMMARY

**Problem:** Variable Type set to "Number"  
**Solution:** Change to "text"  
**Why:** You're sending text strings, not numbers  
**When:** Do it now in MSG91 dashboard  
**Result:** Messages will be delivered ✅

---

**This is the ONLY thing preventing your WhatsApp integration from working!**
