# WhatsApp Integration Guide (MSG91)

## Overview

LegalIQ uses **MSG91's WhatsApp API** to send WhatsApp notifications to users, professionals, and admins. This covers:

- **New Signups** – Admin gets notified + user/professional gets a welcome message
- **Consultation Bookings** – Both client and professional get booking details; admin is notified
- **Appointment Status Updates** – Accept, reschedule, and cancel notifications to both parties + admin

> **No DLT Registration Required!** Unlike SMS in India, WhatsApp messages via MSG91 do NOT require DLT registration. You only need approved WhatsApp templates from Meta/WhatsApp.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LegalIQ Backend                       │
│                                                         │
│  authController.js ──────┐                              │
│  consultationController.js ──┤                          │
│                              ▼                          │
│                   whatsappService.js                     │
│                         │                               │
│                         ▼                               │
│                  MSG91 WhatsApp API                      │
│                         │                               │
│                         ▼                               │
│              WhatsApp Business API                      │
│                         │                               │
│                         ▼                               │
│           User's WhatsApp (Messages)                    │
└─────────────────────────────────────────────────────────┘
```

### Files Modified/Created

| File | Action | Description |
|------|--------|-------------|
| `backend/services/whatsappService.js` | **Created** | MSG91 WhatsApp service with all notification methods |
| `backend/controllers/authController.js` | **Modified** | Added WhatsApp notifications for user & professional signups |
| `backend/controllers/consultationController.js` | **Modified** | Added WhatsApp notifications for bookings & status updates |
| `backend/.env` | **Modified** | Added MSG91 WhatsApp configuration variables |
| `backend/.env.example` | **Modified** | Added WhatsApp configuration template |
| `WHATSAPP_INTEGRATION_GUIDE.md` | **Created** | This documentation file |

---

## Setup Instructions

### Step 1: Create MSG91 Account

1. Go to [https://msg91.com](https://msg91.com) and sign up
2. Complete your account verification
3. Navigate to the **Dashboard** and copy your **Auth Key**

### Step 2: Enable WhatsApp Channel

1. In MSG91 Dashboard, go to **WhatsApp** section
2. Follow the setup wizard to connect your WhatsApp Business Account
3. Verify your business phone number
4. Copy the **Integrated Number ID** from WhatsApp settings

### Step 3: Create WhatsApp Templates

You need to create the following templates in MSG91's dashboard. Each template must be approved by WhatsApp/Meta before it can be used.

#### Template List

| Template Name | Purpose | Variables |
|---------------|---------|-----------|
| `new_user_signup` | Admin notification for new user signup | `{{1}}` name, `{{2}}` email, `{{3}}` phone, `{{4}}` role, `{{5}}` timestamp |
| `new_professional_signup` | Admin notification for new professional signup | `{{1}}` name, `{{2}}` role, `{{3}}` email, `{{4}}` phone, `{{5}}` regNo, `{{6}}` specialization, `{{7}}` experience, `{{8}}` timestamp |
| `welcome_user` | Welcome message to new user | `{{1}}` name |
| `welcome_professional` | Welcome message to new professional | `{{1}}` name, `{{2}}` role |
| `consultation_booked_client` | Client booking confirmation (in-person) | `{{1}}` clientName, `{{2}}` lawyerName, `{{3}}` caseType, `{{4}}` date, `{{5}}` time |
| `consultation_booked_professional` | Professional new booking notification | `{{1}}` lawyerName, `{{2}}` clientName, `{{3}}` type, `{{4}}` caseType, `{{5}}` date, `{{6}}` time |
| `consultation_booked_admin` | Admin booking notification | `{{1}}` clientName, `{{2}}` lawyerName, `{{3}}` type, `{{4}}` caseType, `{{5}}` date, `{{6}}` time, `{{7}}` amount |
| `video_consultation_booked_client` | Client video booking confirmation | `{{1}}` clientName, `{{2}}` lawyerName, `{{3}}` date, `{{4}}` time, `{{5}}` amount |
| `video_consultation_booked_professional` | Professional video booking notification | `{{1}}` lawyerName, `{{2}}` clientName, `{{3}}` date, `{{4}}` time, `{{5}}` amount |
| `appointment_accepted_client` | Client notification - appointment accepted | `{{1}}` clientName, `{{2}}` lawyerName, `{{3}}` type, `{{4}}` date, `{{5}}` time |
| `appointment_accepted_professional` | Professional confirmation of acceptance | `{{1}}` lawyerName, `{{2}}` clientName, `{{3}}` type, `{{4}}` date, `{{5}}` time |
| `appointment_rescheduled_client` | Client notification - appointment rescheduled | `{{1}}` clientName, `{{2}}` lawyerName, `{{3}}` type, `{{4}}` date, `{{5}}` time, `{{6}}` reason |
| `appointment_rescheduled_professional` | Professional confirmation of reschedule | `{{1}}` lawyerName, `{{2}}` clientName, `{{3}}` type, `{{4}}` date, `{{5}}` time, `{{6}}` reason |
| `appointment_cancelled_client` | Client notification - appointment cancelled | `{{1}}` clientName, `{{2}}` lawyerName, `{{3}}` type, `{{4}}` date, `{{5}}` time, `{{6}}` reason |
| `appointment_cancelled_professional` | Professional notification of cancellation | `{{1}}` lawyerName, `{{2}}` clientName, `{{3}}` type, `{{4}}` date, `{{5}}` time, `{{6}}` reason |
| `appointment_status_admin` | Admin notification for any status change | `{{1}}` status, `{{2}}` clientName, `{{3}}` lawyerName, `{{4}}` type, `{{5}}` date, `{{6}}` time |

#### Sample Template Content

Here are suggested template texts to create in MSG91:

**`new_user_signup`** (Admin notification):
```
🆕 New User Signup on LegalIQ!

