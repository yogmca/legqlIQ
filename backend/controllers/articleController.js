const Article = require('../models/Article');
const User = require('../models/User');
const multer = require('multer');

// Configure multer for memory storage (Base64)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).single('image');

// Create a new article
exports.createArticle = async (req, res) => {
  try {
    console.log('=== Creating Article ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Has file:', !!req.file);
    
    const { title, content, summary, category, tags, isExternal, externalUrl, externalSource } = req.body;
    const userId = req.user._id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine profession
    let profession = 'admin';
    if (user.role === 'lawyer') profession = 'lawyer';
    else if (user.role === 'tax_consultant') profession = 'tax_consultant';
    else if (user.role === 'auditor') profession = 'auditor';

    const articleData = {
      title,
      content,
      summary,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      author: {
        userId: user._id,
        name: user.role === 'admin' ? 'LegalIQ' : user.name,
        profession,
        profileImage: user.profileImage || null
      },
      isExternal: isExternal || false,
      externalUrl: externalUrl || null,
      externalSource: externalSource || null,
      status: user.role === 'admin' ? 'approved' : 'pending'
    };

    // Convert image to Base64 if uploaded
    if (req.file) {
      articleData.image = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
      };
    }

    // If admin creates article, auto-approve and set publish date
    if (user.role === 'admin') {
      articleData.approvedBy = user._id;
      articleData.approvedAt = new Date();
      articleData.publishedAt = new Date();
    }

    const article = new Article(articleData);
    await article.save();

    res.status(201).json({
      message: user.role === 'admin' ? 'Article published successfully' : 'Article submitted for approval',
      article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Request file:', req.file);
    res.status(500).json({ message: 'Error creating article', error: error.message, details: error.stack });
  }
};

// Get all approved articles (public)
exports.getApprovedArticles = async (req, res) => {
  try {
    const { category, tag, search, limit = 10, page = 1 } = req.query;
    
    const query = { status: 'approved' };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const articles = await Article.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-adminNotes');

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
};

// Get featured articles for homepage
exports.getFeaturedArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'approved', featured: true })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select('-adminNotes -comments');

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ message: 'Error fetching featured articles', error: error.message });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id)
      .populate('comments.user', 'name profileImage');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Only show approved articles to non-admin users
    if (article.status !== 'approved' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Article not available' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
};

// Get articles by current user
exports.getMyArticles = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const articles = await Article.find({ 'author.userId': userId })
      .sort({ createdAt: -1 });

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
};

// Get pending articles (admin only)
exports.getPendingArticles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const articles = await Article.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching pending articles:', error);
    res.status(500).json({ message: 'Error fetching pending articles', error: error.message });
  }
};

// Approve article (admin only)
exports.approveArticle = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.status = 'approved';
    article.approvedBy = req.user._id;
    article.approvedAt = new Date();
    article.publishedAt = new Date();
    if (adminNotes) article.adminNotes = adminNotes;

    await article.save();

    res.json({ message: 'Article approved successfully', article });
  } catch (error) {
    console.error('Error approving article:', error);
    res.status(500).json({ message: 'Error approving article', error: error.message });
  }
};

// Decline article (admin only)
exports.declineArticle = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.status = 'declined';
    if (adminNotes) article.adminNotes = adminNotes;

    await article.save();

    res.json({ message: 'Article declined', article });
  } catch (error) {
    console.error('Error declining article:', error);
    res.status(500).json({ message: 'Error declining article', error: error.message });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, category, tags, featured } = req.body;
    const userId = req.user._id;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is author or admin
    if (article.author.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // Update fields
    if (title) article.title = title;
    if (content) article.content = content;
    if (summary) article.summary = summary;
    if (category) article.category = category;
    if (tags) article.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    
    // Convert image to Base64 if uploaded
    if (req.file) {
      article.image = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
      };
    }
    
    // Only admin can set featured
    if (featured !== undefined && req.user.role === 'admin') {
      article.featured = featured;
    }

    // If not admin and article was approved, set back to pending
    if (req.user.role !== 'admin' && article.status === 'approved') {
      article.status = 'pending';
    }

    await article.save();

    res.json({ message: 'Article updated successfully', article });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Error updating article', error: error.message });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is author or admin
    if (article.author.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await Article.findByIdAndDelete(id);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Error deleting article', error: error.message });
  }
};

// Like/Unlike article
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const likeIndex = article.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike
      article.likes.splice(likeIndex, 1);
    } else {
      // Like
      article.likes.push(userId);
    }

    await article.save();

    res.json({ 
      message: likeIndex > -1 ? 'Article unliked' : 'Article liked',
      likeCount: article.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Add comment to article
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.comments.push({
      user: userId,
      name: req.user.name,
      comment: comment.trim()
    });

    await article.save();

    // Populate the new comment
    await article.populate('comments.user', 'name profileImage');

    res.json({ 
      message: 'Comment added successfully',
      comment: article.comments[article.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Get all articles (admin only)
exports.getAllArticles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all articles:', error);
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
};

module.exports = { ...exports, upload };
