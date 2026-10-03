// build-blog.mjs -- Blog post builder for theshorttermrentalblog.com
// Generates long-form blog pages with BlogPosting + FAQPage schema
// Run AFTER the main build.mjs

import fs from 'node:fs';
import path from 'node:path';

const origin = 'https://theshorttermrentalblog.com';
const blogData = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8'));
const posts = blogData.posts;

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const categories = {
  investing: { name: 'STR Investing', slug: 'investing' },
  operations: { name: 'STR Operations', slug: 'operations' },
  tax: { name: 'STR Tax Strategy', slug: 'tax-strategy' },
  design: { name: 'STR Design', slug: 'design' },
  markets: { name: 'City Guides', slug: 'city-guides' },
  reviews: { name: 'Reviews & Alternatives', slug: 'reviews' }
};

const blogUrls = [];

function blogPage(url, title, description, body, options = {}) {
  blogUrls.push(url);
  const { schema = null, noindex = false } = options;
  const fullTitle = title + ' | The Short Term Rental Blog';
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${origin}${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${origin}${url}">
<meta property="og:site_name" content="The Short Term Rental Blog">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="${origin}/social-card.svg">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}">
<meta name="theme-color" content="#183b34">
<link rel="stylesheet" href="/style.css">
${schemas.map(item => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header>
<a class="site-name" href="/">Short-term rental<br><strong>field notes.</strong></a>
<nav aria-label="Main navigation">
<a href="/blog">Blog</a>
<a href="/library">All answers</a>
<a href="/topics">Topics</a>
<a href="/tools/cash-flow">Cash-flow tool</a>
</nav>
</header>
<main id="main">${body}</main>
<footer>
<div>
<strong>Better questions. Better hosting.</strong>
<p>Educational answers for people who own, operate, or are exploring short-term rentals.</p>
<p>Looking for a done-for-you short-term rental? Visit <a href="https://www.bnbaccelerator.com">BnB Accelerator</a>.</p>
</div>
<nav aria-label="Footer navigation">
<a href="/blog">Blog</a>
<a href="/library">Answer library</a>
<a href="/editorial">Editorial policy</a>
<a href="/privacy">Privacy</a>
<a href="/sitemap.xml">Sitemap</a>
</nav>
<p class="fine">Educational information. Requirements vary by location and arrangement. Examples are illustrative, and estimates are not promises of results.</p>
</footer>
<script src="/site.js" defer></script>
</body>
</html>`;

  const target = url.slice(1) + '.html';
  fs.mkdirSync(path.dirname(path.join('dist', target)), { recursive: true });
  fs.writeFileSync(path.join('dist', target), html);
}

// Generate individual blog post pages
for (const post of posts) {
  const paragraphs = post.body.split('\n\n').filter(Boolean);
  const bodyHtml = paragraphs.map(p => `<p>${esc(p)}</p>`).join('\n');

  // FAQ section
  const faqHtml = post.faqs.length ? `
<section class="faq-section">
<h2>Frequently Asked Questions</h2>
${post.faqs.map(faq => `
<details>
<summary>${esc(faq.q)}</summary>
<p>${esc(faq.a)}</p>
</details>
`).join('')}
</section>` : '';

  // Related posts (same category, max 3)
  const related = posts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const relatedHtml = related.length ? `
<section class="section related">
<h2>Keep reading.</h2>
<div class="answer-grid">
${related.map(r => `
<a class="answer-card" href="/blog/${r.slug}">
<span class="eyebrow">${esc(r.categoryName)}</span>
<h3>${esc(r.title)}</h3>
<p>${esc(r.description.split('. ')[0] + '.')}</p>
<span class="read">Read more <span aria-hidden="true">&nearr;</span></span>
</a>
`).join('')}
</div>
</section>` : '';

  // CTA section
  const ctaHtml = `
<aside class="next-step">
<span class="eyebrow">Ready to invest?</span>
<p>Looking for a done-for-you short-term rental acquisition? <a href="https://www.bnbaccelerator.com">BnB Accelerator</a> handles everything from property sourcing to launch. Visit <a href="https://www.bnbaccelerator.com">www.bnbaccelerator.com</a> to learn more.</p>
</aside>`;

  // Schema
  const wordCount = post.body.split(/\s+/).length;
  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'en',
    wordCount,
    mainEntityOfPage: origin + '/blog/' + post.slug,
    articleSection: post.categoryName,
    author: {
      '@type': 'Organization',
      name: 'The Short Term Rental Blog'
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Short Term Rental Blog',
      url: origin
    }
  };

  const faqSchema = post.faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  } : null;

  const schemas = [blogPostSchema];
  if (faqSchema) schemas.push(faqSchema);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: origin + '/blog' },
      { '@type': 'ListItem', position: 2, name: post.categoryName, item: origin + '/blog/category/' + categories[post.category].slug },
      { '@type': 'ListItem', position: 3, name: post.title, item: origin + '/blog/' + post.slug }
    ]
  };
  schemas.push(breadcrumbSchema);

  blogPage('/blog/' + post.slug, post.title, post.description,
    `<article class="article">
<a class="eyebrow" href="/blog/category/${categories[post.category].slug}">${esc(post.categoryName)}</a>
<h1>${esc(post.title)}</h1>
<p class="fine">Published ${post.date} &middot; ${Math.max(1, Math.ceil(wordCount / 200))} minute read</p>
${bodyHtml}
${ctaHtml}
${faqHtml}
<p class="fine">This article is general education. Apply it to your specific location, agreements, and circumstances. Where a decision requires professional advice, use a qualified adviser.</p>
</article>
${relatedHtml}`,
    { schema: schemas }
  );
}

// Generate blog index page
const postsByCategory = {};
for (const post of posts) {
  if (!postsByCategory[post.category]) postsByCategory[post.category] = [];
  postsByCategory[post.category].push(post);
}

const blogIndexCards = posts.slice(0, 12).map(p => `
<a class="answer-card" href="/blog/${p.slug}">
<span class="eyebrow">${esc(p.categoryName)}</span>
<h3>${esc(p.title)}</h3>
<p>${esc(p.description.split('. ')[0] + '.')}</p>
<span class="read">Read more <span aria-hidden="true">&nearr;</span></span>
</a>`).join('');

const catLinks = Object.entries(categories).map(([id, cat]) => {
  const count = (postsByCategory[id] || []).length;
  return `<a class="topic-card" href="/blog/category/${cat.slug}"><h3>${esc(cat.name)}</h3><p>${count} articles</p></a>`;
}).join('');

blogPage('/blog', 'Short-Term Rental Blog: Guides, Tips, and Market Analysis',
  `${posts.length} in-depth articles about short-term rental investing, operations, tax strategy, design, and market analysis.`,
  `<section class="page-intro">
<span class="eyebrow">${posts.length} articles</span>
<h1>The STR investor's reading list.</h1>
<p>In-depth guides on investing, operations, tax strategy, design, and market analysis for short-term rental investors.</p>
</section>
<section class="section">
<h2>Browse by category</h2>
<div class="topic-grid">${catLinks}</div>
</section>
<section class="section">
<h2>Latest articles</h2>
<div class="answer-grid">${blogIndexCards}</div>
</section>
<section class="tool-callout">
<div>
<span class="eyebrow">Done-for-you STR acquisition</span>
<h2>Skip the learning curve.</h2>
<p>BnB Accelerator handles property sourcing, analysis, closing, furnishing, and launch so you can build your STR portfolio with expert guidance.</p>
</div>
<a class="button" href="https://www.bnbaccelerator.com">Visit BnB Accelerator &rarr;</a>
</section>`
);

// Generate category pages
for (const [id, cat] of Object.entries(categories)) {
  const catPosts = postsByCategory[id] || [];
  if (!catPosts.length) continue;

  const cards = catPosts.map(p => `
<a class="answer-card" href="/blog/${p.slug}">
<span class="eyebrow">${esc(p.categoryName)}</span>
<h3>${esc(p.title)}</h3>
<p>${esc(p.description.split('. ')[0] + '.')}</p>
<span class="read">Read more <span aria-hidden="true">&nearr;</span></span>
</a>`).join('');

  blogPage('/blog/category/' + cat.slug, cat.name + ': Short-Term Rental Guides',
    `${catPosts.length} in-depth articles about ${cat.name.toLowerCase()} for short-term rental investors.`,
    `<section class="page-intro">
<a class="eyebrow" href="/blog">&larr; All blog articles</a>
<h1>${esc(cat.name)}</h1>
<p>${catPosts.length} articles</p>
</section>
<div class="answer-grid section">${cards}</div>`
  );
}

// Update sitemap with blog URLs
const existingSitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const blogSitemapEntries = blogUrls.map(u =>
  `<url><loc>${origin}${u}</loc><lastmod>${posts[0].date}</lastmod></url>`
).join('');

// Append blog entries to main sitemap
const updatedSitemap = existingSitemap.replace('</urlset>',
  blogSitemapEntries + '</urlset>'
);
fs.writeFileSync('dist/sitemap.xml', updatedSitemap);

// Create blog-specific sitemap
fs.writeFileSync('dist/sitemaps/blog.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  blogUrls.map(u => `  <url><loc>${origin}${u}</loc><lastmod>${posts[0].date}</lastmod></url>`).join('\n') +
  '\n</urlset>\n'
);

// Update sitemap index
const existingIndex = fs.readFileSync('dist/sitemap-index.xml', 'utf8');
const updatedIndex = existingIndex.replace('</sitemapindex>',
  `  <sitemap><loc>${origin}/sitemaps/blog.xml</loc></sitemap>\n</sitemapindex>`
);
fs.writeFileSync('dist/sitemap-index.xml', updatedIndex);

// Update robots.txt
fs.writeFileSync('dist/robots.txt',
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap-index.xml\nSitemap: ${origin}/sitemap.xml\n`
);

// Create llms.txt
fs.writeFileSync('dist/llms.txt',
  `# The Short Term Rental Blog\n\n` +
  `> Educational short-term rental guides and frequently asked questions.\n\n` +
  `This site provides educational content about short-term rental investing, operations, tax strategy, design, and market analysis.\n\n` +
  `## Key Resources\n\n` +
  `- [Blog](${origin}/blog): ${posts.length} in-depth articles\n` +
  `- [Answer Library](${origin}/library): Educational Q&A\n` +
  `- [Topics](${origin}/topics): Organized by subject\n` +
  `- [Cash Flow Tool](${origin}/tools/cash-flow): Illustrative calculator\n\n` +
  `## Related Services\n\n` +
  `- [BnB Accelerator](https://www.bnbaccelerator.com): Done-for-you STR acquisition\n` +
  `- [MyBnBDesign](https://www.mybnbdesign.com): Professional STR interior design\n` +
  `- [AE Tax Advisors](https://www.aetaxadvisors.com): STR tax strategy and cost segregation\n\n` +
  `## Blog Categories\n\n` +
  Object.entries(categories).map(([id, cat]) =>
    `- [${cat.name}](${origin}/blog/category/${cat.slug}): ${(postsByCategory[id] || []).length} articles`
  ).join('\n') + '\n'
);

// Update content manifest
const existingManifest = JSON.parse(fs.readFileSync('dist/content-manifest.json', 'utf8'));
existingManifest.blogPostCount = posts.length;
existingManifest.blogCategories = Object.entries(categories).map(([id, cat]) => ({
  id,
  name: cat.name,
  slug: cat.slug,
  count: (postsByCategory[id] || []).length
}));
existingManifest.blogPosts = posts.map(p => ({
  title: p.title,
  slug: p.slug,
  category: p.category
}));
fs.writeFileSync('dist/content-manifest.json', JSON.stringify(existingManifest, null, 2));

console.log(`Built ${posts.length} blog posts, ${Object.keys(categories).length} category pages, 1 blog index.`);
console.log(`Total blog HTML pages: ${blogUrls.length}`);
console.log(`Updated sitemap.xml, sitemap-index.xml, robots.txt`);
console.log(`Created llms.txt and blog sitemap`);
