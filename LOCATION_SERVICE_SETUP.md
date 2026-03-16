# 📍 Location Service Configuration Guide

## Current Setup: FREE Services (No API Key Required)

Your location detection is currently using **100% FREE services** that require no registration or API keys:

- ✅ **OpenStreetMap Nominatim** (Primary)
- ✅ **BigDataCloud** (Fallback)
- ✅ **Browser Geolocation API** (Built-in)

**Cost**: $0/month  
**Limits**: Fair use (sufficient for most applications)

---

## 🔄 How to Switch to Google Services (Optional)

If you want better accuracy or need higher request limits, you can easily switch to Google's Geocoding API.

### **Step 1: Get Google API Key**

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Create a Project** (if you don't have one):
   - Click "Select a project" → "New Project"
   - Name: "LegalIQ"
   - Click "Create"

3. **Enable Geocoding API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Geocoding API"
   - Click "Enable"

4. **Create API Key**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key (looks like: `AIzaSyD...`)

5. **Restrict API Key** (Recommended for security):
   - Click on your API key
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add: `https://legaliq.in/*` and `http://localhost:5173/*`
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose "Geocoding API"
   - Click "Save"

### **Step 2: Update Configuration**

Open: `src/components/SearchBar.jsx`

Find this section at the top:

```javascript
const GEOCODING_CONFIG = {
  provider: 'free', // ← Change this to 'google'
  googleApiKey: '', // ← Paste your API key here
  freeServices: {
    primary: 'nominatim',
    fallback: 'bigdatacloud'
  }
};
```

**Change to**:

```javascript
const GEOCODING_CONFIG = {
  provider: 'google', // ← Changed from 'free' to 'google'
  googleApiKey: 'AIzaSyD...your-actual-key...', // ← Your API key
  freeServices: {
    primary: 'nominatim',
    fallback: 'bigdatacloud'
  }
};
```

### **Step 3: Test**

1. Save the file
2. Refresh your website
3. Allow location access
4. Check browser console - you should see: "🌐 Using Google Geocoding API"

**That's it!** The switch is complete.

---

## 💰 Google Pricing

### **Free Tier**:
- **40,000 requests/month** - FREE
- Sufficient for most small to medium applications

### **Paid Tier** (after free tier):
- **$5 per 1,000 requests**
- Example: 100,000 requests/month = $300/month

### **Cost Calculator**:
```
Monthly Users: 10,000
Avg requests per user: 2 (page load + manual refresh)
Total requests: 20,000/month
Cost: $0 (within free tier)
```

---

## 🔄 Switching Back to Free Services

If you want to switch back to free services:

```javascript
const GEOCODING_CONFIG = {
  provider: 'free', // ← Change back to 'free'
  googleApiKey: '', // ← Can leave empty or keep for future use
  freeServices: {
    primary: 'nominatim',
    fallback: 'bigdatacloud'
  }
};
```

---

## 📊 Service Comparison

| Feature | Free Services | Google Geocoding |
|---------|--------------|------------------|
| **Cost** | $0 | $0 (40K/month), then $5/1K |
| **API Key** | Not required | Required |
| **Accuracy** | Good (90-95%) | Excellent (98-99%) |
| **Speed** | Fast (200-500ms) | Very Fast (100-300ms) |
| **Rate Limit** | 1 req/sec (Nominatim) | 50 req/sec |
| **Coverage** | Global | Global |
| **Reliability** | Good | Excellent (99.9% uptime) |
| **Setup Time** | 0 minutes | 10 minutes |

---

## 🛡️ Security Best Practices

### **For Google API Key**:

1. **Never commit API key to Git**:
   ```javascript
   // ❌ BAD - Hardcoded key
   googleApiKey: 'AIzaSyD...'
   
   // ✅ GOOD - Use environment variable
   googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY
   ```

2. **Use Environment Variables**:
   
   Create `.env` file:
   ```env
   VITE_GOOGLE_API_KEY=AIzaSyD...your-key...
   ```
   
   Update `SearchBar.jsx`:
   ```javascript
   const GEOCODING_CONFIG = {
     provider: 'google',
     googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
     freeServices: {
       primary: 'nominatim',
       fallback: 'bigdatacloud'
     }
   };
   ```

3. **Restrict API Key**:
   - Add domain restrictions in Google Cloud Console
   - Only allow your domain: `legaliq.in`
   - Restrict to Geocoding API only

4. **Monitor Usage**:
   - Check Google Cloud Console regularly
   - Set up billing alerts
   - Monitor for unusual activity

---

## 🔧 Advanced Configuration

### **Custom Fallback Strategy**:

```javascript
const GEOCODING_CONFIG = {
  provider: 'google',
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  
  // Fallback to free services if Google fails
  enableFallback: true,
  
  freeServices: {
    primary: 'nominatim',
    fallback: 'bigdatacloud'
  },
  
  // Cache settings
  cacheEnabled: true,
  cacheDuration: 300000, // 5 minutes
  
  // Timeout settings
  timeout: 10000 // 10 seconds
};
```

---

## 🧪 Testing Different Providers

### **Test Free Services**:
```javascript
provider: 'free'
```
Console output: `🆓 Using Free Geocoding (OpenStreetMap)`

### **Test Google Services**:
```javascript
provider: 'google'
```
Console output: `🌐 Using Google Geocoding API`

### **Test Fallback**:
1. Set provider to 'google'
2. Use invalid API key
3. Should automatically fallback to free services
4. Console output: `⚠️ Falling back to free service`

---

## 📈 Recommended Setup by Scale

### **Small Scale** (< 10K users/month):
```javascript
provider: 'free'
```
**Cost**: $0/month

### **Medium Scale** (10K - 100K users/month):
```javascript
provider: 'google'
```
**Cost**: $0 - $300/month (depending on usage)

### **Large Scale** (> 100K users/month):
```javascript
provider: 'google'
```
**Cost**: $300 - $1,500/month
**Consider**: Caching, rate limiting, CDN

---

## 🆘 Troubleshooting

### **Google API Not Working**:

1. **Check API Key**:
   - Verify key is correct
   - Check if Geocoding API is enabled
   - Verify domain restrictions

2. **Check Console Errors**:
   ```
   Error: Google Geocoding failed
   → Check API key and billing
   
   Error: REQUEST_DENIED
   → Enable Geocoding API in console
   
   Error: OVER_QUERY_LIMIT
   → Exceeded free tier, enable billing
   ```

3. **Verify Billing**:
   - Go to: https://console.cloud.google.com/billing
   - Ensure billing account is linked
   - Check if free tier is exhausted

### **Free Services Not Working**:

1. **Rate Limiting**:
   - Nominatim: Max 1 request/second
   - Solution: Add delay between requests

2. **CORS Errors**:
   - Should not occur (services support CORS)
   - If it does, use proxy server

---

## 📚 Additional Resources

### **Google Geocoding API**:
- Documentation: https://developers.google.com/maps/documentation/geocoding
- Pricing: https://developers.google.com/maps/billing/gmp-billing
- Console: https://console.cloud.google.com/

### **OpenStreetMap Nominatim**:
- Documentation: https://nominatim.org/release-docs/latest/
- Usage Policy: https://operations.osmfoundation.org/policies/nominatim/

### **BigDataCloud**:
- Documentation: https://www.bigdatacloud.com/docs/api/reverse-geocoding
- Free Tier: 10,000 requests/month

---

## ✅ Quick Start Checklist

### **Using Free Services** (Current Setup):
- [x] No setup required
- [x] Works immediately
- [x] $0 cost forever

### **Switching to Google**:
- [ ] Create Google Cloud account
- [ ] Enable Geocoding API
- [ ] Create API key
- [ ] Restrict API key (security)
- [ ] Update `GEOCODING_CONFIG.provider` to 'google'
- [ ] Add API key to `GEOCODING_CONFIG.googleApiKey`
- [ ] Test in browser
- [ ] Monitor usage in Google Console

---

*Last Updated: March 2026*  
*Version: 1.0*  
*Maintained by: LegalIQ Development Team*
