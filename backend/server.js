import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 数据存储文件
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据
let data = {
  articles: [
    {
      id: '1',
      title: '欢迎使用 Ediora',
      slug: 'welcome-to-ediora',
      content: '<p>这是你的第一篇文章。Ediora 是一个强大的博客文章发布管理系统。</p><p>你可以在这里创建、编辑和管理你的内容。</p>',
      excerpt: '这是你的第一篇文章。Ediora 是一个强大的博客文章发布管理系统。',
      status: 'published',
      typeId: '1',
      domainIds: ['1'],
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishDate: new Date().toISOString(),
      featuredImage: null,
      tags: ['介绍', '开始'],
      enableKeywordLinks: false
    },
    {
      id: '2',
      title: '如何开始写作',
      slug: 'how-to-start-writing',
      content: '<p>写作是一门艺术，也是一门技能。</p><p>通过 Ediora，你可以更好地组织和管理你的创作内容。</p>',
      excerpt: '写作是一门艺术，也是一门技能。',
      status: 'published',
      typeId: '1',
      domainIds: ['2'],
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishDate: new Date().toISOString(),
      featuredImage: null,
      tags: ['写作', '技巧'],
      enableKeywordLinks: false
    }
  ],
  contentTypes: [
    { id: '1', name: '文章', slug: 'post', description: '标准博客文章' },
    { id: '2', name: '页面', slug: 'page', description: '静态页面' }
  ],
  categories: [
    { id: '1', name: '生活', slug: 'life', description: '生活相关文章' },
    { id: '2', name: '旅游', slug: 'travel', description: '旅游相关文章' },
    { id: '3', name: '科技', slug: 'tech', description: '科技相关文章' },
    { id: '4', name: '美食', slug: 'food', description: '美食相关文章' },
    { id: '5', name: '健康', slug: 'health', description: '健康相关文章' },
    { id: '6', name: '教育', slug: 'education', description: '教育相关文章' },
    { id: '7', name: '娱乐', slug: 'entertainment', description: '娱乐相关文章' },
    { id: '8', name: '财经', slug: 'finance', description: '财经相关文章' },
    { id: '9', name: '体育', slug: 'sports', description: '体育相关文章' },
    { id: '10', name: '时尚', slug: 'fashion', description: '时尚相关文章' }
  ],
  themes: [
    { id: '1', name: '默认主题', slug: 'default', isActive: true },
    { id: '2', name: '深色主题', slug: 'dark', isActive: false },
    { id: '3', name: '简约主题', slug: 'minimal', isActive: false }
  ],
  domains: [
    { id: '1', name: '技术博客', url: 'tech.example.com', description: '技术相关文章' },
    { id: '2', name: '生活随笔', url: 'life.example.com', description: '生活感悟文章' },
    { id: '3', name: '产品资讯', url: 'product.example.com', description: '产品相关文章' }
  ],
  assets: []
};

// 加载数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// 保存数据
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

loadData();

// ========== 文章管理 API ==========

