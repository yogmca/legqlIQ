# Role-Based Access Control Implementation Plan

## Overview
Implement role-based access control to prevent lawyers from booking consultations with other lawyers. The system should distinguish between regular users (clients) and lawyer users.

## Current State Analysis

### ✅ What's Already in Place
1. **User Model** - Already has `role` field with enum `['user', 'lawyer', 'admin']`
2. **Lawyer Model** - Separate model for lawyer profiles with `userId` reference
3. **Authentication** - JWT-based auth with user info in tokens
4. **Frontend Auth Service** - Can access user data including role

### ❌ What's Missing
1. **Role Assignment** - Lawyer registration doesn't set user role to 'lawyer'
2. **Frontend Access Control** - No UI restrictions based on user role
3. **Backend Validation** - No server-side checks to prevent lawyers from booking
4. **Existing Data** - Current lawyer users have role='user' instead of 'lawyer'

---

## Implementation Plan

### Phase 1: Backend Changes

#### 1.1 Update Lawyer Registration (authController.js)
**File:** `backend/controllers/authController.js`
**Function:** `registerLawyer`

**Changes:**
```javascript
// After creating lawyer profile, update user role
await User.findByIdAndUpdate(user._id, { role: 'lawyer' });
```

**Impact:** New lawyer registrations will have correct role

#### 1.2 Add Consultation Booking Validation (consultationController.js)
**File:** `backend/controllers/consultationController.js`
**Function:** `createConsultation` or payment creation endpoint

**Changes:**
```javascript
// Check if user is a lawyer
const user = await User.findById(req.user.id);
if (user.role === 'lawyer') {
  return res.status(403).json({
    success: false,
    message: 'Lawyers cannot book consultations with other lawyers'
  });
}
```

**Impact:** Server-side validation prevents lawyer bookings

#### 1.3 Update Existing Lawyer Users
**Script:** One-time database update

**Changes:**
```javascript
// Update all users who have lawyer profiles
const lawyers = await Lawyer.find({});
for (const lawyer of lawyers) {
  if (lawyer.userId) {
    await User.findByIdAndUpdate(lawyer.userId, { role: 'lawyer' });
  }
}
```

**Impact:** Existing lawyers (like Suhas) get correct role

---

### Phase 2: Frontend Changes

#### 2.1 Hide Booking UI for Lawyers (VideoConsultationList.jsx)
**File:** `src/components/VideoConsultationList.jsx`

**Changes:**
```javascript
import authService from '../services/authService';

// In component
const user = authService.getUser();
const isLawyer = user?.role === 'lawyer';

// Conditional rendering
{!isLawyer && (
  <button onClick={() => handleBookConsultation(lawyer)}>
    Book Consultation
  </button>
)}

{isLawyer && (
  <div className="lawyer-notice">
    Lawyers cannot book consultations
  </div>
)}
```

**Impact:** Lawyers don't see booking buttons

#### 2.2 Restrict Access to Booking Pages
**File:** `src/App.jsx` or individual components

**Changes:**
```javascript
// In VideoConsultationList component
useEffect(() => {
  const user = authService.getUser();
  if (user?.role === 'lawyer') {
    navigate('/appointments'); // Redirect lawyers to their appointments
  }
}, []);
```

**Impact:** Lawyers can't access booking flow

#### 2.3 Update Navigation/UI Based on Role
**File:** `src/components/Homepage.jsx` or navigation components

**Changes:**
```javascript
const user = authService.getUser();
const isLawyer = user?.role === 'lawyer';

// Show different navigation for lawyers
{isLawyer ? (
  <Link to="/appointments">My Consultations</Link>
) : (
  <Link to="/video-consultations">Book Consultation</Link>
)}
```

**Impact:** Role-appropriate navigation

---

### Phase 3: User Experience Enhancements

#### 3.1 Add Role Indicator in UI
**Location:** Header, profile section

**Changes:**
- Show badge/label indicating user role
- Different dashboard for lawyers vs clients

#### 3.2 Error Messages
**Location:** Booking forms, API responses

**Changes:**
- Clear error messages when lawyers attempt to book
- Helpful guidance on what lawyers can do instead

---

## Implementation Steps

### Step 1: Backend Updates
1. ✅ Update `registerLawyer` to set user role
2. ✅ Add validation in consultation booking endpoint
3. ✅ Create script to update existing lawyer users
4. ✅ Test backend validation

### Step 2: Frontend Updates
5. ✅ Hide booking UI for lawyers
6. ✅ Add role-based navigation
7. ✅ Implement access restrictions
8. ✅ Add user role indicators

### Step 3: Data Migration
9. ✅ Run script to update existing lawyers
10. ✅ Verify Suhas and other lawyers have correct role

### Step 4: Testing
11. ✅ Test as client - can book consultations
12. ✅ Test as lawyer - cannot book consultations
13. ✅ Test navigation and UI for both roles
14. ✅ Test backend validation

---

## Files to Modify

### Backend
1. `backend/controllers/authController.js` - Update lawyer registration
2. `backend/controllers/consultationController.js` - Add booking validation
3. `backend/routes/consultationRoutes.js` - Ensure auth middleware

### Frontend
1. `src/components/VideoConsultationList.jsx` - Hide booking for lawyers
2. `src/components/Homepage.jsx` - Role-based navigation
3. `src/App.jsx` - Route protection
4. `src/components/LawyerCard.jsx` - Conditional booking button

### Database
1. One-time migration script to update existing users

---

## Testing Checklist

### As Client (role='user')
- [ ] Can see lawyer listings
- [ ] Can see "Book Consultation" buttons
- [ ] Can access booking form
- [ ] Can complete booking and payment
- [ ] Can access video consultations

### As Lawyer (role='lawyer')
- [ ] Can see lawyer listings (for reference)
- [ ] CANNOT see "Book Consultation" buttons
- [ ] CANNOT access booking form
- [ ] Gets error if trying to book via API
- [ ] Can access their own appointments
- [ ] Can join video consultations as provider

### Edge Cases
- [ ] Lawyer trying to book via direct URL
- [ ] Lawyer trying to book via API call
- [ ] User role changes (user → lawyer)
- [ ] Admin role behavior

---

## Security Considerations

1. **Server-Side Validation** - Always validate on backend, never trust frontend
2. **JWT Token** - Include role in JWT for quick checks
3. **Database Consistency** - Ensure User.role matches Lawyer existence
4. **Authorization Middleware** - Reusable middleware for role checks

---

## Rollback Plan

If issues arise:
1. Remove backend validation temporarily
2. Show booking UI for all users
3. Add warning message instead of blocking
4. Fix issues and re-deploy

---

## Success Criteria

✅ Lawyers cannot book consultations with other lawyers
✅ Clients can book consultations normally
✅ Clear UI indicators for user roles
✅ Proper error messages
✅ Backend validation prevents circumvention
✅ Existing data migrated correctly

---

## Estimated Complexity

- **Backend Changes:** Low (2-3 files, simple validation)
- **Frontend Changes:** Medium (4-5 components, conditional rendering)
- **Data Migration:** Low (one-time script)
- **Testing:** Medium (multiple user scenarios)

**Total Effort:** ~2-3 hours for full implementation and testing
