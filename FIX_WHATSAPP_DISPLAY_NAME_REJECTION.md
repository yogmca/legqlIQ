# Fix WhatsApp Business Display Name Rejection

## Problem
Meta is rejecting "Legaliq India" and "LegalIQ" as WhatsApp Business Account display names with the error:
> "This WhatsApp business account can't use Legaliq India as its display name, because it violates WhatsApp's Display Name Guidelines."

---

## Why This Happens

WhatsApp has strict Display Name Guidelines to prevent:
1. **Generic/Descriptive Terms** - Names that are too generic (e.g., "Legal Services India")
2. **Geographic Identifiers** - Country/region names without proper branding (e.g., "India", "Mumbai")
3. **Trademark Issues** - Names similar to existing trademarks
4. **Misleading Names** - Names that could confuse users
5. **Special Characters** - Excessive use of symbols, emojis, or special characters
6. **All Caps** - Names in ALL CAPS (except acronyms)

---

## WhatsApp Display Name Guidelines

### ✅ ALLOWED
- **Registered business names** with proper documentation
- **Brand names** that are unique and identifiable
- **Descriptive suffixes** (e.g., "LegalIQ Platform", "LegalIQ Services")
- **Proper capitalization** (e.g., "LegalIQ", not "LEGALIQ")
- **Short, clear names** (under 25 characters recommended)

### ❌ NOT ALLOWED
- Generic terms alone (e.g., "Legal Services", "Law Firm")
- Country/region names without branding (e.g., "India Legal", "Mumbai Lawyers")
- Misleading names (e.g., "Official Legal India")
- All caps (e.g., "LEGALIQ INDIA")
- Excessive special characters (e.g., "Legal*IQ*India!!!")
- Phone numbers or URLs in the name

---

## Solutions for LegalIQ

### Option 1: Use Brand Name Only (RECOMMENDED)
**Display Name:** `LegalIQ`

**Pros:**
- Clean, professional, and brandable
- No geographic restrictions
- Easy to remember
- Likely to be approved quickly

**Cons:**
- Doesn't specify location

---

### Option 2: Add Descriptive Suffix
**Display Name:** `LegalIQ Platform`

**Alternative:** `LegalIQ Services`

**Pros:**
- Clarifies what the business does
- Still maintains brand identity
- Professional appearance

**Cons:**
- Slightly longer

---

### Option 3: Use Registered Business Name
**Display Name:** `[Your Registered Company Name]`

**Example:** If registered as "LegalIQ Technologies Pvt Ltd", use that

**Pros:**
- Matches official documentation
- Higher approval rate
- Professional credibility

**Cons:**
- May be longer
- Requires business registration documents

---

### Option 4: Add Service Category
**Display Name:** `LegalIQ Legal Tech`

**Alternative:** `LegalIQ Consultancy`

**Pros:**
- Describes the service category
- Maintains brand name
- Professional

**Cons:**
- Longer name

---

## Step-by-Step Fix Process

### Step 1: Choose Your New Display Name

Based on WhatsApp guidelines, I recommend:

**Primary Recommendation:** `LegalIQ`

**Backup Options:**
1. `LegalIQ Platform`
2. `LegalIQ Services`
3. `LegalIQ Legal Tech`

### Step 2: Update Display Name in MSG91/WhatsApp Business

#### Via MSG91 Dashboard:

