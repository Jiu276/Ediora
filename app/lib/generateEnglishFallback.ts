import {
  getPlainTextLength,
  MIN_ARTICLE_PLAIN_CHARS,
} from '@/lib/articleLength'

/**
 * API / 星火不可用时的英文中等篇幅回退正文（非一句话模板）
 * @param articleTitle - 文章标题
 * @param options - 可选类别与域名
 * @param minPlainChars - 纯文本最少字符数，默认 {@link MIN_ARTICLE_PLAIN_CHARS}
 */
export function buildMediumEnglishFallbackArticle(
  articleTitle: string,
  options?: { category?: string; domains?: string[] },
  minPlainChars: number = MIN_ARTICLE_PLAIN_CHARS,
): string {
  const category = options?.category?.trim() || 'this topic'
  const domainText =
    options?.domains && options.domains.length > 0
      ? options.domains.join(', ')
      : 'everyday use'

  const p = (text: string) => `<p>${text}</p>`

  const sections = [
    {
      h: 'Why it matters now',
      body: [
        `${articleTitle} sits at the center of how people research, compare, and buy in ${domainText}. Readers arrive with specific goals—better results, fewer regrets, and a routine they can repeat. A clear framework turns scattered tips into a plan you can follow this week.`,
        `When you understand the trade-offs behind ${articleTitle}, you spend less on products that do not fit and more on choices that compound over time. That is especially true if you are balancing budget, quality, and how often you will actually use what you buy.`,
        `Skincare and lifestyle categories change quickly; anchoring on principles—not hype—keeps your shelf honest and your spending predictable.`,
        `Think of this guide as a buying checklist plus a usage playbook: what to prioritize first, what to defer, and how to tell whether a product is actually working for you.`,
      ],
    },
    {
      h: 'What to look for before you buy',
      body: [
        `Start with fit-for-purpose: define the job the product must do, then score options against that list instead of marketing claims. For ${articleTitle}, prioritize ingredient transparency, texture, how it layers with SPF, and return policies.`,
        `Check reviews that mention four-plus weeks of use, not unboxing hype. Photos from real customers, scent notes, and sensitivity comments matter more than generic five-star averages.`,
        `Compare total cost of ownership: refills, pumps, and travel sizes can exceed the headline price. A slightly higher upfront cost often wins if it lowers waste and replacement frequency.`,
        `Look for consistency in batch quality—if a brand reformulates often, save the ingredient list that worked so you can compare later releases.`,
      ],
    },
    {
      h: 'Morning and evening routine basics',
      body: [
        `Morning routines should protect: cleanse gently, hydrate, then SPF. Evening routines should repair: cleanse, treat, then seal with a moisturizer appropriate for your skin type.`,
        `When exploring ${articleTitle}, introduce one active at a time. If you add vitamin C in the morning and retinol at night in the same week, you will not know which product caused a reaction.`,
        `Wait two minutes between thin layers so textures do not pill. If pilling happens, simplify—fewer layers often perform better under makeup and sunscreen.`,
      ],
    },
    {
      h: 'Step-by-step routine you can follow',
      body: [
        `Step 1: Audit what you already own and note gaps. Step 2: Set a realistic budget band and non-negotiables (fragrance-free, vegan, reef-safe, etc.). Step 3: Shortlist three options and read one in-depth comparison each.`,
        `Step 4: Run a small trial—deluxe samples or a single hero serum before building a full shelf. Step 5: Track results for two to four weeks: hydration, tone, irritation, and how makeup sits on top.`,
        `This cadence keeps ${articleTitle} practical. You learn quickly without abandoning a full routine after one disappointing purchase.`,
        `Document small wins: a photo in consistent lighting every Sunday helps you see progress that day-to-day mirrors hide.`,
      ],
    },
    {
      h: 'Common mistakes to avoid',
      body: [
        `Buying everything at once is the fastest way to overspend and under-use. Layer one hero product, validate it, then expand.`,
        `Ignoring compatibility—skin type, climate, and actives like retinol or vitamin C—creates irritation that no marketing copy can fix.`,
        `Chasing trends instead of constraints leads to clutter. Anchor on your real context in ${domainText}, not a generic influencer shelfie.`,
        `Over-exfoliating while trying new products is another common trap—space chemical and physical exfoliation days apart when you are testing formulas.`,
      ],
    },
    {
      h: 'Expert-style tips that actually help',
      body: [
        `Batch decisions: dedicate one session to research, one to purchase, and a weekly check-in for tweaks. Decision fatigue drops when you separate browsing from buying.`,
        `Photograph ingredient lists and batch codes. Reorders are easier when you know exactly which variant worked.`,
        `If ${category} offers seasonal shifts, plan refreshes on a calendar reminder rather than impulse sales alerts.`,
        `Keep a “works/does not work” note on your phone—one line per product beats relying on memory across months.`,
      ],
    },
    {
      h: 'How to compare options side by side',
      body: [
        `Build a scorecard with five weighted criteria: performance, price per use, texture, sustainability, and support. Rate each finalist from 1–5 and multiply by the weight.`,
        `When two products tie, choose the one with clearer documentation and consistent availability. Discontinued lines trap you with substitutions that change performance.`,
        `For ${articleTitle}, repeat the scorecard every six months. Formulas evolve; yesterday’s favorite may be reformulated.`,
        `Price per milliliter is a fairer metric than sticker price—compare fill size and how many weeks a bottle lasts at your usage rate.`,
      ],
    },
    {
      h: 'Questions readers ask most often',
      body: [
        `How long before I see results? Most people notice meaningful differences after two to four weeks of consistent use, not after a single application.`,
        `Can I mix brands? Often yes, but pair actives carefully—introduce one new product at a time so you know what caused a reaction.`,
        `What if I have sensitivities? Patch-test new items on the jawline, keep a simple log, and pause exfoliants when trying richer creams.`,
        `Do I need the full line? Rarely—a hero cleanser, treatment, moisturizer, and SPF cover most needs before specialty add-ons.`,
      ],
    },
    {
      h: 'Building a sustainable shelf',
      body: [
        `A sustainable shelf is small, legible, and replaceable. Cap active products at what you will actually finish in ninety days, and photograph the order you apply them so you do not double-exfoliate by accident.`,
        `Store items away from heat and direct sun; stability matters as much as formula quality. When something pills under sunscreen, change the order—thinner fluids first, richer creams last.`,
        `If ${articleTitle} includes SPF in the morning routine, treat sunscreen as non-negotiable even on cloudy days. Prevention consistently beats correction for tone and texture.`,
      ],
    },
    {
      h: 'Conclusion and next steps',
      body: [
        `${articleTitle} rewards consistency more than intensity. Choose a minimal stack, measure results, and upgrade one element at a time.`,
        `If you are starting today, pick one action from the routine section, schedule a two-week review, and only then add the next item.`,
        `Bookmark this guide and revisit before seasonal sales or travel—those are the moments when rushed purchases create the most waste.`,
      ],
    },
  ]

  const parts: string[] = [
    `<h2>${articleTitle}</h2>`,
    p(
      `${articleTitle} is worth a thoughtful, practical guide—not a hype sheet. This article walks through what matters, how to choose well, and how to build habits that stick around ${domainText}.`,
    ),
    p(
      `Whether you are new to the category or refining a setup you already use, the goal is the same: better outcomes with less trial-and-error. Use the sections below as a checklist you can revisit before your next purchase.`,
    ),
    p(
      `The following sections are written for real-world decisions—budget, timing, and how products interact—so you can shop once with confidence instead of repeating the same experiments every season.`,
    ),
  ]

  for (const s of sections) {
    parts.push(`<h3>${s.h}</h3>`)
    for (const para of s.body) {
      parts.push(p(para))
    }
  }

  let html = parts.join('\n')

  let i = 1
  while (getPlainTextLength(html) < minPlainChars && i <= 6) {
    html += `\n<h3>Practical notes ${i}</h3>`
    html += p(
      `When applying ideas from ${articleTitle}, keep expectations realistic: small, steady improvements beat overnight transformations. Note hydration, texture, and how products feel under sunscreen and makeup—those daily signals matter more than mirror checks alone.`,
    )
    html += p(
      `If something stings or pills, pause new introductions for a few days, simplify your layers, and reintroduce products one at a time. This troubleshooting step saves money and prevents you from discarding a good formula too early.`,
    )
    i++
  }

  return html
}