// 获取所有文章（前台展示端用）
app.get('/api/posts', (req, res) => {
  const { status, typeId } = req.query;
  let articles = data.articles;
  
  if (status) {
    articles = articles.filter(a => a.status === status);
  }
  if (typeId) {
    articles = articles.filter(a => a.typeId === typeId);
  }
  
  res.json(articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// 根据 slug 获取文章（前台展示端用）
app.get('/api/posts/slug/:slug', (req, res) => {
  const article = data.articles.find(a => a.slug === req.params.slug && a.status === 'published');
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

// 根据 ID 获取文章（管理端用）
app.get('/api/posts/:id', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

// 创建文章
app.post('/api/posts', (req, res) => {
  const { title, content, excerpt, status, typeId, categoryId, tags, featuredImage, domainIds, customDomains, publishDate, enableKeywordLinks, links, images } = req.body;
  
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  
  const newArticle = {
    id: uuidv4(),
    title,
    slug,
    content: content || '',
    excerpt: excerpt || '',
    status: status || 'draft',
    typeId: typeId || '1',
    categoryId: categoryId || null,
    domainIds: domainIds || [],
    customDomains: customDomains || [],
    author: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishDate: publishDate || new Date().toISOString(),
    featuredImage: featuredImage || null,
    tags: tags || [],
    enableKeywordLinks: enableKeywordLinks || false,
    links: links || [],
    images: images || []
  };
  
  data.articles.push(newArticle);
  saveData();
  res.status(201).json(newArticle);
});

// 更新文章
app.put('/api/posts/:id', (req, res) => {
  const index = data.articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  const { title, content, excerpt, status, typeId, categoryId, tags, featuredImage, domainIds, customDomains, publishDate, enableKeywordLinks, links, images } = req.body;
  const article = data.articles[index];
  
  if (title) {
    article.title = title;
    article.slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  if (content !== undefined) article.content = content;
  if (excerpt !== undefined) article.excerpt = excerpt;
  if (status !== undefined) article.status = status;
  if (typeId !== undefined) article.typeId = typeId;
  if (categoryId !== undefined) article.categoryId = categoryId;
  if (tags !== undefined) article.tags = tags;
  if (featuredImage !== undefined) article.featuredImage = featuredImage;
  if (domainIds !== undefined) article.domainIds = domainIds;
  if (customDomains !== undefined) article.customDomains = customDomains;
  if (publishDate !== undefined) article.publishDate = publishDate;
  if (enableKeywordLinks !== undefined) article.enableKeywordLinks = enableKeywordLinks;
  if (links !== undefined) article.links = links;
  if (images !== undefined) article.images = images;
  article.updatedAt = new Date().toISOString();
  
  saveData();
  res.json(article);
});

// 删除文章
app.delete('/api/posts/:id', (req, res) => {
  const index = data.articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  data.articles.splice(index, 1);
  saveData();
  res.json({ message: 'Article deleted' });
});

// ========== 文章类型管理 API ==========

app.get('/api/content-types', (req, res) => {
  res.json(data.contentTypes);
});

app.get('/api/content-types/:id', (req, res) => {
  const type = data.contentTypes.find(t => t.id === req.params.id);
  if (!type) {
    return res.status(404).json({ error: 'Content type not found' });
  }
  res.json(type);
});

app.post('/api/content-types', (req, res) => {
  const { name, slug, description } = req.body;
  const newType = {
    id: uuidv4(),
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || ''
  };
  data.contentTypes.push(newType);
  saveData();
  res.status(201).json(newType);
});

app.put('/api/content-types/:id', (req, res) => {
  const index = data.contentTypes.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Content type not found' });
  }
  
  const { name, slug, description } = req.body;
  if (name) data.contentTypes[index].name = name;
  if (slug) data.contentTypes[index].slug = slug;
  if (description !== undefined) data.contentTypes[index].description = description;
  
  saveData();
  res.json(data.contentTypes[index]);
});

app.delete('/api/content-types/:id', (req, res) => {
  const index = data.contentTypes.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Content type not found' });
  }
  data.contentTypes.splice(index, 1);
  saveData();
  res.json({ message: 'Content type deleted' });
});

// ========== 标签类别管理 API ==========

app.get('/api/categories', (req, res) => {
  res.json(data.categories || []);
});

app.get('/api/categories/:id', (req, res) => {
  const category = (data.categories || []).find(c => c.id === req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

app.post('/api/categories', (req, res) => {
  const { name, slug, description } = req.body;
  const newCategory = {
    id: uuidv4(),
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || ''
  };
  if (!data.categories) data.categories = [];
  data.categories.push(newCategory);
  saveData();
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  if (!data.categories) data.categories = [];
  const index = data.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const { name, slug, description } = req.body;
  if (name) data.categories[index].name = name;
  if (slug) data.categories[index].slug = slug;
  if (description !== undefined) data.categories[index].description = description;
  
  saveData();
  res.json(data.categories[index]);
});

app.delete('/api/categories/:id', (req, res) => {
  if (!data.categories) data.categories = [];
  const index = data.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  data.categories.splice(index, 1);
  saveData();
  res.json({ message: 'Category deleted' });
});

// ========== 主题管理 API ==========

app.get('/api/themes', (req, res) => {
  res.json(data.themes);
});

app.get('/api/themes/active', (req, res) => {
  const activeTheme = data.themes.find(t => t.isActive);
  res.json(activeTheme || data.themes[0]);
});

app.put('/api/themes/:id/activate', (req, res) => {
  data.themes.forEach(t => t.isActive = false);
  const theme = data.themes.find(t => t.id === req.params.id);
  if (theme) {
    theme.isActive = true;
    saveData();
    res.json(theme);
  } else {
    res.status(404).json({ error: 'Theme not found' });
  }
});

// ========== 域名管理 API ==========

app.get('/api/domains', (req, res) => {
  res.json(data.domains || []);
});

app.get('/api/domains/:id', (req, res) => {
  const domain = (data.domains || []).find(d => d.id === req.params.id);
  if (!domain) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  res.json(domain);
});

app.post('/api/domains', (req, res) => {
  const { name, url, description } = req.body;
  const newDomain = {
    id: uuidv4(),
    name,
    url,
    description: description || ''
  };
  if (!data.domains) data.domains = [];
  data.domains.push(newDomain);
  saveData();
  res.status(201).json(newDomain);
});

app.put('/api/domains/:id', (req, res) => {
  if (!data.domains) data.domains = [];
  const index = data.domains.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const { name, url, description } = req.body;
  if (name) data.domains[index].name = name;
  if (url) data.domains[index].url = url;
  if (description !== undefined) data.domains[index].description = description;
  
  saveData();
  res.json(data.domains[index]);
});

app.delete('/api/domains/:id', (req, res) => {
  if (!data.domains) data.domains = [];
  const index = data.domains.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  data.domains.splice(index, 1);
  saveData();
  res.json({ message: 'Domain deleted' });
});

// ========== 标题生成 API ==========

app.post('/api/generate-titles', (req, res) => {
  const { categoryId, domains } = req.body;
  
  if (!categoryId) {
    return res.status(400).json({ error: 'Category ID is required' });
  }
  
  // 模拟AI生成标题（实际应该调用AI服务）
  const category = (data.categories || []).find(c => c.id === categoryId);
  const domainNames = (domains && domains.length > 0) ? domains.join('、') : '';
  
  const titles = generateTitles(category, domains, domainNames);
  
  res.json({ titles });
});

function extractKeywords(text) {
  // 简单的关键词提取（实际应该使用NLP）
  if (!text) return [];
  const cleanText = text.replace(/<[^>]*>/g, ' ').toLowerCase();
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 5);
}

function generateTitles(category, domains, domainNames) {
  const categoryName = category?.name || '通用';
  const domainPrefix = domainNames ? `${domainNames}：` : '';
  
  // 根据标签类别生成不同风格的标题
  const categoryTemplates = {
    '生活': [
      `${categoryName}小贴士：让每一天更美好`,
      `探索${categoryName}的乐趣与意义`,
      `${categoryName}指南：提升生活品质的秘诀`,
      `发现${categoryName}中的美好瞬间`,
      `${categoryName}心得分享：实用经验总结`,
      `如何享受${categoryName}的精彩`,
      `${categoryName}全攻略：从入门到精通`,
      `品味${categoryName}的独特魅力`,
      `${categoryName}技巧：让生活更轻松`,
      `走进${categoryName}的世界`
    ],
    '旅游': [
      `${categoryName}攻略：必去的10个地方`,
      `探索${categoryName}的绝美风景`,
      `${categoryName}指南：完美行程规划`,
      `发现${categoryName}的隐藏景点`,
      `${categoryName}体验：难忘的旅程回忆`,
      `如何规划一次完美的${categoryName}`,
      `${categoryName}全攻略：从准备到归来`,
      `品味${categoryName}的独特文化`,
      `${categoryName}小贴士：省钱又省心`,
      `走进${categoryName}的精彩世界`
    ],
    '科技': [
      `${categoryName}前沿：最新趋势解析`,
      `深入理解${categoryName}的核心技术`,
      `${categoryName}指南：从入门到精通`,
      `探索${categoryName}的未来发展`,
      `${categoryName}应用：改变生活的创新`,
      `如何掌握${categoryName}的关键技能`,
      `${categoryName}全解析：技术深度剖析`,
      `发现${categoryName}的无限可能`,
      `${categoryName}实战：10个实用技巧`,
      `走进${categoryName}的创新世界`
    ]
  };
  
  // 根据类别选择模板，如果没有则使用通用模板
  let templates = categoryTemplates[categoryName] || [
    `${categoryName}完整指南：从入门到精通`,
    `深入理解${categoryName}的核心概念`,
    `${categoryName}的最佳实践与技巧`,
    `为什么${categoryName}如此重要？`,
    `${categoryName}实战教程：10个实用技巧`,
    `掌握${categoryName}的进阶方法`,
    `${categoryName}完全指南：全面解析`,
    `探索${categoryName}的奥秘与价值`,
    `${categoryName}进阶之路：专业提升指南`,
    `${categoryName}应用指南：从理论到实践`
  ];
  
  // 如果有域名，在标题前添加
  if (domainNames) {
    templates = templates.map(t => `${domainNames}：${t}`);
  }
  
  return templates.map((t, i) => ({
    id: i + 1,
    title: t,
    score: Math.floor(Math.random() * 30) + 70 // 70-100分
  }));
}

// ========== 文章生成 API ==========

app.post('/api/generate-article', (req, res) => {
  try {
    const { title, categoryId, domains } = req.body;
    
    console.log('生成文章请求:', { title, categoryId, domains });
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // 模拟AI生成文章内容（实际应该调用AI服务如OpenAI、Claude等）
    const category = (data.categories || []).find(c => c.id === categoryId);
    const domainNames = (domains && domains.length > 0) ? domains.join('、') : '通用';
    
    // 生成文章内容
    const articleContent = generateArticleContent(title, category, domainNames);
    
    console.log('文章生成成功，内容长度:', articleContent.length);
    res.json({ content: articleContent });
  } catch (error) {
    console.error('生成文章错误:', error);
    res.status(500).json({ error: error.message || '生成文章失败' });
  }
});

function generateArticleContent(title, category, domainNames) {
  const categoryName = category?.name || '通用';
  
  // 根据标签类别生成不同风格的内容
  const categoryContent = {
    '生活': [
      `<h2>引言</h2>`,
      `<p>在${domainNames || '生活'}领域，${title}是我们日常生活中经常遇到的话题。本文将为您分享一些实用的经验和建议，帮助您更好地享受生活的美好。</p>`,
      `<h2>核心内容</h2>`,
      `<p>${title}涉及生活的方方面面。无论是日常起居还是休闲娱乐，我们都可以从中发现许多有趣的内容和实用的技巧。</p>`,
      `<p>通过实践和体验，我们可以更好地理解${title}的真正意义，让生活变得更加丰富多彩。</p>`,
      `<h2>实用建议</h2>`,
      `<p>在实践${title}的过程中，有一些小贴士可以帮助您获得更好的体验。这些建议来自实际经验，值得您参考和尝试。</p>`,
      `<p>同时，我们也需要注意一些细节和注意事项，这样才能真正享受到${title}带来的乐趣。</p>`,
      `<h2>总结</h2>`,
      `<p>总的来说，${title}是生活中一个值得关注的话题。通过学习和实践，我们可以让生活变得更加美好和充实。</p>`
    ],
    '旅游': [
      `<h2>引言</h2>`,
      `<p>${title}是许多旅行爱好者关注的话题。本文将为您提供详细的攻略和建议，帮助您规划一次完美的旅程。</p>`,
      `<h2>目的地介绍</h2>`,
      `<p>${title}涉及的目的地有着独特的魅力和特色。无论是自然风光还是人文景观，都值得您亲自去体验和探索。</p>`,
      `<p>每个地方都有其独特的文化和历史背景，了解这些可以让您的旅行更加有意义。</p>`,
      `<h2>行程规划</h2>`,
      `<p>规划${title}的行程时，需要考虑多个因素。合理的行程安排可以让您在有限的时间内体验到更多的精彩内容。</p>`,
      `<p>建议提前做好功课，了解目的地的天气、交通、住宿等信息，这样可以让旅行更加顺利和愉快。</p>`,
      `<h2>实用贴士</h2>`,
      `<p>在${title}的旅程中，有一些实用的建议可以帮助您更好地享受旅行。这些贴士来自实际经验，值得您参考。</p>`,
      `<h2>总结</h2>`,
      `<p>总的来说，${title}是一次值得期待的旅程。通过合理的规划和准备，您可以收获一段难忘的旅行回忆。</p>`
    ],
    '科技': [
      `<h2>引言</h2>`,
      `<p>在科技快速发展的今天，${title}是一个备受关注的话题。本文将为您深入解析这一技术领域，帮助您更好地理解和应用相关知识。</p>`,
      `<h2>技术概述</h2>`,
      `<p>${title}涉及的核心技术和概念值得我们深入了解。这些技术不仅改变了我们的生活方式，也为未来的发展奠定了基础。</p>`,
      `<p>通过系统学习，我们可以掌握${title}的关键要点，并在实际应用中发挥其价值。</p>`,
      `<h2>应用场景</h2>`,
      `<p>${title}在实际应用中有着广泛的使用场景。了解这些应用场景可以帮助我们更好地理解技术的价值和意义。</p>`,
      `<p>从日常生活到专业领域，${title}都在发挥着重要作用，推动着社会的进步和发展。</p>`,
      `<h2>发展趋势</h2>`,
      `<p>展望未来，${title}将继续发展和演进。了解这些趋势可以帮助我们把握技术发展的方向。</p>`,
      `<h2>总结</h2>`,
      `<p>总的来说，${title}是一个充满潜力的技术领域。通过持续学习和实践，我们可以在这个领域取得更大的成就。</p>`
    ]
  };
  
  // 根据类别选择内容模板，如果没有则使用通用模板
  let paragraphs = categoryContent[categoryName] || [
    `<h2>引言</h2>`,
    `<p>在${domainNames || categoryName}领域，${title}是一个值得深入探讨的话题。本文将为您全面解析这一主题，帮助您更好地理解和应用相关知识。</p>`,
    `<h2>核心内容</h2>`,
    `<p>${title}涉及多个方面的内容。首先，我们需要了解其基本概念和原理。这不仅是理论层面的探讨，更是实践应用的基础。</p>`,
    `<p>在实际应用中，${title}展现出其独特的价值和意义。通过深入分析，我们可以发现其中的关键要素和重要特征。</p>`,
    `<h2>实践应用</h2>`,
    `<p>为了更好地应用${title}，我们需要掌握一些实用的方法和技巧。这些方法经过实践验证，能够帮助您在实际工作中取得更好的效果。</p>`,
    `<p>同时，我们也需要注意一些常见的误区和挑战。通过了解这些，我们可以避免走弯路，提高工作效率。</p>`,
    `<h2>总结</h2>`,
    `<p>总的来说，${title}是一个内容丰富、应用广泛的领域。通过系统学习和实践，我们可以不断提升自己在这一领域的专业能力。</p>`
  ];
  
  return paragraphs.join('');
}

// ========== 自动配图 API ==========

app.post('/api/auto-images', (req, res) => {
  try {
    const { title, count = 5 } = req.body;
    
    console.log('获取配图请求:', { title, count });
    
    // 从标题中提取关键词
    const keywords = extractKeywords(title || '');
    const searchTerm = keywords[0] || 'technology';
    
    // 生成3-5张图片（默认5张，用户可以选择3-5张）
    const imageCount = Math.min(Math.max(count, 3), 5);
    const images = [];
    
    for (let i = 0; i < imageCount; i++) {
      images.push({
        id: uuidv4(),
        url: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=800&h=600&fit=crop`,
        thumbnail: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop`,
        description: `与"${searchTerm}"相关的配图 ${i + 1}`,
        source: 'Unsplash'
      });
    }
    
    console.log('配图生成成功，数量:', images.length);
    res.json({ images, searchTerm });
  } catch (error) {
    console.error('获取配图错误:', error);
    res.status(500).json({ error: error.message || '获取配图失败' });
  }
});

// ========== 资源管理 API ==========

app.get('/api/assets', (req, res) => {
  res.json(data.assets);
});

app.post('/api/assets', (req, res) => {
  const { name, url, type } = req.body;
  const newAsset = {
    id: uuidv4(),
    name,
    url,
    type: type || 'image',
    createdAt: new Date().toISOString()
  };
  data.assets.push(newAsset);
  saveData();
  res.status(201).json(newAsset);
});

// ========== 文章关联数据 API ==========

// 获取文章的自定义域名
app.get('/api/posts/:id/custom-domains', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const domains = (article.customDomains || []).map((domain, index) => ({
    id: `domain-${req.params.id}-${index}`,
    articleId: req.params.id,
    domain: domain,
    createdAt: article.createdAt
  }));
  res.json(domains);
});

// 保存文章的自定义域名
app.post('/api/posts/:id/custom-domains', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const { domains } = req.body;
  if (!Array.isArray(domains)) {
    return res.status(400).json({ error: 'Domains must be an array' });
  }
  article.customDomains = domains;
  article.updatedAt = new Date().toISOString();
  saveData();
  const createdDomains = domains.map((domain, index) => ({
    id: `domain-${req.params.id}-${index}`,
    articleId: req.params.id,
    domain: domain,
    createdAt: article.updatedAt
  }));
  res.status(201).json(createdDomains);
});

// 获取文章的超链接
app.get('/api/posts/:id/links', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const links = (article.links || []).map((link, index) => ({
    id: `link-${req.params.id}-${index}`,
    articleId: req.params.id,
    keyword: link.keyword || link,
    url: link.url || link,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt
  }));
  res.json(links);
});

// 保存文章的超链接
app.post('/api/posts/:id/links', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const { links } = req.body;
  if (!Array.isArray(links)) {
    return res.status(400).json({ error: 'Links must be an array' });
  }
  article.links = links;
  article.updatedAt = new Date().toISOString();
  saveData();
  const createdLinks = links.map((link, index) => ({
    id: `link-${req.params.id}-${index}`,
    articleId: req.params.id,
    keyword: link.keyword || link,
    url: link.url || link,
    createdAt: article.updatedAt,
    updatedAt: article.updatedAt
  }));
  res.status(201).json(createdLinks);
});

// 获取文章的配图
app.get('/api/posts/:id/images', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const images = (article.images || []).map((image, index) => ({
    id: image.id || `image-${req.params.id}-${index}`,
    articleId: req.params.id,
    url: image.url || image,
    thumbnail: image.thumbnail || image.url || image,
    description: image.description || null,
    source: image.source || null,
    sortOrder: index,
    createdAt: article.createdAt
  }));
  res.json(images);
});

// 保存文章的配图
app.post('/api/posts/:id/images', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const { images } = req.body;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: 'Images must be an array' });
  }
  article.images = images;
  article.updatedAt = new Date().toISOString();
  saveData();
  const createdImages = images.map((image, index) => ({
    id: image.id || `image-${req.params.id}-${index}`,
    articleId: req.params.id,
    url: image.url || image,
    thumbnail: image.thumbnail || image.url || image,
    description: image.description || null,
    source: image.source || null,
    sortOrder: index,
    createdAt: article.updatedAt
  }));
  res.status(201).json(createdImages);
});

// 获取文章的标签
app.get('/api/posts/:id/tags', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const tags = (article.tags || []).map((tag, index) => ({
    id: `tag-${req.params.id}-${index}`,
    articleId: req.params.id,
    tag: tag,
    createdAt: article.createdAt
  }));
  res.json(tags);
});

// 保存文章的标签
app.post('/api/posts/:id/tags', (req, res) => {
  const article = data.articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const { tags } = req.body;
  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }
  // 去重
  article.tags = [...new Set(tags.map(t => t.trim()).filter(Boolean))];
  article.updatedAt = new Date().toISOString();
  saveData();
  const createdTags = article.tags.map((tag, index) => ({
    id: `tag-${req.params.id}-${index}`,
    articleId: req.params.id,
    tag: tag,
    createdAt: article.updatedAt
  }));
  res.status(201).json(createdTags);
});

app.listen(PORT, () => {
  console.log(`🚀 Ediora Backend API running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});

