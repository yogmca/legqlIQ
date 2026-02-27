# Fix Hardcoded Localhost URLs - Complete

## Problem
Multiple frontend components were using hardcoded `http://localhost:4000` URLs instead of the environment variable `VITE_API_URL`, causing API calls to fail on AWS deployment.

## Files Fixed

### 1. ✅ Register.jsx
**Location**: `src/components/Register.jsx`
- Added: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- Fixed registration endpoints to use `${API_URL}/auth/register` and `${API_URL}/auth/register-lawyer`

### 2. ✅ VideoConsultationList.jsx
**Location**: `src/components/VideoConsultationList.jsx`
- Added: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- Fixed: `/consultations/create-order` endpoint
- Fixed: `/consultations/verify-payment` endpoint

### 3. ✅ App.jsx
**Location**: `src/App.jsx`
- Added: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- Fixed: `/consultations/${id}` GET endpoint
- Fixed: `/consultations/${id}` PATCH endpoint

### 4. ✅ LawyerCard.jsx
**Location**: `src/components/LawyerCard.jsx`
- Added: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- Fixed: `/consultations` POST endpoint

### 5. ✅ AppointmentManager.jsx
**Location**: `src/components/AppointmentManager.jsx`
- Added: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- Fixed: `/consultations` GET endpoint
- Fixed: `/consultations/${id}` PATCH endpoint
- Fixed: `/consultations/${id}` DELETE endpoint

### 6. ✅ Login.jsx
**Location**: `src/components/Login.jsx`
- Already using: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- No changes needed ✓

### 7. ✅ ConsultationForm.jsx
**Location**: `src/components/ConsultationForm.jsx`
- Already using: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';`
- No changes needed ✓

### 8. ✅ VideoConsultation.jsx
**Location**: `src/components/VideoConsultation.jsx`
- Already using: `const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';`
- No changes needed ✓

## Environment Configuration

### Frontend .env (on AWS)
```env
VITE_API_URL=http://13.62.225.158:4000/api
VITE_SOCKET_URL=http://13.62.225.158:4000
VITE_RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
VITE_ENABLE_WEBRTC=true
```

### Backend .env (on AWS)
```env
PORT=4000
CLIENT_URL=http://13.62.225.158:5173
MONGODB_URI=mongodb+srv://...
```

## Deployment Steps

### On AWS EC2:

1. **Pull latest code**:
   ```bash
   cd ~/legqlIQ
   git pull origin main
   ```

2. **Verify .env files exist**:
   ```bash
   # Check frontend .env
   cat ~/legqlIQ/.env
   
   # Check backend .env
   cat ~/legqlIQ/backend/.env
   ```

3. **If .env files are missing, create them**:
   ```bash
   # Frontend .env
   cat > ~/legqlIQ/.env << 'EOF'
   VITE_API_URL=http://13.62.225.158:4000/api
   VITE_SOCKET_URL=http://13.62.225.158:4000
   VITE_RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
   VITE_ENABLE_WEBRTC=true
   EOF
   
   # Backend .env
   cat > ~/legqlIQ/backend/.env << 'EOF'
   PORT=4000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://yogmca_db_user:Diya2012@legaliq.b4xrthx.mongodb.net/legaliq?retryWrites=true&w=majority&appName=LegalIQ
   CLIENT_URL=http://13.62.225.158:5173
   SESSION_SECRET=legaliq-secret-key-change-in-production-2026
   RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
   RAZORPAY_KEY_SECRET=9cjbp0rh7dZHIwDa33Eq1wE6
   EOF
   ```

4. **Rebuild frontend** (Vite needs rebuild for env vars):
   ```bash
   cd ~/legqlIQ
   npm run build
   ```

5. **Restart services**:
   ```bash
   pm2 restart all
   ```

6. **Verify services are running**:
   ```bash
   pm2 status
   pm2 logs
   ```

## Testing

### Test Registration
```bash
# From your local machine or AWS
curl -X POST http://13.62.225.158:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "client"
  }'
```

### Test Lawyers Endpoint
```bash
curl http://13.62.225.158:4000/api/lawyers?limit=5
```

### Test from Browser
1. Open: `http://13.62.225.158:5173`
2. Try to register a new user
3. Check browser console for any errors
4. Verify API calls go to `13.62.225.158:4000` not `localhost:4000`

## Verification Checklist

- [ ] Frontend .env file exists with correct VITE_API_URL
- [ ] Backend .env file exists with correct CLIENT_URL
- [ ] Frontend rebuilt after .env changes
- [ ] PM2 services restarted
- [ ] Registration works from browser
- [ ] Login works from browser
- [ ] Lawyers list loads correctly
- [ ] Video consultation booking works
- [ ] No localhost URLs in browser network tab

## Common Issues

### Issue 1: Registration still fails
**Solution**: Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue 2: CORS errors
**Solution**: Verify backend CLIENT_URL matches frontend URL exactly

### Issue 3: 404 errors
**Solution**: Check if backend is running on port 4000:
```bash
netstat -tulpn | grep 4000
pm2 logs backend
```

### Issue 4: Environment variables not working
**Solution**: Rebuild frontend after changing .env:
```bash
cd ~/legqlIQ
npm run build
pm2 restart frontend
```

## Benefits of This Fix

✅ **Environment-aware**: Uses correct API URL based on environment
✅ **Flexible**: Easy to switch between local dev and production
✅ **Maintainable**: Single source of truth in .env file
✅ **Scalable**: Works with any domain/IP by changing .env only
✅ **No code changes**: Update deployment without touching code

## Future Improvements

1. **Use Domain Names**: Replace IP with proper domain (e.g., api.legaliq.com)
2. **HTTPS**: Enable SSL/TLS for secure connections
3. **Environment Detection**: Auto-detect environment and use appropriate URLs
4. **API Gateway**: Use a reverse proxy (nginx) for better routing
5. **CDN**: Serve static frontend from CDN for better performance

## Summary

All hardcoded `localhost:4000` URLs have been replaced with environment variables. The application now correctly uses the AWS server IP (`13.62.225.158:4000`) when deployed, while still working with `localhost:4000` during local development.

**Total files modified**: 5
- Register.jsx
- VideoConsultationList.jsx  
- App.jsx
- LawyerCard.jsx
- AppointmentManager.jsx

**Files already correct**: 3
- Login.jsx
- ConsultationForm.jsx
- VideoConsultation.jsx
