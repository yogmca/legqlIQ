# Lawyer Consultation Management Guide

## Overview

Lawyers can now **accept**, **reject**, and **reschedule** client consultation bookings through the API.

---

## New API Endpoints

All endpoints require authentication (JWT token) and the user must be a lawyer.

### Base URL
```
/api/consultations/:id
```

---

## 1. Accept Consultation

**Endpoint:** `POST /api/consultations/:id/accept`

**Description:** Lawyer accepts a pending consultation request

**Authentication:** Required (Lawyer only)

**Request:**
```http
POST /api/consultations/65abc123def456/accept
Authorization: Bearer <lawyer_jwt_token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Consultation accepted successfully",
  "consultation": {
    "id": "65abc123def456",
    "clientId": "65xyz789",
    "lawyerId": "65lawyer123",
    "clientName": "John Doe",
    "lawyerName": "Adv. Rajesh Kumar",
    "caseType": "Criminal Law",
    "preferredDate": "2026-03-01T00:00:00.000Z",
    "preferredTime": "10:00 AM",
    "status": "confirmed",
    "createdAt": "2026-02-28T07:00:00.000Z"
  }
}
```

**Status Changes:**
- `pending` → `confirmed`
- `pending_payment` → `confirmed`

**Error Responses:**
```json
{
  "success": false,
  "message": "Only lawyers can accept consultations"
}
```

```json
{
  "success": false,
  "message": "Not authorized to accept this consultation"
}
```

```json
{
  "success": false,
  "message": "Cannot accept consultation with status: completed"
}
```

---

## 2. Reject Consultation

**Endpoint:** `POST /api/consultations/:id/reject`

**Description:** Lawyer rejects a consultation request

**Authentication:** Required (Lawyer only)

**Request:**
```http
POST /api/consultations/65abc123def456/reject
Authorization: Bearer <lawyer_jwt_token>
Content-Type: application/json

{
  "reason": "Schedule conflict - unavailable on requested date"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Optional | Reason for rejection |

**Response (Success):**
```json
{
  "success": true,
  "message": "Consultation rejected successfully",
  "consultation": {
    "id": "65abc123def456",
    "status": "cancelled",
    "lawyerNotes": "Schedule conflict - unavailable on requested date"
  }
}
```

**Status Changes:**
- `pending` → `cancelled`
- `pending_payment` → `cancelled`
- `confirmed` → `cancelled`
- `rescheduled` → `cancelled`

**Cannot Reject:**
- `completed` consultations
- `cancelled` consultations

---

## 3. Reschedule Consultation

**Endpoint:** `POST /api/consultations/:id/reschedule`

**Description:** Lawyer proposes a new date/time for the consultation

**Authentication:** Required (Lawyer only)

**Request:**
```http
POST /api/consultations/65abc123def456/reschedule
Authorization: Bearer <lawyer_jwt_token>
Content-Type: application/json

{
  "preferredDate": "2026-03-05",
  "preferredTime": "2:00 PM",
  "reason": "Previous slot unavailable, proposing new time"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| preferredDate | string (ISO date) | **Yes** | New consultation date |
| preferredTime | string | **Yes** | New consultation time |
| reason | string | Optional | Reason for rescheduling |

**Response (Success):**
```json
{
  "success": true,
  "message": "Consultation rescheduled successfully",
  "consultation": {
    "id": "65abc123def456",
    "preferredDate": "2026-03-05T00:00:00.000Z",
    "preferredTime": "2:00 PM",
    "status": "rescheduled",
    "lawyerNotes": "Previous slot unavailable, proposing new time"
  }
}
```

**Status Changes:**
- `pending` → `rescheduled`
- `pending_payment` → `rescheduled`
- `confirmed` → `rescheduled`

**Cannot Reschedule:**
- `completed` consultations
- `cancelled` consultations

**Validation:**
- Both `preferredDate` and `preferredTime` are required
- Date must be valid ISO format

---

## Usage Examples

### JavaScript/Fetch Example

```javascript
// Accept consultation
async function acceptConsultation(consultationId, token) {
  const response = await fetch(`/api/consultations/${consultationId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}

// Reject consultation
async function rejectConsultation(consultationId, reason, token) {
  const response = await fetch(`/api/consultations/${consultationId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  
  const data = await response.json();
  return data;
}

// Reschedule consultation
async function rescheduleConsultation(consultationId, newDate, newTime, reason, token) {
  const response = await fetch(`/api/consultations/${consultationId}/reschedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      preferredDate: newDate,
      preferredTime: newTime,
      reason: reason
    })
  });
  
  const data = await response.json();
  return data;
}
```

### Axios Example

```javascript
import axios from 'axios';

