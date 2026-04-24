# MSG91 WhatsApp Template Creation Guide

## Why Templates Are Required

MSG91 WhatsApp messages **FAIL** if the template doesn't exist on the MSG91 dashboard. The API accepts the request (returns `success`), but the actual delivery fails because WhatsApp/Meta requires pre-approved templates.

**This is why your MSG91 logs show `failed` status and `undefined`.**

---

## How to Create Templates

Go to: **MSG91 Dashboard → WhatsApp → Templates → Create New Template**

For each template below, fill in:
- **Name**: Exact name as shown (lowercase with underscores)
- **Category**: Utility
- **Language**: en (English)
- **Header**: None (leave empty unless specified)
- **Body**: Copy the exact text shown below
- **Footer**: `LegalIQ - Your Legal Partner`

> ⚠️ **IMPORTANT**: Variables must be written as `{{1}}`, `{{2}}`, etc. in the body text. WhatsApp requires at least one sample value for each variable during template submission.

---

## Template 1: `consultation_booked_admin`

| Field | Value |
|-------|-------|
| **Name** | `consultation_booked_admin` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body** (paste this exactly):
```
New Consultation Booking!

Client: {{1}}
Professional: {{2}}
Type: {{3}}
Case Type: {{4}}
Date: {{5}}
Time: {{6}}
Amount: {{7}}

Please review in the admin dashboard.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values for approval**: {{1}}=Yogesh Singh, {{2}}=Sreeram Singh, {{3}}=In-Person, {{4}}=Criminal Law, {{5}}=Saturday 25 April 2026, {{6}}=11:00 AM, {{7}}=₹500

---

## Template 2: `consultation_booked_client`

| Field | Value |
|-------|-------|
| **Name** | `consultation_booked_client` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Consultation Booked Successfully!

Hi {{1}},

Your consultation has been booked:
Professional: {{2}}
Case Type: {{3}}
Date: {{4}}
Time: {{5}}

Status: Pending Confirmation
You will be notified once the professional confirms.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh, {{2}}=Sreeram Singh, {{3}}=Criminal Law, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM

---

## Template 3: `consultation_booked_professional`

| Field | Value |
|-------|-------|
| **Name** | `consultation_booked_professional` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
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

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Yogesh Singh, {{3}}=In-Person, {{4}}=Criminal Law, {{5}}=Saturday 25 April 2026, {{6}}=11:00 AM

---

## Template 4: `video_consultation_booked_client`

| Field | Value |
|-------|-------|
| **Name** | `video_consultation_booked_client` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Video Consultation Booked!

Hi {{1}},

Your video consultation has been confirmed:
Professional: {{2}}
Date: {{3}}
Time: {{4}}
Amount: {{5}}

Payment received. You will receive a video call link before the appointment.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh, {{2}}=Sreeram Singh, {{3}}=Saturday 25 April 2026, {{4}}=11:00 AM, {{5}}=₹500

---

## Template 5: `video_consultation_booked_professional`

| Field | Value |
|-------|-------|
| **Name** | `video_consultation_booked_professional` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
New Video Consultation Request!

Hi {{1}},

You have a new video consultation request:
Client: {{2}}
Date: {{3}}
Time: {{4}}
Amount: {{5}}

Please log in to review and prepare.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Yogesh Singh, {{3}}=Saturday 25 April 2026, {{4}}=11:00 AM, {{5}}=₹500

---

## Template 6: `new_user_signup`

| Field | Value |
|-------|-------|
| **Name** | `new_user_signup` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
New User Signup on LegalIQ!

Name: {{1}}
Email: {{2}}
Phone: {{3}}
Role: {{4}}
Time: {{5}}

Please review in the admin dashboard.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh, {{2}}=yogesh@example.com, {{3}}=9876543210, {{4}}=Client, {{5}}=22/04/2026 1:15 PM

---

## Template 7: `new_professional_signup`

| Field | Value |
|-------|-------|
| **Name** | `new_professional_signup` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
New Professional Signup on LegalIQ!

Name: {{1}}
Role: {{2}}
Email: {{3}}
Phone: {{4}}
Registration No: {{5}}
Specialization: {{6}}
Experience: {{7}}
Time: {{8}}

Please review and verify in the admin dashboard.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Lawyer/Advocate, {{3}}=sreeram@example.com, {{4}}=9876543210, {{5}}=BAR/2024/001, {{6}}=Criminal Law, {{7}}=5 years, {{8}}=22/04/2026 1:15 PM

---

## Template 8: `welcome_user`

| Field | Value |
|-------|-------|
| **Name** | `welcome_user` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Welcome to LegalIQ, {{1}}!

Thank you for registering. You can now:
- Search for legal professionals
- Book consultations
- Chat with experts

Visit our platform to get started!
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh

---

## Template 9: `welcome_professional`

| Field | Value |
|-------|-------|
| **Name** | `welcome_professional` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Welcome to LegalIQ, {{1}}!

You have been registered as a {{2}}.

Your profile is now live. Clients can:
- Find you in search results
- Book consultations with you
- Connect via video calls

Log in to manage your profile and appointments.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Lawyer/Advocate

---

## Template 10: `appointment_accepted_client`

| Field | Value |
|-------|-------|
| **Name** | `appointment_accepted_client` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Confirmed!

Hi {{1}},

Great news! Your {{3}} appointment has been accepted:
Professional: {{2}}
Date: {{4}}
Time: {{5}}

Please be available at the scheduled time.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh, {{2}}=Sreeram Singh, {{3}}=In-Person, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM

---

## Template 11: `appointment_accepted_professional`

| Field | Value |
|-------|-------|
| **Name** | `appointment_accepted_professional` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Confirmed!

Hi {{1}},

You have confirmed the {{3}} appointment:
Client: {{2}}
Date: {{4}}
Time: {{5}}

Please be available at the scheduled time.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Yogesh Singh, {{3}}=In-Person, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM

---

## Template 12: `appointment_rescheduled_client`

| Field | Value |
|-------|-------|
| **Name** | `appointment_rescheduled_client` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Rescheduled

Hi {{1}},

Your {{3}} appointment with {{2}} has been rescheduled:
New Date: {{4}}
New Time: {{5}}
Reason: {{6}}

Please check the new schedule.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh, {{2}}=Sreeram Singh, {{3}}=In-Person, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM, {{6}}=Schedule adjustment

---

## Template 13: `appointment_rescheduled_professional`

| Field | Value |
|-------|-------|
| **Name** | `appointment_rescheduled_professional` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Rescheduled

Hi {{1}},

Your {{3}} appointment with {{2}} has been rescheduled:
New Date: {{4}}
New Time: {{5}}
Reason: {{6}}

Please update your schedule accordingly.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Yogesh Singh, {{3}}=In-Person, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM, {{6}}=Schedule adjustment

---

## Template 14: `appointment_cancelled_client`

| Field | Value |
|-------|-------|
| **Name** | `appointment_cancelled_client` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Cancelled

Hi {{1}},

Your {{3}} appointment with {{2}} has been cancelled:
Date: {{4}}
Time: {{5}}
Reason: {{6}}

You can book a new consultation anytime.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Yogesh Singh, {{2}}=Sreeram Singh, {{3}}=In-Person, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM, {{6}}=No reason provided

---

## Template 15: `appointment_cancelled_professional`

| Field | Value |
|-------|-------|
| **Name** | `appointment_cancelled_professional` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Cancelled

Hi {{1}},

The {{3}} appointment with {{2}} has been cancelled:
Date: {{4}}
Time: {{5}}
Reason: {{6}}

The time slot is now available for other bookings.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Sreeram Singh, {{2}}=Yogesh Singh, {{3}}=In-Person, {{4}}=Saturday 25 April 2026, {{5}}=11:00 AM, {{6}}=No reason provided

---

## Template 16: `appointment_status_admin`

| Field | Value |
|-------|-------|
| **Name** | `appointment_status_admin` |
| **Category** | Utility |
| **Language** | en |
| **Header** | None |

**Body**:
```
Appointment Status Update

