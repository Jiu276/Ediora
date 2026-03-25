import { useState, useEffect } from 'react';
import './PublishWizard.css';

function PublishWizard({ article, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(article.categoryId || '1');
  const [customDomains, setCustomDomains] = useState(article.customDomains || []);
  const [newDomain, setNewDomain] = useState('');
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(article.title || '');
  const [customTitle, setCustomTitle] = useState('');
  const [links, setLinks] = useState(article.links || []);
  const [newLink, setNewLink] = useState({ keyword: '', url: '' });
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [publishDate, setPublishDate] = useState(
    article.publishDate ? article.publishDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [enableKeywordLinks, setEnableKeywordLinks] = useState(article.enableKeywordLinks || false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [useTemplateFallback, setUseTemplateFallback] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      // 验证域名格式（简单验证）
      const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (domainPattern.test(newDomain.trim()) || newDomain.trim().includes('.')) {
        if (!customDomains.includes(newDomain.trim())) {
          setCustomDomains([...customDomains, newDomain.trim()]);
          setNewDomain('');
        } else {
          alert('该域名已添加');
        }
      } else {
        alert('请输入有效的域名格式（如：example.com）');
      }
    }
  };

  const handleRemoveDomain = (domain) => {
    setCustomDomains(customDomains.filter(d => d !== domain));
  };

  const handleStep1Next = async () => {
    if (!selectedCategoryId) {
      alert('请选择文章标签类别');
      return;
    }
    setLoading(true);
    try {
      // 根据标签类别/域名生成10个标题
      const res = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          domains: customDomains
        })
      });
      const data = await res.json();
      setTitles(data.titles);
      setStep(2);
    } catch (err) {
      console.error('Error generating titles:', err);
      alert('生成标题失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = () => {
    if (!selectedTitle && !customTitle) {
      alert('请选择一个标题或输入自定义标题');
      return;
    }
    setStep(3);
  };

  const handleAddLink = () => {
    if (newLink.keyword && newLink.url) {
      // 验证URL格式
      try {
        new URL(newLink.url);
        setLinks([...links, { ...newLink, id: Date.now() }]);
        setNewLink({ keyword: '', url: '' });
      } catch (e) {
        alert('请输入有效的URL地址');
      }
    } else {
      alert('请填写关键字和URL');
    }
  };

  const handleRemoveLink = (linkId) => {
    setLinks(links.filter(l => l.id !== linkId));
  };

  const handleStep4Next = async () => {
    const finalTitle = selectedTitle || customTitle;
    if (!finalTitle) {
      alert('请选择或输入标题');
      return;
    }
    
    setGenerating(true);
    console.log('开始生成文章，参数:', { finalTitle, selectedCategoryId, customDomains });
    
    try {
      // 根据标题自动生成文章（添加超时处理）
      const contentController = new AbortController();
      const contentTimeout = setTimeout(() => {
        console.error('生成文章内容请求超时');
        contentController.abort();
      }, 10000); // 10秒超时
      
      console.log('发送生成文章请求...');
      const contentRes = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          categoryId: selectedCategoryId,
          domains: customDomains,
          forceFallback: useTemplateFallback
        }),
        signal: contentController.signal
      });
      
      clearTimeout(contentTimeout);
      console.log('生成文章响应状态:', contentRes.status, contentRes.ok);
      
      if (!contentRes.ok) {
        const errorData = await contentRes.json().catch(() => ({ error: '未知错误' }));
        throw new Error(errorData.error || `HTTP ${contentRes.status}: 生成文章内容失败`);
      }
      
      const contentData = await contentRes.json();
      if (!contentData || !contentData.content) {
        throw new Error('文章内容为空，请重试');
      }
      setGeneratedContent(contentData.content);

      // 获取配图（3-5张）
      const imagesController = new AbortController();
      const imagesTimeout = setTimeout(() => {
        console.error('获取配图请求超时');
        imagesController.abort();
      }, 10000); // 10秒超时
      
      console.log('发送获取配图请求...');
      const imagesRes = await fetch('/api/auto-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          count: 5 // 生成5张，用户可以选择3-5张
        }),
        signal: imagesController.signal
      });
      
      clearTimeout(imagesTimeout);
      console.log('获取配图响应状态:', imagesRes.status, imagesRes.ok);
      
      if (!imagesRes.ok) {
        const errorData = await imagesRes.json().catch(() => ({ error: '未知错误' }));
        throw new Error(errorData.error || `HTTP ${imagesRes.status}: 获取配图失败`);
      }
      
      const imagesData = await imagesRes.json();
      if (!imagesData || !imagesData.images || imagesData.images.length === 0) {
        throw new Error('配图数据为空，请重试');
      }
      setImages(imagesData.images);
      console.log('生成完成，跳转到步骤4');
      setGenerating(false);
      setStep(4);
    } catch (err) {
      console.error('生成文章错误详情:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      if (err.name === 'AbortError') {
        alert('请求超时（10秒），请检查：\n1. 后端服务是否运行在 http://localhost:3001\n2. 网络连接是否正常\n3. 查看浏览器控制台的Network标签检查请求状态');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        alert('网络请求失败，请检查：\n1. 后端服务是否运行\n2. 后端地址是否正确（http://localhost:3001）\n3. 查看浏览器Network标签中的请求详情');
      } else {
        alert(`生成失败: ${err.message || '未知错误'}\n\n请检查：\n1. 后端服务是否运行在 http://localhost:3001\n2. 浏览器控制台（Console和Network标签）是否有更多错误信息`);
      }
      setGenerating(false);
    }
  };

  const toggleImageSelection = (imageId) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      if (selectedImages.length < 5) {
        setSelectedImages([...selectedImages, imageId]);
      } else {
        alert('最多只能选择5张图片');
      }
    }
  };

  const handlePublish = () => {
    const finalTitle = selectedTitle || customTitle;
    if (!finalTitle) {
      alert('请选择或输入标题');
      return;
    }

    if (selectedImages.length < 3) {
      alert('请至少选择3张配图');
      return;
    }

    // 将选中的图片应用到文章内容中
    const selectedImageObjects = images.filter(img => selectedImages.includes(img.id));
    const finalContent = generatedContent || article.content;

    onComplete({
      ...article,
      title: finalTitle,
      content: finalContent,
      categoryId: selectedCategoryId,
      customDomains: customDomains,
      featuredImage: selectedImageObjects[0]?.url || null,
      images: selectedImageObjects.map(img => img.url),
      links: links,
      publishDate: new Date(publishDate).toISOString(),
      enableKeywordLinks: enableKeywordLinks,
      status: 'published'
    });
  };

  return (
    <div className="publish-wizard">
      <div className="wizard-header">
        <h2>发布文章</h2>
        <button onClick={onCancel} className="btn-close">×</button>
      </div>

      <div className="wizard-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. 选择标签类别</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. 选择标题</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. 添加超链接</div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>4. 生成文章和配图</div>
      </div>

      <div className="wizard-content">
        {step === 1 && (
          <div className="wizard-step">
            <h3>选择文章的标签类别</h3>
            <p className="step-description">请选择文章的标签类别，系统将根据此类别和域名生成标题建议</p>
            
            <div className="form-group">
              <label>文章标签类别 *</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
              >
                <option value="">请选择...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <p className="form-hint">选择文章的分类标签，如：生活、旅游、科技等</p>
            </div>

            <div className="form-group">
              <label>相关域名（可添加多个）</label>
              <div className="domain-input-group">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
                  placeholder="输入域名，如：example.com"
                  className="domain-input"
                />
                <button type="button" onClick={handleAddDomain} className="btn-add-domain">
                  添加
                </button>
              </div>
              {customDomains.length > 0 && (
                <div className="domains-list">
                  {customDomains.map((domain, index) => (
                    <div key={index} className="domain-item">
                      <span className="domain-text">{domain}</span>
                      <button type="button" onClick={() => handleRemoveDomain(domain)} className="btn-remove-domain">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="form-hint">可以添加多个域名，用于生成标题和文章内容</p>
            </div>

            <div className="wizard-actions">
              <button onClick={onCancel} className="btn-cancel">取消</button>
              <button onClick={handleStep1Next} className="btn-next" disabled={loading || !selectedCategoryId}>
                {loading ? '生成中...' : '下一步'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h3>系统已生成10个标题建议</h3>
            <p className="step-description">根据您选择的标签类别和域名，系统已生成以下标题建议，请选择一个或输入自定义标题</p>
            
            <div className="titles-grid">
              {titles.map(title => (
                <div
                  key={title.id}
                  className={`title-option ${selectedTitle === title.title ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTitle(title.title);
                    setCustomTitle('');
                  }}
                >
                  <div className="title-text">{title.title}</div>
                  <div className="title-score">推荐度: {title.score}%</div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>或自定义标题</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => {
                  setCustomTitle(e.target.value);
                  setSelectedTitle('');
                }}
                placeholder="输入自定义标题"
              />
            </div>

            <div className="wizard-actions">
              <button onClick={() => setStep(1)} className="btn-back">上一步</button>
              <button onClick={handleStep2Next} className="btn-next" disabled={!selectedTitle && !customTitle}>
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h3>添加超链接</h3>
            <p className="step-description">为文章添加超链接，系统将在文章内容中自动插入这些链接</p>
            
            <div className="form-group">
              <label>添加新超链接</label>
              <div className="link-input-group">
                <input
                  type="text"
                  value={newLink.keyword}
                  onChange={(e) => setNewLink({ ...newLink, keyword: e.target.value })}
                  placeholder="关键字"
                  className="link-keyword-input"
                />
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://example.com"
                  className="link-url-input"
                />
                <button type="button" onClick={handleAddLink} className="btn-add-link">
                  添加
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>已添加的超链接</label>
              {links.length === 0 ? (
                <p className="form-hint">暂无超链接，您可以跳过此步骤</p>
              ) : (
                <div className="links-list">
                  {links.map(link => (
                    <div key={link.id} className="link-item">
                      <span className="link-keyword">{link.keyword}</span>
                      <span className="link-url">{link.url}</span>
                      <button type="button" onClick={() => handleRemoveLink(link.id)} className="btn-remove-link">
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="wizard-actions">
              <button onClick={() => setStep(2)} className="btn-back">上一步</button>
              <button onClick={handleStep4Next} className="btn-next" disabled={generating}>
                {generating ? '生成中...' : '下一步'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h3>生成文章和配图</h3>
            <p className="step-description">系统已根据标题自动生成文章内容，请选择3-5张配图</p>
            
            {generating ? (
              <div className="loading-state">
                <p>正在生成文章内容和配图，请稍候...</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>生成的文章内容</label>
                  {generatedContent ? (
                    <div className="generated-content-preview">
                      <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>文章内容生成失败，请返回上一步重试</p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>选择配图（至少3张，最多5张）已选择: {selectedImages.length}/5</label>
                  {images.length > 0 ? (
                    <div className="images-grid">
                      {images.map(image => {
                        const isSelected = selectedImages.includes(image.id);
                        return (
                          <div
                            key={image.id}
                            className={`image-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleImageSelection(image.id)}
                          >
                            {isSelected && <div className="image-selected-badge">✓</div>}
                            <img src={image.thumbnail} alt={image.description} />
                            <div className="image-info">
                              <p>{image.description}</p>
                              <span className="image-source">{image.source}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>配图加载失败，请返回上一步重试</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="form-group">
              <label>发布日期</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useTemplateFallback}
                  onChange={(e) => setUseTemplateFallback(e.target.checked)}
                />
                <span>禁用 AI，使用模板生成</span>
              </label>
              <p className="form-hint">开启后跳过星火 AI，直接用内置英文模板生成正文/摘要（用于快速测试和避免 AI 输出异常）。</p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enableKeywordLinks}
                  onChange={(e) => setEnableKeywordLinks(e.target.checked)}
                />
                <span>启用关键字自动超链接</span>
              </label>
              <p className="form-hint">启用后，系统会自动为文章中的关键字添加超链接</p>
            </div>

            <div className="wizard-actions">
              <button onClick={() => setStep(3)} className="btn-back">上一步</button>
              <button onClick={handlePublish} className="btn-publish" disabled={selectedImages.length < 3}>
                发布文章
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublishWizard;

