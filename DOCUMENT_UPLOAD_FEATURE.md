# Document Upload Feature - Implementation Guide

## Overview
Complete document upload system for consultations/appointments allowing both clients and professionals (lawyers/tax consultants/auditors) to upload, view, download, and delete documents.

## Features Implemented

### ✅ Backend Implementation

#### 1. Database Schema Updates

**Consultation Model** (`backend/models/Consultation.js`)
- Added `documents` array with the following fields:
  - `originalName`: Original filename
  - `mimetype`: File MIME type
  - `size`: File size in bytes
  - `uploadedBy`: 'client' or 'professional'
  - `uploadedAt`: Upload timestamp
  - `data`: Base64 encoded file data (stored in MongoDB)
  - `visibleTo`: 'both', 'client-only', or 'professional-only'
  - `isHidden`: Boolean flag to hide documents

**User Model** (`backend/models/User.js`)
- Added `storageLimit` object:
  - `maxFileSize`: Maximum file size per upload (default: 5MB)
  - `maxConsultationStorage`: Maximum storage per consultation (default: 50MB)
  - `maxTotalStorage`: Maximum total storage across all consultations (default: 500MB)
- Added `features` object:
  - `documentUpload`: Boolean to enable/disable document upload feature per user
  - `videoConsultation`: Boolean for video consultation feature

#### 2. API Endpoints

**Base URL**: `/api/consultations/:id/documents`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/:id/documents` | Get all documents for a consultation | Yes |
| POST | `/:id/documents` | Upload a document to consultation | Yes |
| GET | `/:id/documents/:documentId` | Download a specific document | Yes |
| DELETE | `/:id/documents/:documentId` | Delete a document | Yes (uploader only) |

#### 3. File Upload Configuration

**Supported File Types**:
- **Documents**: PDF, DOC, DOCX, TXT, CSV
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG
- **Archives**: ZIP, RAR

**Storage Method**: Base64 encoding in MongoDB (no filesystem storage)

**File Size Limits** (customizable per user in database):
- Per file: 5MB (default)
- Per consultation: 50MB (default)
- Total per user: 500MB (default)

#### 4. Security & Authorization

**Access Control**:
- Only consultation participants (client or assigned professional) can access documents
- Users can only delete documents they uploaded
- Feature can be enabled/disabled per user via `user.features.documentUpload`
- Storage limits are enforced per user from database

**Validation**:
- File type validation (MIME type checking)
- File size validation (per-file and per-consultation limits)
- Total storage validation across all user consultations
- Authorization checks for all operations

#### 5. Controller Functions

**`addDocument`** (`backend/controllers/consultationController.js`)
- Validates file type and size
- Checks user's document upload feature flag
- Verifies user authorization
- Enforces storage limits (per-file, per-consultation, total)
- Converts file to base64
- Saves to MongoDB
- Returns storage info

**`downloadDocument`**
- Verifies user authorization
- Retrieves document from MongoDB
- Returns base64 data with metadata

**`deleteDocument`**
- Verifies user authorization
- Checks if user uploaded the document
- Removes from MongoDB
- Frees up storage space

**`getDocuments`**
- Lists all documents for a consultation
- Returns metadata only (no base64 data for performance)
- Includes file info: name, size, type, uploader, timestamp

## API Usage Examples

### 1. Upload Document

```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);

