# Dynamic Location Management - Setup Guide

## Overview
The system now automatically adds locations to the search panel when professionals register. Locations are stored in MongoDB and fetched dynamically by the frontend.

## How It Works

### 1. **Automatic Location Addition**
When a professional (lawyer/tax-consultant/auditor) registers:
- Their location is automatically saved to the `locations` collection in MongoDB
- The professional count for that location is incremented
- The location immediately appears in the search panel dropdown

### 2. **Location Updates**
When a professional updates their location:
- The old location's professional count is decremented
- The new location is added (or its count is incremented)
- Search panel reflects the changes

## Initial Setup (One-Time)

Since you already have professionals registered in the database, you need to initialize the locations collection with their existing locations.

### On EC2 Server:

```bash
# SSH into your EC2 server
ssh -i your-key.pem ec2-user@your-server-ip

# Navigate to backend directory
cd /path/to/karnataka-bar-association/backend

# Run the initialization script
node scripts/initialize-locations.js
```

This will:
- Scan all existing professionals in the database
- Extract their unique locations
- Create location records with professional counts
- Display a summary of all locations

### Alternative: Add Specific Missing Locations

If you just need to add specific locations (like "New Delhi/ NCR"):

```bash
# On EC2 server
cd /path/to/karnataka-bar-association/backend
node scripts/add-missing-locations.js
```

## Verification

### Check Locations in Database
```bash
# On EC2, connect to MongoDB and check
mongosh "your-mongodb-atlas-connection-string"

use legaliq
db.locations.find().pretty()
```

### Check API Endpoint
```bash
curl https://legaliq.in/api/locations
```

Should return:
```json
{
  "success": true,
  "locations": ["Bangalore", "New Delhi", "Mumbai", ...],
  "total": 15
}
```

### Check Frontend
1. Visit https://legaliq.in
2. Open the location dropdown in the search/filter section
3. You should see all cities where professionals are registered

## Troubleshooting

### Location Not Showing Up

**Problem**: A professional registered with location "New Delhi/ NCR" but it doesn't appear in the dropdown.

**Solution**:
1. Run the initialization script on EC2 server (see above)
2. Or, the professional can update their profile (even without changing location) - this will trigger the auto-add

### Database Connection Error

**Problem**: Scripts fail with "ECONNREFUSED" error

**Cause**: Scripts are trying to connect to localhost MongoDB instead of MongoDB Atlas

**Solution**: 
- Run scripts on EC2 server where `.env` has the correct `MONGODB_URI`
- Or update your local `.env` with MongoDB Atlas connection string

### Locations Not Loading in Frontend

**Problem**: Frontend shows default locations only

**Check**:
1. API endpoint is working: `curl https://legaliq.in/api/locations`
2. Browser console for errors
3. Network tab to see if API call is being made

## Files Modified

1. **Backend**:
   - `backend/models/Location.js` - Location database model
   - `backend/controllers/authController.js` - Auto-add location on registration
   - `backend/server.js` - API endpoint to fetch locations
   - `backend/scripts/initialize-locations.js` - Initialize from existing data
   - `backend/scripts/add-missing-locations.js` - Add specific locations

2. **Frontend**:
   - `src/components/FilterSection.jsx` - Fetch locations from API

## Commands Summary

```bash
# Initialize all locations from existing professionals (run on EC2)
node backend/scripts/initialize-locations.js

# Add specific missing locations (run on EC2)
node backend/scripts/add-missing-locations.js

# Check locations via API
curl https://legaliq.in/api/locations

# Check MongoDB directly
mongosh "mongodb-atlas-uri"
use legaliq
db.locations.find()
```

## Future Behavior

Going forward:
- ✅ New professional registers → Location auto-added
- ✅ Professional updates location → Counts adjusted automatically
- ✅ Frontend always shows current locations from database
- ✅ No manual intervention needed
