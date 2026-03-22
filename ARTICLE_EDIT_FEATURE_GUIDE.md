# Article Edit & Rich Text Editor Feature Guide

## Overview
This guide explains how to implement article editing functionality for both admins and users, along with a rich text editor for better content creation.

## Features to Implement

### 1. Edit Functionality for Admin
- **Location**: AdminDashboard.jsx
- **Capabilities**:
  - Edit any article (title, content, summary, category, tags)
  - Change article type (external ↔ internal)
  - Update images
  - Toggle featured status
  - Changes are saved immediately (no re-approval needed)

### 2. Edit Functionality for Users/Professionals
- **Location**: New component "MyArticles.jsx" or Profile.jsx
- **Capabilities**:
  - View all their submitted articles
  - Edit their own articles
  - Resubmit for approval (status changes to 'pending')
  - Cannot edit approved articles without resubmission

### 3. Rich Text Editor Integration
- **Library**: React Quill (recommended) or TinyMCE
- **Features**:
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings (H1, H2, H3)
  - Text colors and background colors
  - Lists (ordered, unordered)
  - Links
  - Images (inline and upload)
  - Tables
  - Code blocks
  - Text alignment
  - Undo/Redo

## Implementation Steps

### Step 1: Install Rich Text Editor
```bash
npm install react-quill quill
npm install react-quill@latest
```

### Step 2: Update Backend (Already Done)
The backend already supports article updates via:
- `PUT /api/articles/:id` - Update article
- The update endpoint handles FormData with images

### Step 3: Create Rich Text Editor Component
Create `src/components/RichTextEditor.jsx`:
```javascript
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    [{ 'table': [] }],
    ['clean']
  ]
};

const RichTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
    />
  );
};

export default RichTextEditor;
```

### Step 4: Update AdminDashboard.jsx
Add edit mode state and form:
```javascript
const [editingArticle, setEditingArticle] = useState(null);

const handleEdit = (article) => {
  setEditingArticle({
    ...article,
    tags: article.tags.join(', ')
  });
};

const handleUpdateArticle = async (e) => {
  e.preventDefault();
  // Similar to create but use PUT method
};
```

### Step 5: Create MyArticles Component
Create `src/components/MyArticles.jsx` for users to manage their articles:
- List all articles by current user
- Show status (pending/approved/declined)
- Edit button for each article
- Resubmit functionality

### Step 6: Update Article Display
Update ArticleDetail.jsx to render HTML content from rich text editor:
```javascript
<div dangerouslySetInnerHTML={{ __html: article.content }} />
```

## Database Considerations
- Article content will now be HTML instead of plain text
- Existing articles will still work (plain text renders as HTML)
- No schema changes needed

## Security Considerations
- Sanitize HTML content on backend to prevent XSS attacks
- Install: `npm install dompurify isomorphic-dompurify`
- Sanitize before saving to database

## UI/UX Improvements
1. **Edit Mode Indicator**: Show clearly when editing vs creating
2. **Unsaved Changes Warning**: Warn before leaving page with unsaved changes
3. **Preview Mode**: Allow users to preview article before submitting
4. **Image Upload Progress**: Show upload progress for images
5. **Auto-save**: Save drafts automatically

## Testing Checklist
- [ ] Admin can edit any article
- [ ] Admin changes save without re-approval
- [ ] Users can edit their own articles
- [ ] Edited articles go back to pending status
- [ ] Rich text formatting displays correctly
- [ ] Images upload and display properly
- [ ] Tables render correctly
- [ ] External/Internal article type can be changed
- [ ] Mobile responsive

## Next Steps
1. Install react-quill
2. Create RichTextEditor component
3. Add edit functionality to AdminDashboard
4. Create MyArticles component for users
5. Update article display to render HTML
6. Add HTML sanitization on backend
7. Test thoroughly

## Estimated Time
- Rich Text Editor Integration: 2-3 hours
- Admin Edit Functionality: 1-2 hours
- User Edit Functionality: 2-3 hours
- Testing & Bug Fixes: 2-3 hours
- **Total**: 7-11 hours

Would you like me to proceed with implementing these features?
