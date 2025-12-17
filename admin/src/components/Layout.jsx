import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '仪表盘', icon: '📊' },
    { path: '/articles', label: '文章', icon: '📝' },
    { path: '/content-types', label: '文章类型', icon: '📂' },
    { path: '/categories', label: '标签类别', icon: '🏷️' },
    { path: '/themes', label: '主题', icon: '🎨' }
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Ediora</h1>
          <p>管理后台</p>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
            👁️ 查看前台
          </a>
        </div>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;

