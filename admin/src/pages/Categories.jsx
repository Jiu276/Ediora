import { useState, useEffect } from 'react';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchCategories();
        setShowForm(false);
        setFormData({ name: '', slug: '', description: '' });
        setEditingId(null);
        alert(editingId ? '更新成功' : '创建成功');
      } else {
        alert('保存失败');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      alert('保存失败');
    }
  };

  const handleEdit = (category) => {
    setFormData({ 
      name: category.name, 
      slug: category.slug, 
      description: category.description || '' 
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个标签类别吗？删除后，使用此类别发布的文章将受到影响。')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
        alert('删除成功');
      } else {
        alert('删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>标签类别管理</h1>
        <button onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setFormData({ name: '', slug: '', description: '' });
            setEditingId(null);
          }
        }} className="btn-primary">
          + {showForm ? '取消' : '新建类别'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label>名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="如：生活、旅游、科技"
            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="自动生成（英文标识符）"
            />
            <p className="form-hint">留空将根据名称自动生成</p>
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="描述此标签类别的用途"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => { 
              setShowForm(false); 
              setEditingId(null);
              setFormData({ name: '', slug: '', description: '' });
            }} className="btn-cancel">
              取消
            </button>
            <button type="submit" className="btn-save">
              {editingId ? '更新' : '创建'}
            </button>
          </div>
        </form>
      )}

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>暂无标签类别，点击"新建类别"开始添加</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="category-card">
              <h3>{category.name}</h3>
              <p className="category-slug">{category.slug}</p>
              {category.description && <p className="category-desc">{category.description}</p>}
              <div className="category-actions">
                <button onClick={() => handleEdit(category)}>编辑</button>
                <button onClick={() => handleDelete(category.id)} className="btn-delete">删除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Categories;


