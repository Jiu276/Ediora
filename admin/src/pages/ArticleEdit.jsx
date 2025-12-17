import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublishWizard from '../components/PublishWizard';
import './ArticleEdit.css';

function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    typeId: '1',
    tags: [],
    domainIds: [],
    publishDate: new Date().toISOString().split('T')[0],
    enableKeywordLinks: false
  });

  const [article, setArticle] = useState(null);
  const [contentTypes, setContentTypes] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [showPublishWizard, setShowPublishWizard] = useState(isNew); // 新建文章时直接显示发布向导

  useEffect(() => {
    fetch('/api/content-types')
      .then(res => res.json())
      .then(data => setContentTypes(data));

    if (!isNew) {
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(data => {
          setArticle(data);
          setFormData({
            title: data.title || '',
            content: data.content || '',
            excerpt: data.excerpt || '',
            status: data.status || 'draft',
            typeId: data.typeId || '1',
            tags: data.tags || [],
            domainIds: data.domainIds || [],
            publishDate: data.publishDate ? data.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
            enableKeywordLinks: data.enableKeywordLinks || false
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching article:', err);
          setLoading(false);
        });
    } else {
      // 新建文章时，初始化一个空文章对象用于发布向导
      setArticle({
        id: 'new',
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        typeId: '1',
        categoryId: '1',
        tags: [],
        domainIds: [],
        customDomains: [],
        publishDate: new Date().toISOString().split('T')[0],
        enableKeywordLinks: false,
        links: [],
        images: []
      });
      setLoading(false);
    }
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    const url = isNew ? '/api/posts' : `/api/posts/${id}`;
    const method = isNew ? 'POST' : 'PUT';

    const submitData = {
      ...formData,
      publishDate: new Date(formData.publishDate).toISOString()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        const savedArticle = await res.json();
        if (isNew) {
          setArticle(savedArticle);
          // 更新URL中的ID（如果是新建文章）
          if (savedArticle.id) {
            window.history.replaceState({}, '', `/articles/edit/${savedArticle.id}`);
          }
        } else {
          setArticle(savedArticle);
        }
        if (!showPublishWizard) {
          alert('保存成功');
        }
        return savedArticle;
      } else {
        alert('保存失败');
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Error saving article:', err);
      if (!showPublishWizard) {
        alert('保存失败');
      }
      throw err;
    }
  };

  const handlePublishComplete = async (publishData) => {
    try {
      // 确保使用正确的ID（如果是新建文章，使用article.id）
      let articleId = article?.id || id;
      
      // 1. 先创建/更新文章
      const url = (!articleId || articleId === 'new') ? '/api/posts' : `/api/posts/${articleId}`;
      const method = (!articleId || articleId === 'new') ? 'POST' : 'PUT';

      const articlePayload = {
        title: publishData.title,
        content: publishData.content,
        excerpt: publishData.excerpt,
        categoryId: publishData.categoryId,
        typeId: publishData.typeId || '1',
        publishDate: publishData.publishDate,
        featuredImage: publishData.featuredImage,
        enableKeywordLinks: publishData.enableKeywordLinks,
        status: 'published',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articlePayload)
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`发布失败: ${error.error || '未知错误'}`);
        return;
      }

      const savedArticle = await res.json();
      articleId = savedArticle.id;

      // 2. 保存关联数据（并行执行）
      const promises = [];
      
      // 保存自定义域名
      if (publishData.customDomains && publishData.customDomains.length > 0) {
        promises.push(
          fetch(`/api/posts/${articleId}/custom-domains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domains: publishData.customDomains }),
          }).catch(err => {
            console.error('Error saving custom domains:', err);
            return null;
          })
        );
      }
      
      // 保存超链接
      if (publishData.links && publishData.links.length > 0) {
        promises.push(
          fetch(`/api/posts/${articleId}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ links: publishData.links }),
          }).catch(err => {
            console.error('Error saving links:', err);
            return null;
          })
        );
      }
      
      // 保存配图
      if (publishData.images && publishData.images.length > 0) {
        promises.push(
          fetch(`/api/posts/${articleId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: publishData.images }),
          }).catch(err => {
            console.error('Error saving images:', err);
            return null;
          })
        );
      }
      
      // 等待所有关联数据保存完成
      await Promise.all(promises);
      
      alert('文章发布成功！');
      navigate('/articles');
    } catch (err) {
      console.error('Error publishing article:', err);
      alert('发布失败');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  // 新建文章时，直接显示发布向导
  if (isNew && showPublishWizard) {
    return (
      <div className="article-edit">
        <div className="wizard-overlay" style={{ position: 'relative', padding: '2rem' }}>
          <PublishWizard
            article={article || { 
              id: 'new',
              title: '',
              content: '',
              excerpt: '',
              status: 'draft',
              typeId: '1',
              categoryId: '1',
              tags: [],
              domainIds: [],
              customDomains: [],
              publishDate: new Date().toISOString().split('T')[0],
              enableKeywordLinks: false,
              links: [],
              images: []
            }}
            onComplete={handlePublishComplete}
            onCancel={() => navigate('/articles')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="article-edit">
      <div className="article-edit-header">
        <h1>{isNew ? '新建文章' : '编辑文章'}</h1>
        {!isNew && (
          <div className="publish-hint">
            💡 提示：填写完内容后，点击"发布文章"按钮进入发布向导，完成类型选择、标题生成、配图等步骤
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="输入文章标题"
          />
        </div>

        <div className="form-group">
          <label>摘要</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows="3"
            placeholder="文章摘要（可选）"
          />
        </div>

        <div className="form-group">
          <label>内容 *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="15"
            required
            placeholder="输入文章内容（支持 HTML）"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>

          <div className="form-group">
            <label>文章类型</label>
            <select
              value={formData.typeId}
              onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
            >
              {contentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>发布日期</label>
            <input
              type="date"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>标签</label>
          <div className="tag-input-group">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="输入标签后按回车"
            />
            <button type="button" onClick={handleAddTag} className="btn-add-tag">
              添加
            </button>
          </div>
          <div className="tags-list">
            {formData.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <div className="form-actions-left">
            <button type="button" onClick={() => navigate('/articles')} className="btn-cancel">
              取消
            </button>
            <button type="submit" className="btn-save">
              保存草稿
            </button>
          </div>
          <div className="form-actions-right">
            <button 
              type="button" 
              onClick={async () => {
                if (!formData.title || !formData.content) {
                  alert('请先填写标题和内容');
                  return;
                }
                try {
                  // 先保存草稿
                  const savedArticle = await handleSubmit({ preventDefault: () => {} });
                  // 使用保存后的文章数据打开发布向导
                  setArticle(savedArticle || { ...formData, id: id || article?.id || 'new' });
                  setShowPublishWizard(true);
                } catch (err) {
                  // 如果保存失败，仍然打开发布向导（使用当前表单数据）
                  setArticle({ ...formData, id: id || article?.id || 'new' });
                  setShowPublishWizard(true);
                }
              }} 
              className="btn-publish"
              disabled={!formData.title || !formData.content}
              title={!formData.title || !formData.content ? '请先填写标题和内容' : '通过发布向导发布文章（选择类型/域名 → 选择标题 → 配图和设置）'}
            >
              🚀 发布文章
            </button>
          </div>
        </div>
      </form>

      {showPublishWizard && (
        <div className="wizard-overlay">
          <PublishWizard
            article={article || { ...formData, id: id || 'new' }}
            onComplete={handlePublishComplete}
            onCancel={() => setShowPublishWizard(false)}
          />
        </div>
      )}
    </div>
  );
}

export default ArticleEdit;

