import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts?status=published')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching articles:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>欢迎来到 Ediora</h1>
        <p>一个现代化的内容发布管理系统</p>
      </div>

      <div className="articles-grid">
        {articles.length === 0 ? (
          <div className="empty-state">
            <p>暂无文章发布</p>
          </div>
        ) : (
          articles.map(article => (
            <article key={article.id} className="article-card">
              {article.featuredImage && (
                <img 
                  src={article.featuredImage} 
                  alt={article.title}
                  className="article-image"
                />
              )}
              <div className="article-content">
                <h2>
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="article-excerpt">{article.excerpt}</p>
                <div className="article-meta">
                  <span className="date">
                    {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  {article.tags && article.tags.length > 0 && (
                    <div className="tags">
                      {article.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Link to={`/blog/${article.slug}`} className="read-more">
                  阅读全文 →
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;