// Accept consultation
const acceptConsultation = async (consultationId) => {
  try {
    const response = await axios.post(
      `/api/consultations/${consultationId}/accept`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error accepting consultation:', error.response.data);
    throw error;
  }
};

// Reject consultation
const rejectConsultation = async (consultationId, reason) => {
  try {
    const response = await axios.post(
      `/api/consultations/${consultationId}/reject`,
      { reason },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting consultation:', error.response.data);
    throw error;
  }
};

// Reschedule consultation
const rescheduleConsultation = async (consultationId, newDate, newTime, reason) => {
  try {
    const response = await axios.post(
      `/api/consultations/${consultationId}/reschedule`,
      {
        preferredDate: newDate,
        preferredTime: newTime,
        reason: reason
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rescheduling consultation:', error.response.data);
    throw error;
  }
};
```

---

## Consultation Status Flow

```
Client Books → pending
                ↓
        Lawyer Actions:
        ├─ Accept → confirmed
        ├─ Reject → cancelled
        └─ Reschedule → rescheduled
                          ↓
                  Client Confirms → confirmed
```

---

## Authorization

### Who Can Perform Actions?

| Action | Client | Lawyer |
|--------|--------|--------|
| Book consultation | ✅ | ❌ |
| Accept consultation | ❌ | ✅ |
| Reject consultation | ❌ | ✅ |
| Reschedule consultation | ❌ | ✅ |
| Cancel consultation | ✅ | ✅ |
| Add review | ✅ | ❌ |

### Verification Process

1. User must be authenticated (valid JWT token)
2. User must have `role: 'lawyer'` in User model
3. Lawyer record must exist with `userId` matching authenticated user
4. Consultation's `lawyerId` must match the lawyer's `_id`

---

## Database Schema Updates

### Consultation Model Fields Used

```javascript
{
  status: {
    type: String,
    enum: ['pending', 'pending_payment', 'confirmed', 'completed', 'cancelled', 'rescheduled']
  },
  preferredDate: Date,
  preferredTime: String,
  lawyerNotes: String,
  confirmedAt: Date,
  cancelledAt: Date
}
```

---

## Error Handling

### Common Errors

1. **Not Authenticated**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

2. **Not a Lawyer**
```json
{
  "success": false,
  "message": "Only lawyers can accept consultations"
}
```

3. **Consultation Not Found**
```json
{
  "success": false,
  "message": "Consultation not found"
}
```

4. **Not Authorized**
```json
{
  "success": false,
  "message": "Not authorized to accept this consultation"
}
```

5. **Invalid Status**
```json
{
  "success": false,
  "message": "Cannot accept consultation with status: completed"
}
```

6. **Missing Required Fields (Reschedule)**
```json
{
  "success": false,
  "message": "Both date and time are required for rescheduling"
}
```

---

## Testing

### Using cURL

```bash
# Accept consultation
curl -X POST http://localhost:4000/api/consultations/65abc123def456/accept \
  -H "Authorization: Bearer YOUR_LAWYER_JWT_TOKEN"

# Reject consultation
curl -X POST http://localhost:4000/api/consultations/65abc123def456/reject \
  -H "Authorization: Bearer YOUR_LAWYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Schedule conflict"}'

# Reschedule consultation
curl -X POST http://localhost:4000/api/consultations/65abc123def456/reschedule \
  -H "Authorization: Bearer YOUR_LAWYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredDate": "2026-03-05",
    "preferredTime": "2:00 PM",
    "reason": "Proposing new time slot"
  }'
```

---

## Frontend Integration

### React Component Example

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const LawyerConsultationActions = ({ consultation, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/consultations/${consultation._id}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Consultation accepted successfully!');
      onUpdate(response.data.consultation);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const rejectReason = prompt('Reason for rejection (optional):');
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/consultations/${consultation._id}/reject`,
        { reason: rejectReason },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Consultation rejected');
      onUpdate(response.data.consultation);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/consultations/${consultation._id}/reschedule`,
        {
          preferredDate: newDate,
          preferredTime: newTime,
          reason: reason
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Consultation rescheduled successfully!');
      onUpdate(response.data.consultation);
      setShowReschedule(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reschedule consultation');
    } finally {
      setLoading(false);
    }
  };

  if (consultation.status === 'completed' || consultation.status === 'cancelled') {
    return <div>No actions available for {consultation.status} consultations</div>;
  }

  return (
    <div className="consultation-actions">
      <h3>Consultation Actions</h3>
      
      {!showReschedule ? (
        <div className="action-buttons">
          <button onClick={handleAccept} disabled={loading}>
            ✅ Accept
          </button>
          <button onClick={handleReject} disabled={loading}>
            ❌ Reject
          </button>
          <button onClick={() => setShowReschedule(true)} disabled={loading}>
            📅 Reschedule
          </button>
        </div>
      ) : (
        <form onSubmit={handleReschedule} className="reschedule-form">
          <h4>Reschedule Consultation</h4>
          <div>
            <label>New Date:</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Time:</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Reason (optional):</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rescheduling..."
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              Confirm Reschedule
            </button>
            <button type="button" onClick={() => setShowReschedule(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LawyerConsultationActions;
```

---

## Notes

- All actions are logged with timestamps (`confirmedAt`, `cancelledAt`)
- Lawyer notes are stored in `lawyerNotes` field
- Client receives updated consultation details after each action
- Consider adding email/SMS notifications to clients when lawyers take actions
- Rescheduled consultations may need client confirmation in future updates

---

## Future Enhancements

1. **Email Notifications**: Notify clients when lawyer accepts/rejects/reschedules
2. **SMS Alerts**: Send SMS to client for important status changes
3. **Client Confirmation**: Require client to confirm rescheduled dates
4. **Cancellation Reasons**: Track common rejection reasons for analytics
5. **Auto-reminder**: Send reminders to lawyers for pending consultations
6. **Bulk Actions**: Allow lawyers to accept/reject multiple consultations at once

---

**Last Updated:** 2026-02-28  
**Version:** 1.0.0
