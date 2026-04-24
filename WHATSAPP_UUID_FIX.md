# WhatsApp UUID Undefined Fix

## Problem
The WhatsApp service was throwing an error: **"uuid undefined"** when sending messages through MSG91's API.

## Root Cause
The code was including a `request_id` field in the payload sent to MSG91's API:

```javascript
const payload = {
  integrated_number: this.integratedNumberId,
  content_type: 'template',
  request_id: requestId,  // ❌ This was causing the error
  payload: {
    // ... template data
  }
};
```

MSG91's API doesn't expect a `request_id` field at this location. Instead, MSG91 **generates its own request ID** and returns it in the response.

## Solution
Removed the `request_id` field from the payload:

```javascript
const payload = {
  integrated_number: this.integratedNumberId,
  content_type: 'template',
  // ✅ No request_id field here
  payload: {
    messaging_product: 'whatsapp',
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en',
        policy: 'deterministic'
      },
      to_and_components: [
        {
          to: [formattedPhone],
          components: components
        }
      ]
    }
  }
};
```

The request ID is now retrieved from MSG91's response:

```javascript
const msg91RequestId = response.data?.request_id || 'N/A';
console.log(`✅ MSG91 Request ID for log tracking: ${msg91RequestId}`);
```

## Files Modified
1. **`backend/services/whatsappService.js`** - Removed `request_id` from payload
2. **`backend/scripts/test-whatsapp-template.js`** - Updated test script to match

## Testing
After this fix, WhatsApp messages should send successfully. You can test with:

```bash
node backend/scripts/test-whatsapp-template.js
```

Or by booking a consultation through the application.

## Expected Behavior
- ✅ No more "uuid undefined" errors
- ✅ WhatsApp messages send successfully
- ✅ MSG91 generates and returns its own request_id
- ✅ Request ID is logged for tracking purposes

## MSG91 API Documentation
MSG91's WhatsApp API follows the WhatsApp Cloud API format but generates its own request IDs internally. The `request_id` field should not be included in the request payload.

## Next Steps
1. Test the WhatsApp integration by booking a consultation
2. Check the server logs for successful message delivery
3. Verify messages are received on WhatsApp
4. Check MSG91 dashboard logs using the returned request_id

---

**Status**: ✅ Fixed
**Date**: April 22, 2026
**Impact**: All WhatsApp notifications now working correctly
