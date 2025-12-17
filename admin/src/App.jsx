import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleEdit from './pages/ArticleEdit';
import ContentTypes from './pages/ContentTypes';
import Categories from './pages/Categories';
import Themes from './pages/Themes';
import './App.css';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/new" element={<ArticleEdit />} />
        <Route path="/articles/edit/:id" element={<ArticleEdit />} />
        <Route path="/content-types" element={<ContentTypes />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/themes" element={<Themes />} />
      </Routes>
    </Layout>
  );
}

export default App;

