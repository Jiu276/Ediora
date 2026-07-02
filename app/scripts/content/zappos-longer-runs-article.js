/**
 * Zappos 夏季跑步主题文章：Longer Days, Longer Runs。
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

const IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1476480862122-209bfaa8edc8?w=1200&q=80&auto=format&fit=crop',
    alt: 'Runner silhouetted against a golden summer sunset on an open road',
    caption: 'June light stays up past dinner—that is when the extra miles actually happen.',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
    alt: 'Bright red Nike Free running trainer on a yellow studio background',
    caption: 'Daily trainers take a beating; midsole foam does not care about your calendar.',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1571008887538-b879bb934af7?w=1200&q=80&auto=format&fit=crop',
    alt: 'Woman jogging outdoors on a warm sunny day in athletic gear',
    caption: 'Heat changes pace. Fabric and fit matter more once the humidity climbs.',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1552674602-db6ffd4adf3c?w=1200&q=80&auto=format&fit=crop',
    alt: 'Group of runners mid-stride during an outdoor road race',
    caption: 'A rotating pair for long days and a lighter pair for tempo work spreads the load.',
    source: 'unsplash',
  },
]

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
function buildZapposLongerRunsArticle() {
  const z = link('Zappos')
  const lr = link('Longer Runs')
  const sh = link('shoes')

  const content = `<p>On Tuesday the sun was still out at 8:41 p.m., and I had already logged eight miles before lunch. That combination—more daylight, legs that still feel willing after work—is why my browser keeps landing on ${z}. The site is running its ${lr} push right now, the kind of seasonal nudge that sounds like marketing until you realize your Clifton 8s have 340 miles on them and the foam feels like a sponge left in the sink. I did not need a lecture about training blocks. I needed a cart, free shipping, and the option to send back anything that rubbed wrong on mile three.</p>

<h3>The cart started with one honest problem</h3>
<p>My easy-day ${sh} were dead. Not visually— the uppers still looked fine—but the heel counter had gone soft and my left knee started whispering on downhills. ${z} makes that replacement less painful because you can filter by activity first: road running, trail, training, walking. I skipped the lifestyle sneaker pages entirely and opened Running under Women (same logic applies on the men's side if that is your aisle).</p>
<p>The homepage was pushing the HOKA Clifton 11—the updated daily trainer with the cleaner upper and the same max-cushion pitch that made the Clifton line famous for people who stack mileage without wanting a brick on their foot. I had run in Clifton 8 and 9; the 11 looked like the first version in a while worth trying instead of just re-ordering the previous number. Added wide width and half-size up to the cart because summer feet swell. That is not overthinking; it is Tuesday humidity.</p>
${FIGURE(IMAGES[0].url, IMAGES[0].alt, IMAGES[0].caption)}

<h3>What else belongs in a summer mileage refresh</h3>
<p>One pair of ${sh} is never the whole story once ${lr} turn into double sessions. On ${z} I split the cart into three jobs: a cushioned daily trainer (the Clifton 11), a lighter shoe for uptempo days, and the boring stuff that prevents blisters when you extend evening loops.</p>
<p>For tempo I short-listed the Nike Pegasus line and a Brooks Ghost—both easy to find with the brand filter, both usually eligible for free shipping both ways. I also grabbed Balega hidden comfort socks because no shoe fixes a hot spot you keep repeating, and a pair of Path Projects shorts with a liner that does not ride up when you are tired and sloppy at mile ten.</p>
<p>The site groups HOKA, On, ASICS, and Brooks under running in a way that mirrors how specialty shops floor their walls. You are not digging through skate ${sh} to find a plated racer. If you are building a summer rotation, start with two pairs max and actually rotate them—foam needs recovery days as much as calves do.</p>
${FIGURE(IMAGES[1].url, IMAGES[1].alt, IMAGES[1].caption)}

<h3>Using filters so you do not return half the box</h3>
<p>${z} search is only useful if you treat filters like a checklist. I set width first (wide for me in HOKA), then size, then closed-toe and road surface. Customer photos matter more than star averages—look for reviewers mentioning four-week wear, not unboxing shots on a rug.</p>
<p>Free returns are the reason I order two sizes when a model runs odd. Try them inside on clean floors, lace both feet the same, walk stairs, do ten jumping jacks. The pair that stays quiet wins. Ship the other back before life gets busy and the box sits in the hall for a month. VIP shipping on repeat orders is worth setting up if you are replacing trainers every three months through summer.</p>
${FIGURE(IMAGES[2].url, IMAGES[2].alt, IMAGES[2].caption)}

<h3>Trail evenings and the second pair</h3>
<p>Not every ${lr} happen on pavement. Once daylight stretches, I mix a weekly trail loop—roots, loose gravel, the occasional puddle from a sprinkler that runs too long. Trail ${sh} need bite in the outsole and a tighter midfoot; road cushions feel slick on dirt. On ${z} the trail running filter under sneakers pulls HOKA Challenger styles, Salomon options, and a few Nike Pegasus Trail variants without wandering into hiking boots that are overkill for a five-miler.</p>
<p>I keep trail pairs older on purpose. They take scuffs I would hate on fresh road foam. If you only buy one new pair this season, make it the daily road trainer and demote last year's model to dirt duty. Your knees will notice the stack height difference even if your Strava title does not.</p>
${FIGURE(IMAGES[3].url, IMAGES[3].alt, IMAGES[3].caption)}

<h3>Checkout, delivery, and the first week back out</h3>
<p>Cart total landed under what I would have spent impulse-buying at a strip-mall store, mostly because ${z} runs promos on last-season colorways if you ignore the loudest launch color. I picked a boring Clifton 11 colorway that will still look fine with race photos in September.</p>
<p>Boxes showed up in three days. First run was a slow six-miler at dusk—exactly the ${lr} window the site keeps advertising. Clifton 11 felt springier than my beaten 8s without feeling unstable. No hot spots. I logged the old pair's retirement date in my notes app so I do not lie to myself about mileage next spring.</p>
<p>If you are stacking summer miles, treat ${z} like a gear room with a generous return desk: order with intent, test honestly at home, keep what earns its spot in the rotation. Longer daylight is temporary; worn-out foam is not. Lace up while the light holds, and let the cart do the boring comparison work so you can spend the extra hour outside instead of scrolling.</p>`

  return {
    title: 'Longer Days, Longer Runs, and a Zappos Cart Full of New Gear',
    excerpt:
      'Summer daylight stretched my evening miles—and wore out my daily trainers. Here is how I rebuilt a Zappos cart around HOKA Clifton 11, rotation pairs, and free returns without the usual sizing guesswork.',
    content,
    featuredImage: IMAGES[0].url,
    images: IMAGES,
    links: [
      { keyword: 'Zappos', url: ZAPPOS_URL },
      { keyword: 'Longer Runs', url: ZAPPOS_URL },
      { keyword: 'shoes', url: ZAPPOS_URL },
    ],
    tags: ['running', 'life', 'gear'],
  }
}

module.exports = { buildZapposLongerRunsArticle, ZAPPOS_URL }
