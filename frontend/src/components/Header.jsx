import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Ediora</h1>
        </Link>
        <nav className="nav">
          <Link to="/">首页</Link>
          <Link to="/admin" target="_blank">管理后台</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

