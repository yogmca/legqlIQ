import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'legal',
    tags: '',
    isExternal: false,
    externalUrl: '',
    externalSource: '',
    featured: false
  });
  const [articleImage, setArticleImage] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchArticles();
  }, [activeTab, navigate]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let endpoint = '';
      if (activeTab === 'pending') {
        endpoint = `${API_URL}/articles/admin/pending`;
      } else {
        endpoint = `${API_URL}/articles/admin/all?status=${activeTab}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      setArticles(data.articles || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/admin/${articleId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: adminNotes[articleId] || '' })
      });

      if (!response.ok) throw new Error('Failed to approve article');
      
      alert('Article approved successfully!');
      fetchArticles();
    } catch (err) {
      alert('Error approving article: ' + err.message);
    }
  };

  const handleDecline = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      const notes = adminNotes[articleId] || prompt('Reason for declining (optional):');
      
      const response = await fetch(`${API_URL}/articles/admin/${articleId}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: notes })
      });

      if (!response.ok) throw new Error('Failed to decline article');
      
      alert('Article declined');
      fetchArticles();
    } catch (err) {
      alert('Error declining article: ' + err.message);
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
      
      alert('Article deleted successfully!');
      fetchArticles();
    } catch (err) {
      alert('Error deleting article: ' + err.message);
    }
  };

  const handleToggleFeatured = async (article) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('featured', !article.featured);

      const response = await fetch(`${API_URL}/articles/${article._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update article');
      
      fetchArticles();
    } catch (err) {
      alert('Error updating article: ' + err.message);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(newArticle).forEach(key => {
        formData.append(key, newArticle[key]);
      });
      
      if (articleImage) {
        formData.append('image', articleImage);
      }

      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create article');
      
      alert('Article created and published successfully!');
      setShowCreateForm(false);
      setNewArticle({
        title: '',
        content: '',
        summary: '',
        category: 'legal',
        tags: '',
        isExternal: false,
        externalUrl: '',
        externalSource: '',
        featured: false
      });
      setArticleImage(null);
      fetchArticles();
    } catch (err) {
      alert('Error creating article: ' + err.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-logo-header">
        <Logo />
      </div>
      
      <div className="admin-header">
        <h1>Admin Dashboard - Article Management</h1>
        <button className="btn-create" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Create Article'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-article-form">
          <h2>Create New Article</h2>
          <form onSubmit={handleCreateArticle}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newArticle.title}
                onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>Summary *</label>
              <textarea
                value={newArticle.summary}
                onChange={(e) => setNewArticle({...newArticle, summary: e.target.value})}
                required
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Content *</label>
              <textarea
                value={newArticle.content}
                onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                required
                rows={10}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
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
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                  placeholder="e.g., law, taxation, compliance"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Article Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setArticleImage(file);
                  console.log('Image selected:', file);
                }}
              />
              {articleImage && (
                <div style={{marginTop: '10px', color: '#27ae60'}}>
                  ✓ Image selected: {articleImage.name} ({(articleImage.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newArticle.isExternal}
                  onChange={(e) => setNewArticle({...newArticle, isExternal: e.target.checked})}
                />
                External Article
              </label>
            </div>

            {newArticle.isExternal && (
              <>
                <div className="form-group">
                  <label>External URL</label>
                  <input
                    type="url"
                    value={newArticle.externalUrl}
                    onChange={(e) => setNewArticle({...newArticle, externalUrl: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>External Source</label>
                  <input
                    type="text"
                    value={newArticle.externalSource}
                    onChange={(e) => setNewArticle({...newArticle, externalSource: e.target.value})}
                    placeholder="e.g., The Hindu, Times of India"
                  />
                </div>
              </>
            )}

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newArticle.featured}
                  onChange={(e) => setNewArticle({...newArticle, featured: e.target.checked})}
                />
                Featured Article
              </label>
            </div>

            <button type="submit" className="btn-submit">Publish Article</button>
          </form>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approval
        </button>
        <button
          className={activeTab === 'approved' ? 'active' : ''}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button
          className={activeTab === 'declined' ? 'active' : ''}
          onClick={() => setActiveTab('declined')}
        >
          Declined
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading articles...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : articles.length === 0 ? (
        <div className="no-articles">No articles found</div>
      ) : (
        <div className="articles-list">
          {articles.map(article => (
            <div key={article._id} className="article-card">
              <div className="article-header">
                <h3>{article.title}</h3>
                {article.featured && <span className="badge-featured">Featured</span>}
                {article.isExternal && <span className="badge-external">External</span>}
              </div>
              
              <div className="article-meta">
                <span>By: {article.author.name} ({article.author.profession})</span>
                <span>Category: {article.category}</span>
                <span>Views: {article.views}</span>
                <span>Likes: {article.likes?.length || 0}</span>
              </div>

              <p className="article-summary">{article.summary}</p>

              {article.image && (
                <img src={article.image?.data ? `data:${article.image.contentType};base64,${article.image.data}` : '/placeholder-image.png'} alt={article.title} className="article-thumbnail" />
              )}

              {article.tags && article.tags.length > 0 && (
                <div className="article-tags">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="admin-actions">
                  <textarea
                    placeholder="Admin notes (optional)"
                    value={adminNotes[article._id] || ''}
                    onChange={(e) => setAdminNotes({...adminNotes, [article._id]: e.target.value})}
                    rows={2}
                  />
                  <div className="action-buttons">
                    <button className="btn-approve" onClick={() => handleApprove(article._id)}>
                      Approve
                    </button>
                    <button className="btn-decline" onClick={() => handleDecline(article._id)}>
                      Decline
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(article._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'approved' && (
                <div className="admin-actions">
                  <div className="action-buttons">
                    <button 
                      className={article.featured ? 'btn-unfeature' : 'btn-feature'}
                      onClick={() => handleToggleFeatured(article)}
                    >
                      {article.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(article._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'declined' && article.adminNotes && (
                <div className="decline-reason">
                  <strong>Decline Reason:</strong> {article.adminNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
