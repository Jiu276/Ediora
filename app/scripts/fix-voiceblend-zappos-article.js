/**
 * 修复 voiceblend「Step Up Your Style… Zappos」文章配图与正文。
 *
 * 用法（Ediora-voiceblend/app）:
 *   node scripts/fix-voiceblend-zappos-article.js
 *   DRY_RUN=1 node scripts/fix-voiceblend-zappos-article.js
 *   ARTICLE_ID=<uuid> node scripts/fix-voiceblend-zappos-article.js
 */
process.env.TITLE_NEEDLE = process.env.TITLE_NEEDLE || 'Step Up Your Style'
require('./update-zappos-article')
