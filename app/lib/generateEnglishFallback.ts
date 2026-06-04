/**
 * API / 星火不可用时的英文中等篇幅回退正文（非一句话模板）
 */
export function buildMediumEnglishFallbackArticle(
  articleTitle: string,
  options?: { category?: string; domains?: string[] },
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
      ],
    },
    {
      h: 'What to look for before you buy',
      body: [
        `Start with fit-for-purpose: define the job the product or service must do, then score options against that list instead of marketing claims. For ${articleTitle}, prioritize comfort, durability, ingredients or materials transparency, and return policies.`,
        `Check reviews that mention long-term use, not unboxing hype. Photos from real customers, sizing notes, and allergy or sensitivity comments matter more than generic five-star averages.`,
        `Compare total cost of ownership. Subscription refills, maintenance, and accessories can exceed the headline price. A slightly higher upfront cost often wins if it lowers waste and replacement frequency.`,
      ],
    },
    {
      h: 'Step-by-step routine you can follow',
      body: [
        `Step 1: Audit what you already own and note gaps. Step 2: Set a realistic budget band and non-negotiables (for example, fragrance-free, vegan, or machine-washable). Step 3: Shortlist three options and read one in-depth comparison each.`,
        `Step 4: Run a small trial when possible—travel sizes, sample sets, or a single core item before building a full kit. Step 5: Track results for two to four weeks with simple notes: what improved, what did not, and what to adjust.`,
        `This cadence keeps ${articleTitle} practical. You learn quickly without abandoning a full routine after one disappointing purchase.`,
      ],
    },
    {
      h: 'Common mistakes to avoid',
      body: [
        `Buying everything at once is the fastest way to overspend and under-use. Layer one hero product, validate it, then expand.`,
        `Ignoring compatibility—skin type, climate, storage space, or gear sizing—creates friction that no marketing copy can fix.`,
        `Chasing trends instead of constraints leads to clutter. Anchor on your real context in ${domainText}, not a generic influencer shelfie.`,
      ],
    },
    {
      h: 'Expert-style tips that actually help',
      body: [
        `Batch decisions: dedicate one session to research, one to purchase, and a weekly check-in for tweaks. Decision fatigue drops when you separate browsing from buying.`,
        `Photograph labels and receipts. Warranty, batch codes, and ingredient lists are easier to reference later when you reorder.`,
        `If ${category} offers seasonal shifts, plan refreshes on a calendar reminder rather than impulse sales alerts.`,
      ],
    },
    {
      h: 'How to compare options side by side',
      body: [
        `Build a simple scorecard with five criteria weighted for your situation: performance, price per use, maintenance, sustainability, and support. Rate each finalist from 1–5 and multiply by the weight. The highest total wins only if it passes your non-negotiables.`,
        `When two products tie, choose the one with clearer documentation and spare parts availability. Long-term ownership costs often hide in discontinued accessories or proprietary refills.`,
        `For ${articleTitle}, repeat the scorecard every six months. Categories evolve quickly; yesterday’s best pick may be overpriced once newer formulas or models ship.`,
      ],
    },
    {
      h: 'Questions readers ask most often',
      body: [
        `How long before I see results? Most people notice meaningful differences after two to four weeks of consistent use, not after a single application or session.`,
        `Can I mix brands? Usually yes for accessories, but core formulas and electronics should stay within one ecosystem unless compatibility is documented.`,
        `What if I have sensitivities? Patch-test new items, introduce one change at a time, and keep a photo log of reactions to share with a professional if needed.`,
      ],
    },
    {
      h: 'Conclusion and next steps',
      body: [
        `${articleTitle} rewards consistency more than intensity. Choose a minimal stack, measure results, and upgrade one element at a time.`,
        `If you are starting today, pick one action from the routine section, schedule a two-week review, and only then add the next item. That is how medium-term gains compound without burnout.`,
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
  ]

  for (const s of sections) {
    parts.push(`<h3>${s.h}</h3>`)
    for (const para of s.body) {
      parts.push(p(para))
    }
  }

  return parts.join('\n')
}
