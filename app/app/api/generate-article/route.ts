import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateArticle } from '@/lib/spark'

// POST /api/generate-article - 生成文章内容（星火API，失败时回退模板）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, categoryId, domains = [], prompt } = body
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '缺少标题' }, { status: 400 })
    }

    // 获取类别信息
    let categoryName = ''
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          deletedAt: null,
        },
      })
      if (category) {
        categoryName = category.name
      }
    }
    
    // 优先使用星火 API
    try {
      const result = await generateArticle({
        title: title.trim(),
        userPrompt: prompt,
        category: categoryName,
        domains,
      })
      return NextResponse.json(result)
    } catch (err) {
      console.warn('Spark generateArticle failed, fallback to template:', err)
    }

    // 回退：使用模板生成
    const generateContentByCategory = (catName: string, articleTitle: string) => {
      const contentTemplates: Record<string, string> = {
        '生活': `
          <h2>${articleTitle}</h2>
          <p>在日常生活中，我们总是在寻找提升生活品质的方法。${articleTitle}正是这样一个值得关注的话题。</p>
          <h3>一、理解${articleTitle}的重要性</h3>
          <p>${articleTitle}不仅影响着我们的日常生活，更关系到我们的幸福感和生活质量。通过深入了解和实践，我们可以让生活变得更加美好。</p>
          <h3>二、${articleTitle}的实践方法</h3>
          <p>${domains.length > 0 ? `在${domains.join('、')}等领域，我们可以通过多种方式来实践${articleTitle}。` : `实践${articleTitle}需要我们从多个角度出发，结合实际情况制定合适的方案。`}关键是要找到适合自己的方法，并持之以恒地执行。</p>
          <h3>三、常见问题与解决方案</h3>
          <p>在实践过程中，我们可能会遇到各种挑战。面对这些问题，保持耐心和积极的心态非常重要。通过不断学习和调整，我们能够克服困难，取得进步。</p>
          <h3>四、总结与展望</h3>
          <p>${articleTitle}是一个持续的过程，需要我们不断地学习和改进。希望本文能够为您提供一些有用的思路和启发，帮助您在生活品质提升的道路上走得更远。</p>
        `,
        '旅游': `
          <h2>${articleTitle}</h2>
          <p>旅行是探索世界、丰富人生的重要方式。${articleTitle}将带您了解旅行的魅力和意义。</p>
          <h3>一、${articleTitle}的魅力所在</h3>
          <p>每一次旅行都是一次新的发现。${articleTitle}不仅能让我们看到不同的风景，更能让我们体验不同的文化，开阔我们的视野。</p>
          <h3>二、如何规划${articleTitle}</h3>
          <p>${domains.length > 0 ? `对于${domains.join('、')}等目的地的旅行，` : `一次成功的旅行，`}需要提前做好充分的准备。从目的地选择、行程安排到预算规划，每一个环节都需要仔细考虑。</p>
          <h3>三、旅行中的注意事项</h3>
          <p>在旅行过程中，安全是最重要的。同时，尊重当地文化、保护环境也是每个旅行者应该承担的责任。让我们做一个负责任的旅行者。</p>
          <h3>四、旅行带来的收获</h3>
          <p>${articleTitle}不仅是一次身体的旅行，更是一次心灵的洗礼。通过旅行，我们能够更好地认识自己，理解世界，丰富人生阅历。</p>
        `,
        '科技': `
          <h2>${articleTitle}</h2>
          <p>科技正在改变我们的生活方式。${articleTitle}将探讨科技发展的最新趋势和影响。</p>
          <h3>一、${articleTitle}的技术背景</h3>
          <p>随着技术的不断进步，${articleTitle}所涉及的技术领域正在快速发展。了解这些技术背景，有助于我们更好地理解其应用和前景。</p>
          <h3>二、${articleTitle}的应用场景</h3>
          <p>${domains.length > 0 ? `在${domains.join('、')}等领域，` : `在多个领域，`}${articleTitle}都有着广泛的应用。从日常生活到商业应用，科技正在改变我们的工作和生活方式。</p>
          <h3>三、技术发展的挑战与机遇</h3>
          <p>任何技术的发展都伴随着挑战与机遇。对于${articleTitle}，我们需要理性看待其带来的变化，既要抓住机遇，也要应对挑战。</p>
          <h3>四、未来展望</h3>
          <p>${articleTitle}的未来发展充满无限可能。随着技术的不断成熟，我们有理由相信，它将为我们的生活带来更多便利和惊喜。</p>
        `,
      }
      
      return contentTemplates[catName] || `
        <h2>${articleTitle}</h2>
        <p>${articleTitle}是一个值得深入探讨的话题。本文将为您全面解析这一主题。</p>
        <h3>一、${articleTitle}概述</h3>
        <p>${articleTitle}涉及多个方面的内容。通过系统性的了解，我们能够更好地把握其核心要义。</p>
        <h3>二、核心要点分析</h3>
        <p>${domains.length > 0 ? `在${domains.join('、')}等领域的应用中，` : `在实践过程中，`}${articleTitle}展现出其独特的价值和意义。</p>
        <h3>三、实践建议</h3>
        <p>为了更好地应用${articleTitle}，我们需要掌握正确的方法和技巧。通过不断学习和实践，我们能够取得更好的效果。</p>
        <h3>四、总结</h3>
        <p>${articleTitle}是一个持续学习和实践的过程。希望本文能够为您提供有价值的参考和指导。</p>
      `
    }
    
    const articleContent = generateContentByCategory(categoryName, title)
    
    return NextResponse.json({ content: articleContent })
  } catch (error) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    )
  }
}

