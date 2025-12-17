import { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    contentTypes: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/content-types').then(r => r.json())
    ]).then(([articles, types]) => {
      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        draftArticles: articles.filter(a => a.status === 'draft').length,
        contentTypes: types.length
      });
    });
  }, []);

  return (
    <div className="dashboard">
      <h1>仪表盘</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalArticles}</div>
          <div className="stat-label">总文章数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.publishedArticles}</div>
          <div className="stat-label">已发布</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.draftArticles}</div>
          <div className="stat-label">草稿</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.contentTypes}</div>
          <div className="stat-label">内容类型</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

