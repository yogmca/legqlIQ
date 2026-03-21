# Articles Feature - Complete Implementation Guide

## 🎯 Overview

A comprehensive articles system for LegalIQ where professionals (lawyers, tax consultants, auditors) can submit articles, admins can approve/decline them, and users can read and interact with published articles.

## 📋 Features Implemented

### 1. Backend Components

#### Article Schema (`backend/models/Article.js`)
- Title, content, summary, image
- Author information (userId, name, profession, profileImage)
- Category (legal, tax, audit, general, case_study, news)
- Tags for better discoverability
- Approval workflow (pending, approved, declined)
- External article support (link to other sites)
- Views, likes, comments tracking
- Featured articles support
- Auto-calculated read time

#### Article Controller (`backend/controllers/articleController.js`)
- Create article (with image upload)
- Get approved articles (public)
- Get featured articles
- Get article by ID
- Get user's articles
- Get pending articles (admin only)
- Approve/decline articles (admin only)
- Update article
- Delete article
- Like/unlike article
- Add comments
- Get all articles (admin only)

#### Article Routes (`backend/routes/articles.js`)
- Public routes: `/api/articles/approved`, `/api/articles/featured`, `/api/articles/:id`
- Protected routes: Create, update, delete, like, comment
- Admin routes: Approve, decline, get all/pending articles

#### Admin User Script (`backend/scripts/create-admin.js`)
- Creates admin user: yoggmca@gmail.com / Admin@123
- Can be run with: `node backend/scripts/create-admin.js`

### 2. Frontend Components

#### Admin Dashboard (`src/components/AdminDashboard.jsx`)
- View pending, approved, and declined articles
- Approve/decline articles with admin notes
- Create new articles (auto-approved)
- Delete articles
- Toggle featured status
- Add external articles from other sites

#### Article Submission Form (`src/components/ArticleSubmission.jsx`)
- Submit articles for approval
- Upload article images
- Add tags and categories
- Mark as external article
- View submitted articles status
- Delete own articles

#### Articles Listing Page (`src/components/ArticlesPage.jsx`)
- Browse all approved articles
- Filter by category
- Search articles
- Load more pagination
- Similar to Practo healthfeed design
- Click to view details or open external links

#### Article Detail View (`src/components/ArticleDetail.jsx`)
- Full article content
- Author information
- Like/unlike functionality
- Comment system
- Share functionality
- View count tracking
- Related tags

#### Homepage Integration (`src/components/Homepage.jsx`)
- Featured articles section
- Only shows if articles exist (no blank box)
- Shows top 3 featured articles
- Link to view all articles

### 3. Routes Added to App.jsx

```javascript
/articles - Articles listing page (public)
/articles/:id - Article detail view (public)
/submit-article - Article submission form (protected - professionals only)
/admin/dashboard - Admin dashboard (protected - admin only)
```

## 🚀 Getting Started

### 1. Create Admin User

```bash
cd karnataka-bar-association
node backend/scripts/create-admin.js
```

**Admin Credentials:**
- Email: yoggmca@gmail.com
- Password: Admin@123

### 2. Start Backend Server

```bash
cd backend
npm start
```

The backend will run on http://localhost:4000

### 3. Start Frontend

```bash
cd karnataka-bar-association
npm run dev
```

The frontend will run on http://localhost:5173

## 📝 Usage Guide

### For Professionals (Lawyers, Tax Consultants, Auditors)

1. **Login** to your professional account
2. Navigate to `/submit-article`
3. Fill in article details:
   - Title (max 200 characters)
   - Summary (max 500 characters)
   - Content (full article text)
   - Category
   - Tags (comma-separated)
   - Upload image (optional)
   - Mark as external if linking to another site
4. Submit for admin approval
5. Track status in "My Articles" section

### For Admin

1. **Login** with admin credentials (yoggmca@gmail.com / Admin@123)
2. Navigate to `/admin/dashboard`
3. **Review Pending Articles:**
   - View article details
   - Add admin notes
   - Approve or decline
