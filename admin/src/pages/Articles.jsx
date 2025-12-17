import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
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

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('删除失败');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="articles-page">
      <div className="page-header">
        <h1>文章管理</h1>
        <Link to="/articles/new" className="btn-primary">
          + 新建文章
        </Link>
      </div>

      <div className="articles-table">
        <table>
          <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>作者</th>
                <th>发布日期</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">暂无文章</td>
              </tr>
            ) : (
              articles.map(article => (
                <tr key={article.id}>
                  <td>
                    <Link to={`/articles/edit/${article.id}`}>
                      {article.title}
                    </Link>
                  </td>
                  <td>
                    <span className={`status status-${article.status}`}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td>{article.author}</td>
                  <td>
                    {article.publishDate 
                      ? new Date(article.publishDate).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td>
                    <div className="actions">
                      <Link to={`/articles/edit/${article.id}`}>编辑</Link>
                      <button onClick={() => handleDelete(article.id)} className="btn-delete">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Articles;

