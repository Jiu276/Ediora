import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ArticleDetail.css';

function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/slug/${slug}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching article:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!article) {
    return (
      <div className="error">
        <h2>文章未找到</h2>
        <Link to="/">返回首页</Link>
      </div>
    );
  }

  return (
    <article className="article-detail">
      <Link to="/" className="back-link">← 返回首页</Link>
      
      {article.featuredImage && (
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="detail-image"
        />
      )}
      
      <div className="article-header">
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span>作者: {article.author}</span>
          <span>发布时间: {new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
          {article.tags && article.tags.length > 0 && (
            <div className="tags">
              {article.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div 
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}

export default ArticleDetail;

