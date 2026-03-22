# Deploy Rich Text Editor to Production

## Error on Production:
```
[vite]: Rollup failed to resolve import "react-quill" from "/home/ubuntu/legqlIQ/src/components/RichTextEditor.jsx".
```

## Solution: Install Dependencies

### Step 1: SSH into Production Server
```bash
ssh ubuntu@your-server-ip
```

### Step 2: Navigate to Project Directory
```bash
cd ~/legqlIQ
```

### Step 3: Pull Latest Changes
```bash
git pull origin LegalIQ_prod
```

### Step 4: Install Frontend Dependencies
```bash
npm install --legacy-peer-deps
```

This will install:
- `react-quill@^2.0.0` - WYSIWYG rich text editor
- All other dependencies from package.json

### Step 5: Install Backend Dependencies
```bash
cd backend
npm install
```

This will install:
- `isomorphic-dompurify` - HTML sanitization for security
- All other backend dependencies

### Step 6: Build Frontend
```bash
cd ~/legqlIQ
npm run build
```

### Step 7: Restart Services
```bash
pm2 restart all
```

Or use your deployment script:
```bash
./deploy.sh
```

## Verification

### Check if react-quill is installed:
```bash
cd ~/legqlIQ
npm list react-quill
```

Should show:
```
karnataka-bar-association@0.0.0 /home/ubuntu/legqlIQ
└── react-quill@2.0.0
```

### Check if isomorphic-dompurify is installed:
```bash
cd ~/legqlIQ/backend
npm list isomorphic-dompurify
```

Should show:
```
backend@1.0.0 /home/ubuntu/legqlIQ/backend
└── isomorphic-dompurify@x.x.x
```

## Quick Fix Command (All in One):
```bash
cd ~/legqlIQ && \
git pull origin LegalIQ_prod && \
npm install --legacy-peer-deps && \
cd backend && npm install && cd .. && \
npm run build && \
pm2 restart all
```

## What This Adds:

### Frontend:
- Rich text editor component with full formatting toolbar
- WYSIWYG editing for articles
- Support for: headers, bold, italic, colors, lists, links, images, tables, code blocks

### Backend:
- HTML sanitization to prevent XSS attacks
- Safe HTML tag filtering
- Security for user-generated content

## Files Changed:
- `src/components/RichTextEditor.jsx` - New component
- `src/components/RichTextEditor.css` - Styling
- `src/components/AdminDashboard.jsx` - Uses rich text editor
- `src/components/ArticleSubmission.jsx` - Uses rich text editor
- `src/components/ArticleDetail.jsx` - Renders HTML content
- `backend/controllers/articleController.js` - HTML sanitization
- `package.json` - Added react-quill
- `backend/package.json` - Added isomorphic-dompurify
