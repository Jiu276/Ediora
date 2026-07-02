/**
 * summasite 专用：The Ultimate Guide to Shopping for Shoes on Zappos
 * 配图全部为鞋类/运动零售主题，正文对照 zappos.com 品类撰写。
 * @see https://www.zappos.com/
 */

const ZAPPOS_URL = process.env.ZAPPOS_URL || 'https://www.zappos.com/'
const { SHOES_GUIDE_IMAGES } = require('./zappos-footwear-images')

/** @param {string} text */
function link(text) {
  return `<a href="${ZAPPOS_URL}" target="_blank" rel="nofollow noopener noreferrer">${text}</a>`
}

const FIGURE = (url, alt, caption) => `<figure style="margin: 30px 0; text-align: center;">
  <img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
  <figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${caption}</figcaption>
</figure>`

/** caption / alt 不含 Shoes、Zappos 等关键词，避免超链接破坏 HTML */
const IMAGES = SHOES_GUIDE_IMAGES

/**
 * @returns {{
 *   title: string;
 *   excerpt: string;
 *   content: string;
 *   featuredImage: string;
 *   images: typeof IMAGES;
 *   links: Array<{ keyword: string; url: string }>;
 *   tags: string[];
 * }}
 */
function buildZapposShoesGuideArticle() {
  const z = link('Zappos')
  const sh = link('shoes')

  const content = `<p>My closet had three boxes from last season with tags still on them—each pair bought in a rush, each one wrong in a slightly different way. Too narrow in the toe, heel slip on downhills, fashion sneakers I tried to wear on wet sidewalks. A friend finally said, stop treating footwear like a lottery and use ${z} the way the site is actually built: huge selection, free shipping both ways, filters that respect width and activity type. I rebuilt my approach around ${sh} only—running, everyday sneakers, boots, sandals—and stopped mixing in random lifestyle buys that were never meant for miles.</p>

<h3>How the site is organized (and why that matters)</h3>
<p>${z} opens with departments that mirror a real shoe floor: Women, Men, Kids, then Sneakers, Running, Boots, Sandals. The homepage right now pushes current drops—HOKA Clifton 11 for daily miles, New Balance 740v2 retro runners, Birkenstock essentials for warm weather—not generic lifestyle clutter. That is the first clue you are in the right place: the featured blocks are almost always footwear or brands that sell it.</p>
<p>Free shipping and free returns on most orders change the math. I order two sizes when a model runs odd, walk around indoors on clean floors, and ship back the loser before the window closes. Wide width, narrow, and half sizes are filter fields, not buried FAQ footnotes. If you have ever kept a painful pair because returns felt like a project, this is the opposite workflow.</p>
${FIGURE(IMAGES[0].url, IMAGES[0].alt, IMAGES[0].caption)}

<h3>Running and training: where I start every refresh</h3>
<p>Under Running ${sh}, I filter road first, then brand. HOKA for max cushion daily trainers, Brooks Ghost for neutral road miles, Nike Pegasus when I want a familiar stack height. Trail gets its own toggle—outsole lugs and rock plates, not road foam on mud. The site groups HOKA, On, ASICS, and Brooks together so you are not scrolling skate silhouettes to find a marathon trainer.</p>
<p>Read reviews that mention four weeks of wear, not unboxing photos on carpet. Look for notes on sizing drift ("runs half size large"), hot spots on long runs, and how the upper breathes in humidity. Compare stack height and weight in the product details before you fall for a colorway you will hate when it is caked in winter salt.</p>
${FIGURE(IMAGES[1].url, IMAGES[1].alt, IMAGES[1].caption)}

<h3>Everyday sneakers, boots, and weather pairs</h3>
<p>Not every purchase is for logging miles. ${z} separates Everyday Sneakers from Running so you do not pay for plate and foam you will never use at the office. New Balance retro lines and low-profile pairs travel well; boots get filtered by waterproofing and tread when commute puddles show up in October.</p>
<p>Sandals and clogs have their own aisles—Birkenstock Arizona and Boston show up constantly for a reason: consistent footbeds and predictable sizing once you learn your length. Rain or shine blocks on the homepage point to outdoor pairs with grip for surprise storms; that is footwear logic, not fashion editorial.</p>
<p>Kids' back-to-school is sorted by big kid, little kid, toddler, and infant so you are not decoding charts at midnight. Cleats, rain boots, and school sneakers each have dedicated paths instead of one messy "children" dump.</p>
${FIGURE(IMAGES[2].url, IMAGES[2].alt, IMAGES[2].caption)}

<h3>A shortlist method that actually sticks</h3>
<p>Step one: write the job—road running, walking dog on pavement, standing eight hours, hiking weekend. Step two: set non-negotiables—wide width, vegan upper, waterproof membrane. Step three: open three tabs on ${z}, no more, and score weight, drop, outsole pattern, and return eligibility.</p>
<p>Step four: order with free shipping, test indoors, keep one pair, photograph the SKU label that worked. Step five: set a calendar note for six months out—foam compacts even when the upper still looks fine. VIP and linked Prime perks can stack on repeat buys if you replace trainers seasonally.</p>
${FIGURE(IMAGES[3].url, IMAGES[3].alt, IMAGES[3].caption)}

<h3>Returns, service, and the mistakes I stopped making</h3>
<p>Buying for looks without width is how dead boxes pile up. Using fashion ${sh} on trail mud ruins knees and outsoles in one afternoon. Ordering everything at once when you only needed one daily trainer burns budget and return patience.</p>
<p>When a sole delaminates early, document it the day you notice and use customer service while the window is open—that is what ${z} built its name on. Photograph the defect, keep the box until credit lands, and reorder the same SKU if the issue was a one-off, not a model-wide fit problem.</p>
${FIGURE(IMAGES[4].url, IMAGES[4].alt, IMAGES[4].caption)}

<h3>What I would do this week</h3>
<p>Pick one gap: dead running foam, leaky boots, or kids' outgrown sizes. Spend twenty minutes in the Running or Sneakers filter on ${z}, shortlist three pairs, and use free shipping to test fit at home. Return what fails, save the label photo of what wins, and ignore launch hype until the pair you already own is honestly finished.</p>
<p>Good ${sh} shopping is boring in the best way—clear filters, honest try-ons, clean returns. ${z} is built for that loop. Once the boxes stop being guesses, the closet stops being a graveyard of almost-right pairs.</p>`

  return {
    title: 'The Ultimate Guide to Shopping for Shoes on Zappos',
    excerpt:
      'Stop guessing sizes online. Use Zappos running, sneaker, and boot filters, free shipping, and at-home try-ons to build a footwear shortlist that fits— from HOKA daily trainers to Birkenstock sandals.',
    content,
    featuredImage: IMAGES[0].url,
    images: IMAGES,
    links: [
      { keyword: 'Zappos', url: ZAPPOS_URL },
      { keyword: 'shoes', url: ZAPPOS_URL },
    ],
    tags: ['fashion', 'life', 'shopping'],
  }
}

module.exports = { buildZapposShoesGuideArticle, ZAPPOS_URL, IMAGES }
