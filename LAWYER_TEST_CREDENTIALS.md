# Lawyer Test Credentials

## Available Lawyer Accounts

The following accounts have been configured with `role: 'lawyer'` in the database:

### Account 1
- **Email**: yogemca@gmail.com
- **Name**: Suhas
- **Role**: lawyer
- **Password**: (Set during registration - check your records)

### Account 2
- **Email**: ykmysuru27@gmail.com
- **Name**: Suhas
- **Role**: lawyer
- **Password**: (Set during registration - check your records)

### Account 3
- **Email**: lawyer1@test.com
- **Name**: Suhas
- **Role**: lawyer
- **Password**: (Set during registration - check your records)

### Account 4
- **Email**: lawyer2@test.com
- **Name**: Suhas
- **Role**: lawyer
- **Password**: (Set during registration - check your records)

## Testing Lawyer Features

### What Lawyers Can Do:
1. ✅ Login to the system
2. ✅ View appointments page (`/appointments`)
3. ✅ See list of clients who booked consultations with them
4. ✅ Start video calls with clients
5. ✅ View client information (name, email, case description)

### What Lawyers Cannot Do:
1. ❌ Book consultations with other lawyers
2. ❌ Access video consultation booking page (shows restriction message)
3. ❌ See lawyer listings when logged in as lawyer

## How to Test

1. **Login as Lawyer**:
   - Go to `/login`
   - Use one of the email addresses above
   - Enter the password you set during registration

2. **Try to Book Consultation** (Should be blocked):
   - Navigate to `/video-consultations`
   - You should see a restriction message instead of lawyer listings
   - Message: "As a registered lawyer on our platform, you cannot book consultations with other lawyers"

3. **View Client Appointments**:
   - Navigate to `/appointments`
   - You should see "Client Consultations" header
   - A "Lawyer Account" badge should be visible
   - Any consultations booked by clients will show client information

## Creating a New Lawyer Account

To create a new lawyer account for testing:

1. Go to `/register`
2. Fill in the registration form
3. The backend automatically sets `role: 'lawyer'` for lawyer registrations
4. Login with the new credentials

## Password Reset

If you don't remember the password for any of these accounts, you can:

1. Use MongoDB to update the password:
   ```bash
   mongosh legaliq
   db.users.updateOne(
     { email: "yogemca@gmail.com" },
     { $set: { password: "$2a$10$hashedPasswordHere" } }
   )
   ```

2. Or register a new lawyer account with known credentials

## Database Query

To check all lawyer accounts:
```bash
mongosh legaliq --eval "db.users.find({role: 'lawyer'}).pretty()"
```

To check lawyer records:
```bash
mongosh legaliq --eval "db.lawyers.find().pretty()"
```
