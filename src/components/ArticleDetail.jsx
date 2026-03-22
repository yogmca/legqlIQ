import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './ArticleDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/articles/${id}`);
      
      if (!response.ok) throw new Error('Article not found');
      
      const data = await response.json();
      setArticle(data.article);
      setLikeCount(data.article.likes?.length || 0);
      
      // Check if current user has liked
      if (user._id) {
        setIsLiked(data.article.likes?.includes(user._id));
      }
      
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user._id) {
      alert('Please login to like articles');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to like article');
      
      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!user._id) {
      alert('Please login to comment');
      navigate('/login');
      return;
    }

    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      setComment('');
      fetchArticle(); // Refresh to show new comment
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="article-detail-loading">
        <div className="spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-detail-error">
        <h2>❌ {error || 'Article not found'}</h2>
        <button onClick={() => navigate('/articles')}>Back to Articles</button>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <div className="article-logo-header">
        <Logo />
      </div>
      
      <button className="back-button" onClick={() => navigate('/articles')}>
        ← Back to Articles
      </button>

      <article className="article-container">
        <header className="article-header">
          <div className="article-category-badge">
            {article.category}
          </div>
          
          <h1>{article.title}</h1>
          
          <div className="article-author-section">
            <div className="author-info">
              {article.author.profileImage ? (
                <img src={`${API_URL}${article.author.profileImage}`} alt={article.author.name} />
              ) : (
                <div className="author-avatar">{article.author.name.charAt(0)}</div>
              )}
              <div>
                <div className="author-name">{article.author.name}</div>
                {article.author.profession !== 'admin' && (
                  <div className="author-profession">{article.author.profession}</div>
                )}
              </div>
            </div>
            
            <div className="article-meta-info">
              <span>📅 {formatDate(article.publishedAt || article.createdAt)}</span>
              <span>⏱️ {article.readTime} min read</span>
              <span>👁️ {article.views} views</span>
            </div>
          </div>

          {article.image && (
            <div className="article-featured-image">
              <img src={article.image?.data ? `data:${article.image.contentType};base64,${article.image.data}` : '/placeholder-image.png'} alt={article.title} />
            </div>
          )}
        </header>

        <div className="article-body">
          <div className="article-summary-box">
            <h3>Summary</h3>
            <p>{article.summary}</p>
          </div>

          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />

          {article.tags && article.tags.length > 0 && (
            <div className="article-tags-section">
              <h4>Tags:</h4>
              <div className="tags">
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {article.isExternal && article.externalSource && (
            <div className="external-source-box">
              <p>
                <strong>External Source:</strong> {article.externalSource}
                {article.externalUrl && (
                  <a href={article.externalUrl} target="_blank" rel="noopener noreferrer">
                    Read Original Article →
                  </a>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="article-actions">
          <button 
            className={`like-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {isLiked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>
          <button className="share-button" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}>
            🔗 Share
          </button>
        </div>

        <div className="comments-section">
          <h3>💬 Comments ({article.comments?.length || 0})</h3>
          
          {user._id && (
            <form onSubmit={handleComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
                required
              />
              <button type="submit">Post Comment</button>
            </form>
          )}

          <div className="comments-list">
            {article.comments && article.comments.length > 0 ? (
              article.comments.map((c, idx) => (
                <div key={idx} className="comment">
                  <div className="comment-author">
                    {c.user?.profileImage ? (
                      <img src={`${API_URL}${c.user.profileImage}`} alt={c.name} />
                    ) : (
                      <div className="comment-avatar">{c.name.charAt(0)}</div>
                    )}
                    <div>
                      <div className="comment-name">{c.name}</div>
                      <div className="comment-date">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="comment-text">{c.comment}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;
