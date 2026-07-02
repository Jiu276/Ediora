/**
 * Zappos 文章共用配图（Unsplash / Pexels，免版税）。
 * 刻意避免霓虹棚拍单品图，选用户外跑步、零售陈列、真实穿着场景。
 * @see https://www.zappos.com/
 */

/** @param {string} unsplashId */
function unsplash(unsplashId) {
  return `https://images.unsplash.com/${unsplashId}?w=1200&q=80&auto=format&fit=crop`
}

/** @param {number|string} pexelsId */
function pexels(pexelsId) {
  return `https://images.pexels.com/photos/${pexelsId}/pexels-photo-${pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=1200`
}

/** summasite《Shopping for Shoes on Zappos》 */
const SHOES_GUIDE_IMAGES = [
  {
    url: unsplash('photo-1543163521-1bf539c55dd2'),
    alt: 'Retail wall with rows of athletic trainers and sneakers in a specialty store',
    caption:
      'The site mirrors a real shoe floor—filter by running, sneakers, or boots before you scroll lifestyle clutter.',
    source: 'unsplash',
  },
  {
    url: unsplash('photo-1476480862122-209bfaa8edc8'),
    alt: 'Runner on an open road at golden-hour sunset with long summer daylight',
    caption:
      'Road mileage is the test—stack height and outsole rubber show their worth after week three, not day one.',
    source: 'unsplash',
  },
  {
    url: unsplash('photo-1571008887538-b879bb934af7'),
    alt: 'Woman jogging outside on a sunny day in athletic apparel',
    caption:
      'Everyday trainers and running pairs serve different jobs—separate filters keep you from overpaying for plate foam.',
    source: 'unsplash',
  },
  {
    url: pexels('33957265'),
    alt: 'Worn Nike Invincible Run trainers on concrete showing midsole compression',
    caption:
      'Foam compacts even when the upper still looks fine—note the calendar when you cross three hundred miles.',
    source: 'pexels',
  },
  {
    url: unsplash('photo-1594882645126-1469b9d575e4'),
    alt: 'Close-up of athletic trainers splashing through water on a paved running path',
    caption:
      'Wet pavement exposes grip fast—read reviews about outsole rubber, not just upper colorways.',
    source: 'unsplash',
  },
]

/** voiceblend《Step Up Your Style…》 */
const SHOPPING_GUIDE_IMAGES = [
  {
    url: unsplash('photo-1476480862122-209bfaa8edc8'),
    alt: 'Runner on a road at sunset during extended summer daylight',
    caption:
      'Free shipping both ways makes it reasonable to shortlist two sizes and keep the pair that stays quiet on mile five.',
    source: 'unsplash',
  },
  {
    url: unsplash('photo-1543163521-1bf539c55dd2'),
    alt: 'Wall of athletic footwear inside a running specialty retail store',
    caption:
      'Brand filters for HOKA, Brooks, Nike, and New Balance sit next to each other—compare stack and weight in one session.',
    source: 'unsplash',
  },
  {
    url: pexels('33957265'),
    alt: 'Well-worn Nike road running trainers resting on a concrete sidewalk',
    caption:
      'Replace daily trainers on mileage, not vanity—the midsole tells the truth before the upper looks tired.',
    source: 'pexels',
  },
  {
    url: unsplash('photo-1552674602-db6ffd4adf3c'),
    alt: 'Pack of road runners mid-stride during an outdoor race',
    caption:
      'Reviews that mention four weeks of wear beat unboxing hype every time.',
    source: 'unsplash',
  },
]

/** summasite《Longer Days, Longer Runs…》 */
const LONGER_RUNS_IMAGES = [
  {
    url: unsplash('photo-1476480862122-209bfaa8edc8'),
    alt: 'Silhouette runner on a road at sunset with extended evening light',
    caption:
      'June light stays up past dinner—that is when the extra miles actually happen.',
    source: 'unsplash',
  },
  {
    url: pexels('33957265'),
    alt: 'Worn Nike cushioned running trainers on a concrete surface',
    caption:
      'Dead daily foam is the honest reason to open a cart—midsole compression does not lie.',
    source: 'pexels',
  },
  {
    url: unsplash('photo-1571008887538-b879bb934af7'),
    alt: 'Woman running outdoors in warm weather athletic gear',
    caption:
      'Heat and humidity change fit—order wide or half-up when summer swelling is real for you.',
    source: 'unsplash',
  },
  {
    url: unsplash('photo-1732869112005-8c93bb3f29d3'),
    alt: 'Trail runner moving through a wooded path in running footwear',
    caption:
      'Trail pairs need lugs and rock plates—keep road foam off muddy loops.',
    source: 'unsplash',
  },
]

module.exports = {
  SHOES_GUIDE_IMAGES,
  SHOPPING_GUIDE_IMAGES,
  LONGER_RUNS_IMAGES,
  unsplash,
  pexels,
}
