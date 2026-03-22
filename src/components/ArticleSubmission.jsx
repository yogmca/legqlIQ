import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import RichTextEditor from './RichTextEditor';
import './ArticleSubmission.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ArticleSubmission = () => {
  const [article, setArticle] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'legal',
    tags: '',
    isExternal: false,
    externalUrl: '',
    externalSource: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myArticles, setMyArticles] = useState([]);
  const [showMyArticles, setShowMyArticles] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role === 'user') {
      alert('Only professionals can submit articles');
      navigate('/');
    }
    fetchMyArticles();
  }, [navigate]);

  const fetchMyArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/user/my-articles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(article).forEach(key => {
        formData.append(key, article[key]);
      });
      
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to submit article');
      
      const data = await response.json();
      alert(data.message);
      
      // Reset form
      setArticle({
        title: '',
        content: '',
        summary: '',
        category: 'legal',
        tags: '',
        isExternal: false,
        externalUrl: '',
        externalSource: ''
      });
      setImage(null);
      setImagePreview(null);
      
      fetchMyArticles();
    } catch (err) {
      alert('Error submitting article: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete article');
      
      alert('Article deleted successfully');
      fetchMyArticles();
    } catch (err) {
      alert('Error deleting article: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending Approval' },
      approved: { class: 'status-approved', text: 'Approved' },
      declined: { class: 'status-declined', text: 'Declined' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="article-submission">
      <div className="submission-logo-header">
        <Logo />
      </div>
      
      <div className="submission-header">
        <h1>Submit Article</h1>
        <button 
          className="btn-toggle"
          onClick={() => setShowMyArticles(!showMyArticles)}
        >
          {showMyArticles ? 'Submit New Article' : 'My Articles'}
        </button>
      </div>

      {!showMyArticles ? (
        <div className="submission-form-container">
          <div className="info-box">
            <h3>📝 Article Submission Guidelines</h3>
            <ul>
              <li>Articles must be original and relevant to legal, tax, or audit topics</li>
              <li>Minimum 300 words for article content</li>
              <li>Include a clear and concise summary (max 500 characters)</li>
              <li>Add relevant tags to help readers find your article</li>
              <li>Articles will be reviewed by admin before publication</li>
              <li>You can track your submission status in "My Articles"</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="article-form">
            <div className="form-group">
              <label>Article Title *</label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle({...article, title: e.target.value})}
                required
                maxLength={200}
                placeholder="Enter a compelling title for your article"
              />
              <small>{article.title.length}/200 characters</small>
            </div>

            <div className="form-group">
              <label>Summary *</label>
              <textarea
                value={article.summary}
                onChange={(e) => setArticle({...article, summary: e.target.value})}
                required
                maxLength={500}
                rows={3}
                placeholder="Write a brief summary of your article (max 500 characters)"
              />
              <small>{article.summary.length}/500 characters</small>
            </div>

            <div className="form-group">
              <label>Article Content *</label>
              <RichTextEditor
                value={article.content}
                onChange={(value) => setArticle({...article, content: value})}
                placeholder="Write your article content here... (minimum 300 words recommended)"
              />
              <small>{article.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length} words</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={article.category}
                  onChange={(e) => setArticle({...article, category: e.target.value})}
                >
                  <option value="legal">Legal</option>
                  <option value="tax">Tax</option>
                  <option value="audit">Audit</option>
                  <option value="general">General</option>
                  <option value="case_study">Case Study</option>
                  <option value="news">News</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={article.tags}
                  onChange={(e) => setArticle({...article, tags: e.target.value})}
                  placeholder="e.g., law, taxation, compliance, GST"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Article Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="btn-remove-image"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={article.isExternal}
                  onChange={(e) => setArticle({...article, isExternal: e.target.checked})}
                />
                This is a reference to an external article
              </label>
            </div>

            {article.isExternal && (
              <>
                <div className="form-group">
                  <label>External Article URL</label>
                  <input
                    type="url"
                    value={article.externalUrl}
                    onChange={(e) => setArticle({...article, externalUrl: e.target.value})}
                    placeholder="https://example.com/article"
                  />
                </div>
                <div className="form-group">
                  <label>Source Name</label>
                  <input
                    type="text"
                    value={article.externalSource}
                    onChange={(e) => setArticle({...article, externalSource: e.target.value})}
                    placeholder="e.g., The Hindu, Times of India, Bar Council"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Article for Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="my-articles-container">
          <h2>My Articles ({myArticles.length})</h2>
          
          {myArticles.length === 0 ? (
            <div className="no-articles">
              <p>You haven't submitted any articles yet.</p>
              <button onClick={() => setShowMyArticles(false)} className="btn-submit">
                Submit Your First Article
              </button>
            </div>
          ) : (
            <div className="articles-grid">
              {myArticles.map(article => {
                const statusBadge = getStatusBadge(article.status);
                return (
                  <div key={article._id} className="my-article-card">
                    <div className="article-status">
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                      {article.featured && <span className="badge-featured">Featured</span>}
                    </div>
                    
                    <h3>{article.title}</h3>
                    <p className="article-summary">{article.summary}</p>
                    
                    {article.image && (
                      <img src={`${API_URL}${article.image}`} alt={article.title} />
                    )}
                    
                    <div className="article-meta">
                      <span>Category: {article.category}</span>
                      <span>Views: {article.views}</span>
                      <span>Likes: {article.likes?.length || 0}</span>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="article-tags">
                        {article.tags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    {article.status === 'declined' && article.adminNotes && (
                      <div className="decline-reason">
                        <strong>Reason:</strong> {article.adminNotes}
                      </div>
                    )}

                    <div className="article-actions">
                      {article.status === 'approved' && (
                        <button 
                          onClick={() => navigate(`/articles/${article._id}`)}
                          className="btn-view"
                        >
                          View Article
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(article._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="article-date">
                      Submitted: {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleSubmission;