Name: {{1}}
Email: {{2}}
Phone: {{3}}
Role: {{4}}
Time: {{5}}

Please review in the admin dashboard.
```

**`welcome_user`** (User welcome):
```
👋 Welcome to LegalIQ, {{1}}!

Thank you for registering. You can now:
✅ Search for legal professionals
✅ Book consultations
✅ Chat with experts

Visit our platform to get started!
```

**`welcome_professional`** (Professional welcome):
```
👋 Welcome to LegalIQ, {{1}}!

You've been registered as a {{2}}.

Your profile is now live. Clients can:
✅ Find you in search results
✅ Book consultations with you
✅ Connect via video calls

Log in to manage your profile and appointments.
```

**`consultation_booked_client`** (Client booking confirmation):
```
📋 Consultation Booked Successfully!

Hi {{1}},

Your consultation has been booked:
👤 Professional: {{2}}
📂 Case Type: {{3}}
📅 Date: {{4}}
🕐 Time: {{5}}

Status: Pending Confirmation
You'll be notified once the professional confirms.
```

**`consultation_booked_professional`** (Professional notification):
```
📋 New Consultation Request!

Hi {{1}},

You have a new {{3}} consultation request:
👤 Client: {{2}}
📂 Case Type: {{4}}
📅 Date: {{5}}
🕐 Time: {{6}}

Please log in to accept or reschedule.
```

**`video_consultation_booked_client`** (Video booking confirmation):
```
🎥 Video Consultation Booked!

Hi {{1}},

Your video consultation has been confirmed:
👤 Professional: {{2}}
📅 Date: {{3}}
🕐 Time: {{4}}
💰 Amount: {{5}}

Payment received. You'll receive a video call link before the appointment.
```

**`appointment_accepted_client`** (Appointment accepted):
```
✅ Appointment Confirmed!

Hi {{1}},

Great news! Your {{3}} appointment has been accepted:
👤 Professional: {{2}}
📅 Date: {{4}}
🕐 Time: {{5}}

Please be available at the scheduled time.
```

**`appointment_rescheduled_client`** (Appointment rescheduled):
```
🔄 Appointment Rescheduled

