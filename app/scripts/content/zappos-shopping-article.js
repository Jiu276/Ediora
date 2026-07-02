/**
 * Zappos 购物指南正文：配图均为鞋类/零售主题，关键词链至 zappos.com。
 * @see https://www.zappos.com/
 */

const ZAPPOS_URL = process.env.ZAPPOS_URL || 'https://www.zappos.com/'

/** @param {string} text */
function link(text) {
  return `<a href="${ZAPPOS_URL}" target="_blank" rel="nofollow noopener noreferrer">${text}</a>`
}

const FIGURE = (url, alt, caption) => `<figure style="margin: 30px 0; text-align: center;">
  <img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
  <figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${caption}</figcaption>
</figure>`

/** 配图说明刻意避开「Shoes / Zappos」等关键词，防止自动超链接破坏 caption */
const IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
    alt: 'Bold red Nike running trainer on a yellow studio backdrop',
    caption: 'Running trainers are a core category—start with fit and return policy before chasing colorways.',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80&auto=format&fit=crop',
    alt: 'High-top basketball sneaker product photography',
    caption: 'Basketball and lifestyle sneakers sit side by side on Zappos—filter by brand, size, and width.',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80&auto=format&fit=crop',
    alt: 'Retail wall displaying rows of athletic footwear',
    caption: 'A wide brand wall means you can compare Nike, HOKA, New Balance, and Birkenstock in one session.',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80&auto=format&fit=crop',
    alt: 'Multiple running trainers arranged on a store shelf',
    caption: 'Use size filters and width options early—fewer boxes shipped back means faster wardrobe upgrades.',
    source: 'unsplash',
  },
]

/**
 * @returns {{ title: string; excerpt: string; content: string; featuredImage: string; images: typeof IMAGES; links: Array<{ keyword: string; url: string }> }}
 */
function buildZapposArticle() {
  const z = link('Zappos')

  const content = `<p>I used to treat online footwear shopping like a lottery—order two sizes, hope one fits, and eat the return hassle when neither did. Then a coworker pointed me to ${z} and I realized I had been doing everything backwards. The site is built around selection first: thousands of styles from Nike, HOKA, New Balance, Birkenstock, and dozens more, with filters for width, arch support, and activity type before you ever hit checkout. Free shipping both ways on most orders changed the math entirely. I could shortlist three pairs, try them at home, and send back what did not match my foot—not my mood that Tuesday.</p>

<h3>Why Zappos works when other retailers feel chaotic</h3>
<p>${z} organizes around how people actually buy footwear. You are not scrolling endless lifestyle photos with no size in stock. You pick men, women, or kids, narrow by sneaker, boot, sandal, or running, then filter by brand and price band. The homepage rotates real launches—HOKA Clifton updates, New Balance retro drops, Birkenstock essentials—so you see what is current without hunting forums.</p>
<p>Free shipping and straightforward returns remove the penalty for being honest about fit. Wide feet, high arches, and half sizes are searchable fields, not afterthoughts buried in reviews. That matters if you have ever kept an uncomfortable pair because sending it back felt like more work than wearing blisters for a month.</p>
${FIGURE(IMAGES[0].url, IMAGES[0].alt, IMAGES[0].caption)}

<h3>Building a shortlist before you buy</h3>
<p>Start with the job: road running, daily walking, office loafers, or kids' school sneakers. Write down non-negotiables—waterproof, slip-resistant, vegan materials, or a specific width. On ${z}, open three tabs maximum and compare weight, stack height for runners, and outsole pattern for wet pavement.</p>
<p>Read reviews that mention four-plus weeks of wear, not unboxing posts. Look for comments on sizing drift ("runs half size large") and break-in time for leather boots. Check whether the style you want participates in free return shipping—most do, but verifying saves a surprise label fee on clearance items.</p>
<p>Compare total cost, not sticker price alone: a slightly higher pair that fits on the first try beats two cheap orders and a week without the right gear. ${z} VIP and linked Prime benefits can stack points on repeat purchases if you buy footwear seasonally.</p>
${FIGURE(IMAGES[1].url, IMAGES[1].alt, IMAGES[1].caption)}

<h3>Categories worth browsing first</h3>
<p>Running and training: filter by HOKA, ASICS, Brooks, and Nike if you want cushioned daily trainers or race-day plates. Lifestyle sneakers: New Balance 740v2-style retro silhouettes and low-profile pairs for travel. Boots and weather: prioritize tread depth and waterproof membranes if you commute on wet sidewalks.</p>
<p>Sandals and clogs: Birkenstock Arizona and Boston lines dominate warm-weather searches for a reason—replaceable footbeds and consistent sizing. Kids' back-to-school: sort by big kid versus toddler so you are not guessing conversion charts at midnight.</p>
<p>The brand index on ${z} is faster than guessing URLs. Search "Clifton," "740," or "Arizona" and let the site surface current colorways instead of outdated third-party listings.</p>
${FIGURE(IMAGES[2].url, IMAGES[2].alt, IMAGES[2].caption)}

<h3>Fit, returns, and keeping pairs you actually wear</h3>
<p>Measure feet in the evening when they are slightly swollen—that is when tight toe boxes hurt most. If you are between sizes on ${z}, order both when free returns apply, and wear them indoors on clean floors before deciding. Lace patterns and insole swaps fix minor heel slip without sizing up entirely.</p>
<p>Photograph the SKU label when a pair works. Reorders disappear less often when you save the exact color code. Rotate two pairs for running so midsoles recover; the site makes that affordable when you watch seasonal markdowns on prior-year models.</p>
<p>When something fails early—a sole delamination or stitching flaw—use customer service while the return window is open. ${z} built its reputation on service; document the issue with photos the same day you notice it.</p>
${FIGURE(IMAGES[3].url, IMAGES[3].alt, IMAGES[3].caption)}

<h3>Common mistakes to skip</h3>
<p>Buying for looks alone without checking width is the fastest route to a closet graveyard. Ignoring activity type—using fashion sneakers for trail mud—ruins both the pair and your knees. Chasing every drop instead of replacing the one worn-out daily trainer you actually live in.</p>
<p>Another trap: skipping socks you plan to wear. Try gym socks with running trainers and dress thickness with loafers before the return clock runs out. ${z} makes experimentation cheap; use that, but test honestly at home.</p>

<h3>Putting it together this week</h3>
<p>Pick one gap—worn running foam, leaky winter boots, or kids' outgrown sizes. Spend twenty minutes on ${z} filters, shortlist three options, and order with free shipping. Wear them indoors for two days, return what fails, and keep a photo of the winner's label for next season.</p>
<p>Footwear rewards patience more than impulse. A tight edit of pairs that fit beats a pile of almost-right boxes. ${z} is built for that rhythm: browse deeply, try calmly, return cleanly, and step up your style one confident fit at a time.</p>`

  return {
    title: 'Step Up Your Style: The Ultimate Guide to Shopping on Zappos',
    excerpt:
      'From Nike runners to Birkenstock sandals, learn how to use Zappos filters, free shipping, and returns to build a footwear shortlist that actually fits—without the two-size guessing game.',
    content,
    featuredImage: IMAGES[0].url,
    images: IMAGES,
    links: [
      { keyword: 'Zappos', url: ZAPPOS_URL },
    ],
  }
}

module.exports = { buildZapposArticle, ZAPPOS_URL }
