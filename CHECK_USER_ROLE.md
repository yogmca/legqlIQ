# Check User Role in Browser

## Quick Debug Steps

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Check Current User Data:**
```javascript
// Check what's stored in localStorage
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('token'));
```

3. **Expected Output for Lawyer:**
```javascript
{
  id: "...",
  name: "Suhas",
  email: "yogemca@gmail.com",
  role: "lawyer",  // ← THIS MUST BE PRESENT
  ...
}
```

## If Role is Missing

**You MUST logout and login again:**

1. Click "Logout" button
2. Go to `/login`
3. Login with lawyer credentials
4. Check localStorage again

## Clear Browser Data (If Still Not Working)

```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Then login fresh.

## Verify Role-Based Features

After logging in as lawyer, you should see:

1. ✅ "LAWYER" badge in header next to your name
2. ✅ "Appointments" link in navigation
3. ✅ On `/video-consultations` - restriction message (NOT lawyer listings)
4. ✅ On `/appointments` - "Client Consultations" header

## Test Accounts

All these have `role: 'lawyer'` in database:
- yogemca@gmail.com
- ykmysuru27@gmail.com
- lawyer1@test.com
- lawyer2@test.com

**Password:** Use the password you set when registering these accounts.

## Still Seeing Lawyers?

If you still see lawyer listings after:
1. Logging out
2. Clearing localStorage
3. Logging in fresh

Then run this in console to verify:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Is Lawyer?', user?.role === 'lawyer');
```

If it shows `false` or `undefined`, the backend didn't return the role. Check backend logs.
