import { useState, useEffect } from 'react';
import './ContentTypes.css';

function ContentTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = () => {
    fetch('/api/content-types')
      .then(res => res.json())
      .then(data => {
        setTypes(data);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/content-types/${editingId}` : '/api/content-types';
    const method = editingId ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchTypes();
      setShowForm(false);
      setFormData({ name: '', slug: '', description: '' });
      setEditingId(null);
    } catch (err) {
      console.error('Error saving content type:', err);
      alert('保存失败');
    }
  };

  const handleEdit = (type) => {
    setFormData({ name: type.name, slug: type.slug, description: type.description || '' });
    setEditingId(type.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个内容类型吗？')) return;
    try {
      await fetch(`/api/content-types/${id}`, { method: 'DELETE' });
      fetchTypes();
    } catch (err) {
      alert('删除失败');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="content-types-page">
      <div className="page-header">
        <h1>文章类型管理</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + {showForm ? '取消' : '新建类型'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="type-form">
          <div className="form-group">
            <label>名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-cancel">
              取消
            </button>
            <button type="submit" className="btn-save">保存</button>
          </div>
        </form>
      )}

      <div className="types-grid">
        {types.map(type => (
          <div key={type.id} className="type-card">
            <h3>{type.name}</h3>
            <p className="type-slug">{type.slug}</p>
            {type.description && <p className="type-desc">{type.description}</p>}
            <div className="type-actions">
              <button onClick={() => handleEdit(type)}>编辑</button>
              <button onClick={() => handleDelete(type.id)} className="btn-delete">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentTypes;