const response = await fetch(`/api/consultations/${consultationId}/documents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.storageInfo); // Shows storage usage
```

### 2. Get All Documents

```javascript
const response = await fetch(`/api/consultations/${consultationId}/documents`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { documents } = await response.json();
// Returns array of document metadata (without base64 data)
```

### 3. Download Document

```javascript
const response = await fetch(
  `/api/consultations/${consultationId}/documents/${documentId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const { document } = await response.json();
// document.data contains base64 string
// document.mimetype contains MIME type
// document.originalName contains filename

// Convert base64 to blob and download
const blob = base64ToBlob(document.data, document.mimetype);
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = document.originalName;
a.click();
```

### 4. Delete Document

```javascript
const response = await fetch(
  `/api/consultations/${consultationId}/documents/${documentId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log(result.message); // "Document deleted successfully"
```

## Storage Management

### Per-User Customization

Admins can customize storage limits for each user in the database:

```javascript
// Update user storage limits
await User.findByIdAndUpdate(userId, {
  storageLimit: {
    maxFileSize: 10 * 1024 * 1024, // 10MB per file
    maxConsultationStorage: 100 * 1024 * 1024, // 100MB per consultation
    maxTotalStorage: 1024 * 1024 * 1024 // 1GB total
  }
});
```

### Enable/Disable Feature

```javascript
// Disable document upload for a user
await User.findByIdAndUpdate(userId, {
  'features.documentUpload': false
});
```

## Response Formats

### Upload Success Response

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "_id": "doc123",
    "originalName": "contract.pdf",
    "mimetype": "application/pdf",
    "size": 1048576,
    "uploadedBy": "client",
    "uploadedAt": "2026-03-12T08:00:00.000Z"
  },
  "storageInfo": {
    "consultation": {
      "used": 2097152,
      "remaining": 50331648,
      "total": 52428800,
      "usedMB": "2.00",
      "remainingMB": "48.00"
    },
    "total": {
      "used": 10485760,
      "remaining": 514850816,
      "total": 524288000,
      "usedMB": "10.00",
      "remainingMB": "490.00"
    }
  }
}
```

### Error Responses

**File Too Large**:
```json
{
  "success": false,
  "message": "File size exceeds your 5.00MB per file limit"
}
```

**Consultation Storage Exceeded**:
```json
{
  "success": false,
  "message": "Consultation storage limit exceeded. This consultation has 2.50MB remaining of 50.00MB total storage.",
  "currentStorage": 49807360,
  "maxStorage": 52428800,
  "remainingStorage": 2621440
}
```

**Feature Disabled**:
```json
{
  "success": false,
  "message": "Document upload feature is disabled for your account. Please contact support."
}
```

## Frontend Integration (To Be Implemented)

### Required Components

1. **Document Upload Button**
   - File input with drag-and-drop support
   - Progress indicator
   - File type and size validation

2. **Document List**
   - Display all documents with metadata
   - Show uploader, timestamp, file size
   - Download and delete buttons

3. **Storage Indicator**
   - Show current storage usage
   - Visual progress bar
   - Remaining space display

4. **Helper Functions**
   - `base64ToBlob()`: Convert base64 to downloadable blob
   - `formatFileSize()`: Display human-readable file sizes
   - `getFileIcon()`: Show appropriate icon for file type

## Database Considerations

### Pros of Base64 Storage in MongoDB:
- ✅ No filesystem management needed
- ✅ Automatic backup with database backups
- ✅ Easy deployment (no separate file storage)
- ✅ Transactional consistency
- ✅ Works with MongoDB Atlas

### Cons:
- ❌ ~33% size increase due to base64 encoding
- ❌ Not suitable for very large files (>10MB)
- ❌ Slower than filesystem for large files

### Recommendations:
- Current implementation is perfect for documents up to 5MB
- For larger files or high-volume usage, consider:
  - AWS S3 / Google Cloud Storage
  - GridFS (MongoDB's file storage system)
  - Separate file server

## Testing Checklist

- [ ] Upload PDF document
- [ ] Upload Word document
- [ ] Upload Excel spreadsheet
- [ ] Upload image file
- [ ] Test file size limit (try uploading >5MB file)
- [ ] Test consultation storage limit
- [ ] Test total storage limit
- [ ] Download document and verify content
- [ ] Delete own document
- [ ] Try to delete someone else's document (should fail)
- [ ] Try to access documents from unauthorized consultation (should fail)
- [ ] Test with feature disabled
- [ ] Test multiple uploads to same consultation
- [ ] Test uploads from both client and professional

## Next Steps

1. ✅ Backend API implementation - COMPLETE
2. ✅ Database schema updates - COMPLETE
3. ✅ Security and authorization - COMPLETE
4. ⏳ Frontend UI implementation - PENDING
5. ⏳ Testing and validation - PENDING

## Files Modified

### Backend:
- `backend/models/Consultation.js` - Added documents array
- `backend/models/User.js` - Added storage limits and feature flags
- `backend/controllers/consultationController.js` - Added document handlers
- `backend/routes/consultationRoutes.js` - Added document routes
- `backend/package.json` - Added multer dependency

### Configuration:
- `backend/.env.example` - Added storage limit examples (optional)

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify user has `features.documentUpload` enabled
- Check storage limits in user document
- Ensure file types are in allowed list
- Verify consultation exists and user is authorized
