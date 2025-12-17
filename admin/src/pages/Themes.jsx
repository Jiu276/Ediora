import { useState, useEffect } from 'react';
import './Themes.css';

function Themes() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => {
        setThemes(data);
        setLoading(false);
      });
  }, []);

  const handleActivate = async (id) => {
    try {
      await fetch(`/api/themes/${id}/activate`, { method: 'PUT' });
      setThemes(themes.map(t => ({ ...t, isActive: t.id === id })));
    } catch (err) {
      console.error('Error activating theme:', err);
      alert('激活失败');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="themes-page">
      <h1>主题管理</h1>
      <p className="page-description">选择并激活不同的主题来改变前台展示站的样式</p>

      <div className="themes-grid">
        {themes.map(theme => (
          <div key={theme.id} className={`theme-card ${theme.isActive ? 'active' : ''}`}>
            <div className="theme-preview">
              <div className="preview-header"></div>
              <div className="preview-content">
                <div className="preview-line"></div>
                <div className="preview-line short"></div>
              </div>
            </div>
            <div className="theme-info">
              <h3>{theme.name}</h3>
              <p className="theme-slug">{theme.slug}</p>
              {theme.isActive && <span className="active-badge">当前激活</span>}
            </div>
            <div className="theme-actions">
              {!theme.isActive && (
                <button onClick={() => handleActivate(theme.id)} className="btn-activate">
                  激活主题
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Themes;

