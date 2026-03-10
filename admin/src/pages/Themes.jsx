import { useState, useEffect } from 'react';
import './Themes.css';

// 主题颜色配置映射（与 themeConfig.ts 保持一致）
const themeColors = {
  'default': { primary: '#1890ff', accent: '#722ed1', background: '#f4f7ff', gradient: ['#1890ff', '#722ed1'] },
  'dark': { primary: '#ff6b35', accent: '#f7931e', background: '#1a1a1a', gradient: ['#ff6b35', '#f7931e'] },
  'minimal': { primary: '#0ea5e9', accent: '#22c55e', background: '#ffffff', gradient: ['#0ea5e9', '#22c55e'] },
  'magazine': { primary: '#dc2626', accent: '#ea580c', background: '#fafafa', gradient: ['#dc2626', '#ea580c'] },
  'card': { primary: '#8b5cf6', accent: '#ec4899', background: '#f9fafb', gradient: ['#8b5cf6', '#ec4899'] },
  'bootstrap-blog': { primary: '#000000', accent: '#333333', background: '#ffffff', gradient: ['#000000', '#333333'] },
  'comprehensive': { primary: '#1890ff', accent: '#52c41a', background: '#fafafa', gradient: ['#1890ff', '#52c41a'] },
  'magazine-multi': { primary: '#dc2626', accent: '#991b1b', background: '#ffffff', gradient: ['#dc2626', '#991b1b'] },
  'minimal-lifestyle': { primary: '#d4a574', accent: '#c49564', background: '#faf9f7', gradient: ['#d4a574', '#c49564'] },
  'travel-blog': { primary: '#3498db', accent: '#e67e22', background: '#ffffff', gradient: ['#3498db', '#e67e22'] },
  'modern-magazine': { primary: '#e74c3c', accent: '#c0392b', background: '#fafafa', gradient: ['#e74c3c', '#c0392b'] },
  'modern-simple': { primary: '#ff6b35', accent: '#f7931e', background: '#ffffff', gradient: ['#ff6b35', '#f7931e'] },
  'lifestyle-daily': { primary: '#e91e63', accent: '#c2185b', background: '#ffffff', gradient: ['#e91e63', '#c2185b'] },
  'zen-blog': { primary: '#8b7355', accent: '#6b5b47', background: '#faf9f6', gradient: ['#8b7355', '#6b5b47'] },
};

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

  const getThemeColors = (slug) => {
    return themeColors[slug] || themeColors['default'];
  };

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
        {themes.map(theme => {
          const colors = getThemeColors(theme.slug);
          return (
            <div key={theme.id} className={`theme-card ${theme.isActive ? 'active' : ''}`}>
              <div 
                className="theme-preview"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* 预览头部 */}
                <div 
                  className="preview-header"
                  style={{ 
                    background: colors.background === '#ffffff' || colors.background === '#fafafa' 
                      ? 'rgba(255,255,255,0.2)' 
                      : 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="preview-dots">
                    <span style={{ background: colors.primary }}></span>
                    <span style={{ background: colors.accent }}></span>
                    <span style={{ background: colors.primary }}></span>
                  </div>
                </div>
                
                {/* 预览内容区域 */}
                <div className="preview-content-wrapper" style={{ background: colors.background }}>
                  <div className="preview-content">
                    {/* 标题行 */}
                    <div 
                      className="preview-line title-line"
                      style={{ 
                        background: colors.primary,
                        height: '16px',
                        width: '80%',
                        borderRadius: '4px'
                      }}
                    ></div>
                    {/* 内容行 */}
                    <div 
                      className="preview-line"
                      style={{ 
                        background: colors.text || '#1f2937',
                        height: '8px',
                        width: '100%',
                        borderRadius: '4px',
                        opacity: 0.6
                      }}
                    ></div>
                    <div 
                      className="preview-line short"
                      style={{ 
                        background: colors.subtext || '#6b7280',
                        height: '8px',
                        width: '70%',
                        borderRadius: '4px',
                        opacity: 0.4
                      }}
                    ></div>
                    {/* 标签预览 */}
                    <div className="preview-tags">
                      <span 
                        className="preview-tag"
                        style={{ 
                          background: colors.primary,
                          color: '#fff'
                        }}
                      >Tag</span>
                      <span 
                        className="preview-tag"
                        style={{ 
                          background: colors.accent,
                          color: '#fff'
                        }}
                      >Category</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="theme-info">
                <h3>{theme.name}</h3>
                <p className="theme-description">{theme.description || 'No description'}</p>
                <p className="theme-slug">Slug: {theme.slug}</p>
                {theme.isActive && (
                  <span className="active-badge">
                    <span className="check-icon">✓</span> 当前激活
                  </span>
                )}
              </div>
              
              <div className="theme-actions">
                {!theme.isActive && (
                  <button onClick={() => handleActivate(theme.id)} className="btn-activate">
                    启用主题
                  </button>
                )}
                <button className="btn-edit" title="编辑主题">
                  <span>✏️</span> 编辑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Themes;