Hi {{1}},

Your {{3}} appointment with {{2}} has been rescheduled:
📅 New Date: {{4}}
🕐 New Time: {{5}}
📝 Reason: {{6}}

Please check the new schedule.
```

**`appointment_cancelled_client`** (Appointment cancelled):
```
❌ Appointment Cancelled

Hi {{1}},

Your {{3}} appointment with {{2}} has been cancelled:
📅 Date: {{4}}
🕐 Time: {{5}}
📝 Reason: {{6}}

You can book a new consultation anytime.
```

### Step 4: Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# MSG91 WhatsApp Configuration
MSG91_AUTH_KEY=your_msg91_auth_key_here
MSG91_WHATSAPP_INTEGRATED_NUMBER_ID=your_integrated_number_id_here
ADMIN_WHATSAPP_NUMBER=919876543210
WHATSAPP_ENABLED=true
```

| Variable | Description | Example |
|----------|-------------|---------|
| `MSG91_AUTH_KEY` | Your MSG91 authentication key | `abc123def456...` |
| `MSG91_WHATSAPP_INTEGRATED_NUMBER_ID` | Integrated number ID from MSG91 WhatsApp settings | `12345678` |
| `ADMIN_WHATSAPP_NUMBER` | Admin's WhatsApp number with country code (no +) | `919876543210` |
| `WHATSAPP_ENABLED` | Enable/disable WhatsApp notifications | `true` or `false` |

### Step 5: Test

1. Set `WHATSAPP_ENABLED=false` first (messages will be logged to console)
2. Register a new user and check console logs for WhatsApp message details
3. Book a consultation and verify the log output
4. Once satisfied, set `WHATSAPP_ENABLED=true` to send real messages

---

## Notification Flow

### 1. New User Signup

```
User registers → authController.register()
  ├── Email: Admin notification + Welcome email (existing)
  ├── WhatsApp: Admin notification (new_user_signup)
  └── WhatsApp: Welcome message to user (welcome_user)
```

### 2. New Professional Signup

```
Professional registers → authController.registerLawyer()
  ├── Email: Admin notification + Welcome email (existing)
  ├── WhatsApp: Admin notification (new_professional_signup)
  └── WhatsApp: Welcome message to professional (welcome_professional)
```

### 3. In-Person Consultation Booking

```
Client books consultation → consultationController.createConsultation()
  ├── Email: Admin notification (existing)
  ├── WhatsApp: Client confirmation (consultation_booked_client)
  ├── WhatsApp: Professional notification (consultation_booked_professional)
  └── WhatsApp: Admin notification (consultation_booked_admin)
```

### 4. Video Consultation Booking (after payment)

```
Payment verified → consultationController.verifyPayment()
  ├── Email: Admin notification (existing)
  ├── WhatsApp: Client confirmation (video_consultation_booked_client)
  ├── WhatsApp: Professional notification (video_consultation_booked_professional)
  └── WhatsApp: Admin notification (consultation_booked_admin)
```

### 5. Appointment Accepted

```
Professional accepts → consultationController.acceptConsultation()
  ├── WhatsApp: Client notification (appointment_accepted_client)
  ├── WhatsApp: Professional confirmation (appointment_accepted_professional)
  └── WhatsApp: Admin notification (appointment_status_admin)
```

### 6. Appointment Rescheduled

```
Professional reschedules → consultationController.rescheduleConsultation()
  ├── WhatsApp: Client notification (appointment_rescheduled_client)
  ├── WhatsApp: Professional confirmation (appointment_rescheduled_professional)
  └── WhatsApp: Admin notification (appointment_status_admin)
```

### 7. Appointment Cancelled (by Professional)

```
Professional rejects → consultationController.rejectConsultation()
  ├── WhatsApp: Client notification (appointment_cancelled_client)
  ├── WhatsApp: Professional notification (appointment_cancelled_professional)
  └── WhatsApp: Admin notification (appointment_status_admin)
```

### 8. Appointment Cancelled (by Client)