4. **Create Articles:**
   - Click "Create Article"
   - Fill in details
   - Articles are auto-approved
   - Can mark as featured
5. **Manage Articles:**
   - Toggle featured status
   - Delete articles
   - View all articles by status

### For Users

1. **Browse Articles:**
   - Visit `/articles` or click "View All Articles" from homepage
   - Filter by category
   - Search articles
   - Load more to see additional articles

2. **Read Articles:**
   - Click on any article card
   - View full content
   - Like articles (requires login)
   - Add comments (requires login)
   - Share articles

3. **Homepage:**
   - Featured articles appear automatically if available
   - No blank section if no articles exist

## 🎨 Design Features

### Articles Listing Page
- Inspired by Practo healthfeed
- Card-based layout
- Category badges
- Author information
- View count, likes, read time
- External article indicators
- Responsive grid layout

### Article Detail Page
- Clean, readable typography
- Author profile section
- Like and share buttons
- Comment system
- Related tags
- External source attribution

### Admin Dashboard
- Tab-based interface (Pending, Approved, Declined)
- Inline article creation
- Quick approve/decline actions
- Featured article management
- Admin notes for declined articles

## 🔒 Security & Permissions

### Role-Based Access:
- **Public:** View approved articles, article details
- **Users:** Like and comment on articles
- **Professionals:** Submit articles, view own submissions
- **Admin:** Full access - approve, decline, create, delete, feature

### File Upload:
- Images only (jpeg, jpg, png, gif, webp)
- Max size: 5MB
- Stored in `backend/uploads/articles/`
- Served via `/uploads` route

## 📊 Database Schema

### Article Model Fields:
- `title` - Article title
- `content` - Full article text
- `summary` - Brief description
- `image` - Image URL/path
- `author` - Author details (userId, name, profession, profileImage)
- `category` - Article category
- `tags` - Array of tags
- `status` - pending/approved/declined
- `isExternal` - Boolean for external articles
- `externalUrl` - URL to external article
- `externalSource` - Source name
- `views` - View count
- `likes` - Array of user IDs
- `comments` - Array of comment objects
- `adminNotes` - Admin feedback
- `approvedBy` - Admin user ID
- `approvedAt` - Approval timestamp
- `publishedAt` - Publication timestamp
- `featured` - Boolean for featured status
- `readTime` - Calculated read time in minutes

## 🧪 Testing Checklist

### Backend Testing:
- [ ] Admin user created successfully
- [ ] Backend server running on port 4000
- [ ] Article routes accessible
- [ ] File upload working

### Frontend Testing:
- [ ] Frontend running on port 5173
- [ ] All routes accessible
- [ ] Components rendering correctly

### Feature Testing:
- [ ] Admin can login
- [ ] Admin can create articles
- [ ] Admin can approve/decline articles
- [ ] Professionals can submit articles
- [ ] Users can view articles
- [ ] Users can like/comment (when logged in)
- [ ] Featured articles show on homepage
- [ ] External articles link correctly
- [ ] Search and filters work
- [ ] Image upload works

## 🐛 Troubleshooting

### Port Already in Use:
```bash
lsof -ti:5173 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Admin User Already Exists:
The script will update existing user to admin role

### Images Not Showing:
- Check `backend/uploads/articles/` directory exists
- Verify backend serves `/uploads` route
- Check image paths in database

### Articles Not Appearing:
- Verify articles are approved (status: 'approved')
- Check MongoDB connection
- Verify API endpoints responding

## 📱 Mobile Responsiveness

All components are fully responsive:
- Articles grid adapts to screen size
- Admin dashboard works on mobile
- Article detail view optimized for reading
- Homepage articles section responsive

## 🎯 Next Steps

1. Test the complete workflow locally
2. Create sample articles
3. Test approval workflow
4. Verify all features working
5. Push to repository
6. Deploy to production

## 📞 Support

For issues or questions:
- Check console logs for errors
- Verify MongoDB connection
- Ensure all dependencies installed
- Check backend and frontend are running

---

**Created:** March 21, 2026
**Version:** 1.0.0
**Status:** Ready for Testing