Status: {{1}}
Client: {{2}}
Professional: {{3}}
Type: {{4}}
Date: {{5}}
Time: {{6}}

Please review in the admin dashboard.
```

**Footer**: `LegalIQ - Your Legal Partner`

**Sample values**: {{1}}=Accepted, {{2}}=Yogesh Singh, {{3}}=Sreeram Singh, {{4}}=In-Person, {{5}}=Saturday 25 April 2026, {{6}}=11:00 AM

---

## Template Approval Timeline

- WhatsApp/Meta typically approves **Utility** templates within **a few minutes to 24 hours**
- **Marketing** templates may take longer
- If a template is rejected, check the rejection reason and modify the text accordingly
- Common rejection reasons:
  - Using emojis in template body (some get rejected — avoid if possible)
  - Missing sample values
  - Template name doesn't follow naming conventions

---

## After Templates Are Approved

Once all templates show **Approved** status in MSG91 dashboard:

1. Messages will start delivering successfully
2. MSG91 logs will show proper delivery status instead of `failed`
3. The `undefined` UUID issue will be resolved as MSG91 can now properly track template-based messages

---

## Quick Checklist

- [ ] Template 1: `consultation_booked_admin` — Created & Approved
- [ ] Template 2: `consultation_booked_client` — Created & Approved
- [ ] Template 3: `consultation_booked_professional` — Created & Approved
- [ ] Template 4: `video_consultation_booked_client` — Created & Approved
- [ ] Template 5: `video_consultation_booked_professional` — Created & Approved
- [ ] Template 6: `new_user_signup` — Created & Approved
- [ ] Template 7: `new_professional_signup` — Created & Approved
- [ ] Template 8: `welcome_user` — Created & Approved
- [ ] Template 9: `welcome_professional` — Created & Approved
- [ ] Template 10: `appointment_accepted_client` — Created & Approved
- [ ] Template 11: `appointment_accepted_professional` — Created & Approved
- [ ] Template 12: `appointment_rescheduled_client` — Created & Approved
- [ ] Template 13: `appointment_rescheduled_professional` — Created & Approved
- [ ] Template 14: `appointment_cancelled_client` — Created & Approved
- [ ] Template 15: `appointment_cancelled_professional` — Created & Approved
- [ ] Template 16: `appointment_status_admin` — Created & Approved

---

## Important Notes

1. **Do NOT use emojis** in the template body text — WhatsApp may reject templates with emojis. The code in `whatsappService.js` uses plain text templates.
2. **Variable numbering must be sequential** — `{{1}}`, `{{2}}`, `{{3}}`, etc. No gaps allowed.
3. **Template names must be lowercase** with underscores only — no spaces, no hyphens, no uppercase.
4. **Each template needs sample values** during submission for WhatsApp to review.
5. **No code changes needed** — once templates are approved on MSG91, the existing code will work as-is.