```
Client cancels → consultationController.cancelConsultation()
  ├── WhatsApp: Client confirmation (appointment_cancelled_client)
  ├── WhatsApp: Professional notification (appointment_cancelled_professional)
  └── WhatsApp: Admin notification (appointment_status_admin)
```

---

## Development Mode

When `WHATSAPP_ENABLED=false` (or in development mode), all WhatsApp messages are **logged to the console** instead of being sent. This allows you to:

- Test the notification flow without MSG91 credits
- Verify template variables are correct
- Debug message content before going live

Console output example:
```
📱 [DEV MODE] WhatsApp Message:
   To: 919876543210
   Template: welcome_user
   Variables: {
     "body": ["John Doe"]
   }
   (Set WHATSAPP_ENABLED=true in .env to send real messages)
```

---

## Troubleshooting

### Messages not sending?

1. **Check `WHATSAPP_ENABLED`** – Must be `true` in `.env`
2. **Check `MSG91_AUTH_KEY`** – Must be valid MSG91 auth key
3. **Check `MSG91_WHATSAPP_INTEGRATED_NUMBER_ID`** – Must match your MSG91 WhatsApp setup
4. **Check template approval** – Templates must be approved by WhatsApp/Meta
5. **Check phone numbers** – Must include country code (e.g., `919876543210`)
6. **Check console logs** – Error details are logged with ❌ prefix

### Template not found?

- Ensure template names in MSG91 dashboard match exactly with the names in `whatsappService.js`
- Templates are case-sensitive
- Wait for WhatsApp/Meta approval (can take 24-48 hours)

### Phone number format issues?

The service automatically handles:
- 10-digit Indian numbers → adds `91` prefix
- Numbers with `+91` → strips `+`
- Numbers already with `91` prefix → used as-is

---

## Cost Estimation

MSG91 WhatsApp pricing (approximate):
- **Utility messages**: ₹0.35-0.50 per message
- **Marketing messages**: ₹0.70-1.00 per message
- **Service messages** (within 24hr window): Free

For a platform with ~100 signups/month and ~200 consultations/month:
- Signup notifications: ~200 messages × ₹0.40 = ₹80/month
- Booking notifications: ~600 messages × ₹0.40 = ₹240/month
- Status updates: ~400 messages × ₹0.40 = ₹160/month
- **Estimated total: ~₹480/month**

---

## SMS vs WhatsApp Comparison

| Feature | SMS (DLT Required) | WhatsApp (No DLT) |
|---------|--------------------|--------------------|
| DLT Registration | ✅ Required in India | ❌ Not required |
| Template Approval | DLT portal (weeks) | WhatsApp/Meta (24-48hrs) |
| Rich Content | Text only | Text, images, buttons |
| Delivery Rate | ~95% | ~99% |
| Read Rate | ~20% | ~90% |
| Cost per message | ₹0.15-0.25 | ₹0.35-0.50 |
| User Experience | Basic | Rich & interactive |

---

## API Reference

### WhatsApp Service Methods

| Method | Description |
|--------|-------------|
| `sendNewUserSignupToAdmin(userData)` | Notify admin of new user signup |
| `sendNewProfessionalSignupToAdmin(data)` | Notify admin of new professional signup |
| `sendWelcomeToUser(userData)` | Send welcome message to new user |
| `sendWelcomeToProfessional(data)` | Send welcome message to new professional |
| `sendConsultationBookedToClient(data)` | Confirm booking to client |
| `sendConsultationBookedToProfessional(data)` | Notify professional of new booking |
| `sendConsultationBookedToAdmin(data)` | Notify admin of new booking |
| `sendVideoConsultationBookedToClient(data)` | Confirm video booking to client |
| `sendVideoConsultationBookedToProfessional(data)` | Notify professional of video booking |
| `sendAppointmentAccepted(data)` | Notify both parties of acceptance |
| `sendAppointmentRescheduled(data)` | Notify both parties of reschedule |
| `sendAppointmentCancelled(data)` | Notify both parties of cancellation |