1. **Log in to MSG91 Dashboard**
   - Go to [https://msg91.com](https://msg91.com)
   - Navigate to **WhatsApp** section

2. **Access WhatsApp Business Settings**
   - Click on **WhatsApp Business Account**
   - Find **Business Profile** or **Display Name** settings

3. **Update Display Name**
   - Change from: `Legaliq India` or `LegalIQ`
   - Change to: `LegalIQ` (or your chosen alternative)
   - Click **Save** or **Submit for Review**

4. **Wait for Approval**
   - Meta typically reviews within 24-48 hours
   - You'll receive an email notification

#### Via Facebook Business Manager (if you have direct access):

1. **Log in to Facebook Business Manager**
   - Go to [https://business.facebook.com](https://business.facebook.com)

2. **Navigate to WhatsApp Accounts**
   - Click **Business Settings** → **Accounts** → **WhatsApp Accounts**

3. **Edit Business Profile**
   - Select your WhatsApp Business Account
   - Click **Edit Profile**
   - Update **Display Name** field

4. **Submit for Review**
   - Click **Submit** or **Request Review**
   - Wait for Meta approval (24-48 hours)

### Step 3: Verify Business Information

To increase approval chances, ensure these are complete:

1. **Business Description**
   - Clear description of what LegalIQ does
   - Example: "LegalIQ connects clients with verified legal professionals for consultations and legal services."

2. **Business Category**
   - Select: "Professional Services" or "Legal Services"

3. **Business Address**
   - Provide a valid business address

4. **Business Website**
   - Add: `https://legaliq.in` (or your domain)

5. **Business Email**
   - Use a professional email (e.g., `support@legaliq.in`)

### Step 4: Prepare Supporting Documents (if requested)

Meta may request:
- Business registration certificate
- GST registration (for India)
- Trademark certificate (if applicable)
- Business license
- Proof of address

Have these ready as PDFs.

### Step 5: Update Templates (if needed)

After display name approval, your existing WhatsApp templates should work fine. However, if you need to update any template that mentions the business name:

1. Go to MSG91 Dashboard → **WhatsApp** → **Templates**
2. Edit templates that reference the old name
3. Submit for re-approval

---

## Common Rejection Reasons & Fixes

| Rejection Reason | Fix |
|------------------|-----|
| "Contains geographic identifier" | Remove "India" - use just "LegalIQ" |
| "Too generic" | Add brand name before service (e.g., "LegalIQ Platform") |
| "Misleading" | Avoid words like "Official", "Government", "Verified" |
| "All caps" | Use proper capitalization: "LegalIQ" not "LEGALIQ" |
| "Special characters" | Remove emojis, symbols, or excessive punctuation |
| "Too long" | Keep under 25 characters |

---

## Best Practices for WhatsApp Business Names

### ✅ DO:
- Use your registered business name
- Keep it short and memorable (under 25 characters)
- Use proper capitalization (Title Case)
- Make it match your website/brand
- Be specific about your service if needed

### ❌ DON'T:
- Use country/city names alone
- Use all caps (LEGALIQ)
- Add phone numbers or URLs
- Use generic terms without branding
- Include emojis or special characters
- Make misleading claims

---

## Recommended Display Name for LegalIQ

Based on all guidelines, I recommend:

### **Primary Choice: `LegalIQ`**

**Reasoning:**
- Clean and professional
- Matches your brand
- No geographic restrictions
- Easy to remember
- Complies with all WhatsApp guidelines
- Short (8 characters)

### **Backup Choice: `LegalIQ Platform`**

**Reasoning:**
- Clarifies the service type
- Still maintains brand identity
- Professional appearance
- Complies with guidelines

---

## After Approval

Once your display name is approved:

1. **Test WhatsApp Messages**
   ```bash
   cd backend
   node scripts/test-consultation-booked-professional.js
   ```

2. **Verify Display Name in Messages**
   - Check that messages show the new display name
   - Ensure all templates work correctly

3. **Update Documentation**
   - Update any internal docs that reference the old name
   - Inform your team of the change

4. **Monitor Delivery**
   - Check MSG91 logs for successful delivery
   - Verify users receive messages with correct sender name

---

## Troubleshooting

### If Still Rejected After Changes:

1. **Contact MSG91 Support**
   - Email: support@msg91.com
   - Provide your account details and rejection reason
   - Ask for specific guidance

2. **Contact Meta Support**
   - Via Facebook Business Manager
   - Request clarification on rejection reason
   - Provide business documentation

3. **Try Alternative Names**
   - Use your registered company name exactly as it appears on documents
   - Consider adding a service descriptor (e.g., "LegalIQ Consultancy")

### If Urgent:

1. **Use Existing Approved Name (if any)**
   - Check if you have any previously approved names
   - Use that temporarily while new name is under review

2. **Create New WhatsApp Business Account**
   - Register with a different phone number
   - Use recommended display name from the start
   - Transfer templates once approved

---

## Timeline

| Step | Expected Time |
|------|---------------|
| Submit display name change | Immediate |
| Meta review | 24-48 hours |
| Approval notification | Email within 48 hours |
| Name goes live | Immediately after approval |
| Template updates (if needed) | 24-48 hours additional |

---

## Quick Action Checklist

- [ ] Choose new display name: `LegalIQ` (recommended)
- [ ] Log in to MSG91 Dashboard
- [ ] Navigate to WhatsApp Business Account settings
- [ ] Update Display Name field
- [ ] Complete business profile (description, category, address, website)
- [ ] Submit for review
- [ ] Prepare supporting documents (business registration, GST)
- [ ] Wait for approval email (24-48 hours)
- [ ] Test WhatsApp messages after approval
- [ ] Update internal documentation

---

## Contact Support

If you need help:

**MSG91 Support:**
- Email: support@msg91.com
- Phone: +91-9650-800-800
- Dashboard: Live chat available

**Meta/WhatsApp Support:**
- Via Facebook Business Manager
- WhatsApp Business API Support Portal

---

## Summary

**The Issue:** "Legaliq India" violates WhatsApp's Display Name Guidelines (likely due to geographic identifier "India")

**The Solution:** Change display name to `LegalIQ` (without "India")

**The Process:**
1. Log in to MSG91 Dashboard
2. Go to WhatsApp Business Account settings
3. Change display name to `LegalIQ`
4. Complete business profile
5. Submit for review
6. Wait 24-48 hours for approval

**Expected Result:** Approval within 48 hours, WhatsApp service fully functional

---

## Additional Resources

- [WhatsApp Business Display Name Policy](https://www.whatsapp.com/legal/business-policy/)
- [MSG91 WhatsApp Documentation](https://docs.msg91.com/p/whatsapp)
- [Facebook Business Manager Help](https://www.facebook.com/business/help)

---

**Last Updated:** 2026-04-27
**Status:** Ready to implement
**Priority:** High - Required for WhatsApp service to function
