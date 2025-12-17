import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Home />} />
          <Route path="/blog/" element={<Navigate to="/blog" replace />} />
          <Route path="/blog/:slug" element={<ArticleDetail />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 Ediora. 内容发布管理系统</p>
      </footer>
    </div>
  );
}

export default App;

