import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './ArticlesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    tag: ''
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [filters, page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: 12,
        page: page,
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.tag && { tag: filters.tag })
      });

      const response = await fetch(`${API_URL}/articles/approved?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      
      if (page === 1) {
        setArticles(data.articles);
      } else {
        setArticles(prev => [...prev, ...data.articles]);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleCategoryFilter = (category) => {
    setFilters({ ...filters, category });
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleArticleClick = async (article) => {
    if (article.isExternal && article.externalUrl) {
      // Increment view count for external articles before opening
      try {
        await fetch(`${API_URL}/articles/${article._id}`);
      } catch (err) {
        console.error('Failed to track view:', err);
      }
      window.open(article.externalUrl, '_blank');
    } else {
      navigate(`/articles/${article._id}`);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      legal: '⚖️',
      tax: '💰',
      audit: '📊',
      general: '📰',
      case_study: '📚',
      news: '📢'
    };
    return icons[category] || '📄';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const categories = [
    { value: '', label: 'All Articles' },
    { value: 'legal', label: 'Legal' },
    { value: 'tax', label: 'Tax' },
    { value: 'audit', label: 'Audit' },
    { value: 'general', label: 'General' },
    { value: 'case_study', label: 'Case Studies' },
    { value: 'news', label: 'News' }
  ];

  return (
    <div className="articles-page">
      <div className="articles-logo-header">
        <Logo />
      </div>
      
      <div className="articles-hero">
        <div className="hero-content">
          <h1>📚 LegalIQ Knowledge Hub</h1>
          <p>Expert insights on legal, tax, and audit matters from verified professionals</p>
        </div>
      </div>

      <div className="articles-container">
        <div className="articles-sidebar">
          <div className="search-box">
            <h3>🔍 Search Articles</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="filter-box">
            <h3>📂 Categories</h3>
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={filters.category === cat.value ? 'active' : ''}
                  onClick={() => handleCategoryFilter(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="info-box">
            <h3>💡 Did you know?</h3>
            <p>All articles are written and reviewed by verified legal, tax, and audit professionals.</p>
          </div>
        </div>

        <div className="articles-main">
          {loading && page === 1 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={() => fetchArticles()}>Try Again</button>
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-state">
              <h2>No articles found</h2>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="articles-grid">
                {articles.map(article => (
                  <div 
                    key={article._id} 
                    className="article-card"
                    onClick={() => handleArticleClick(article)}
                  >
                    {article.image && (
                      <div className="article-image">
                        <img src={article.image?.data ? `data:${article.image.contentType};base64,${article.image.data}` : '/placeholder-image.png'} alt={article.title} />
                        {article.isExternal && (
                          <span className="external-badge">🔗 External</span>
                        )}
                        {article.featured && (
                          <span className="featured-badge">⭐ Featured</span>
                        )}
                      </div>
                    )}
                    
                    <div className="article-content">
                      <div className="article-category">
                        <span>{getCategoryIcon(article.category)} {article.category}</span>
                      </div>
                      
                      <h2>{article.title}</h2>
                      <p className="article-summary">{article.summary}</p>
                      
                      <div className="article-author">
                        <div className="author-info">
                          {article.author.profileImage ? (
                            <img src={`http://localhost:4000${article.author.profileImage}`} alt={article.author.name} />
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
                      </div>

                      <div className="article-meta">
                        <span>📅 {formatDate(article.publishedAt || article.createdAt)}</span>
                        <span>👁️ {article.views} views</span>
                        {!article.isExternal && <span>❤️ {article.likes?.length || 0}</span>}
                        <span>⏱️ {article.readTime} min read</span>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="article-tags">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}

                      {article.isExternal && article.externalSource && (
                        <div className="external-source">
                          Source: {article.externalSource}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="load-more">
                  <button onClick={handleLoadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More Articles'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
