// Read generated pages and verify metadata, structured data and internal links.
// Usage: node scripts/verify.mjs after a build. This command does not modify files.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectRoot } from './build.mjs';
import { languageTags, locales, localizedPath } from '../src/i18n/index.mjs';

const out = resolve(projectRoot, 'dist');
const info = JSON.parse(await readFile(resolve(out, 'build-info.json'), 'utf8'));
let linkCount = 0;
const titles = new Set();
const descriptions = new Set();
assert.equal(info.pages.length, 20, 'ten content pages per locale');
assert.equal(info.errors.length, 2, 'one 404 per locale');
for (const path of [...info.pages, ...info.errors]) {
  const { basePath, locale } = info.translations.find(page => page.path === path);
  const isError = info.errors.includes(path);
  const file = isError ? resolve(out, `.${path}`) : resolve(out, `.${path}`, 'index.html');
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: exactly one H1`);
  assert.ok(html.includes(`<html lang="${languageTags[locale]}">`), `${path}: language`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title && !titles.has(title), `${path}: unique title`);
  titles.add(title);
  assert.ok(html.match(/<meta name="description" content="[^"]{40,}"/), `${path}: description`);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(!descriptions.has(description), `${path}: unique description`);
  descriptions.add(description);
  const navigation = html.match(/<nav class="nav-links"[^>]*>(.*?)<\/nav>/s)[1];
  const active = [...navigation.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(match => match[1]);
  const expectedActive = basePath.startsWith('/services/') ? localizedPath('/services/', locale) : ['/studio/', '/approche/', '/contact/'].includes(basePath) ? path : null;
  assert.deepEqual(active, expectedActive ? [expectedActive] : [], `${path}: active navigation`);
  assert.ok(!html.includes('hello@ahelis.lab'), `${path}: no fictional contact address`);
  assert.ok(html.includes('noindex') || info.indexable, `${path}: controlled indexing`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  for (const entity of schema['@graph'].filter(entity => ['WebSite', 'WebPage', 'FAQPage'].includes(entity['@type']))) assert.equal(entity.inLanguage, languageTags[locale], `${path}: structured language`);
  const switcher = html.match(/<span class="language-switcher"[^>]*>(.*?)<\/span>/s)[1];
  for (const language of locales) assert.ok(switcher.includes(`href="${localizedPath(basePath, language)}" lang="${language}"`), `${path}: equivalent language link`);
  assert.ok(switcher.includes(`lang="${locale}" hreflang="${languageTags[locale]}" aria-label="${locale === 'fr' ? 'Français' : 'English'}" aria-current="true"`), `${path}: current language`);
  if (locale === 'en') {
    assert.ok(html.includes('Skip to content') && html.includes('Designed, operated and hosted in Switzerland'), `${path}: translated shared content`);
    assert.ok(!html.includes('Parlons de votre projet') && !html.includes('Préparer mon message'), `${path}: no French UI fallback`);
  } else assert.ok(html.includes('Créé avec') && html.includes('aria-label="amour"'), `${path}: French signature`);
  const faq = schema['@graph'].find(entity => entity['@type'] === 'FAQPage');
  assert.equal(Boolean(faq), basePath.startsWith('/services/') && basePath !== '/services/' || basePath === '/contact/', `${path}: FAQ only where displayed`);
  if (basePath.startsWith('/services/') && basePath !== '/services/') {
    const crumbs = schema['@graph'].find(entity => entity['@type'] === 'BreadcrumbList');
    assert.equal(crumbs.itemListElement.length, 3, `${path}: three breadcrumb levels`);
    assert.equal(crumbs.itemListElement[1].name, 'Services');
  }
  if (basePath === '/') {
    const main = html.match(/<main[^>]*>(.*?)<\/main>/s)[1];
    const words = main.replace(/<noscript>.*?<\/noscript>/gs, '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
    assert.ok(words >= 250 && words <= 350, `home: 250–350 words, got ${words}`);
    assert.ok(!main.includes('<form') && !main.includes('<details'), 'home: no form or FAQ');
    for (const id of ['expertises', 'studio', 'approche', 'contact']) assert.ok(main.includes(`id="${id}"`));
    console.log(`Home (${locale}): ${words} words, four preserved anchors, no form or FAQ.`);
  }
  for (const entity of schema['@graph']) {
    if (entity['@type'] === 'FAQPage') for (const question of entity.mainEntity) {
      // Structured answers must also be present in the rendered HTML.
      const text = question.acceptedAnswer.text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      assert.ok(html.includes(text), `${path}: consistent FAQ JSON-LD`);
    }
  }
  if (info.siteUrl && !isError) {
    assert.ok(html.includes(`rel="canonical" href="${info.siteUrl}${path}"`), `${path}: canonical`);
    for (const language of locales) assert.ok(html.includes(`rel="alternate" hreflang="${languageTags[language]}" href="${info.siteUrl}${localizedPath(basePath, language)}"`), `${path}: reciprocal hreflang`);
    assert.ok(html.includes(`rel="alternate" hreflang="x-default" href="${info.siteUrl}${basePath}"`), `${path}: French default`);
  }
  if (isError) assert.ok(html.includes('noindex') && !html.includes('rel="canonical"'), `${path}: non-indexable error page`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${path}: unique IDs`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    const [destination, anchor] = href.split('#');
    if (destination) {
      const normalized = destination.endsWith('/') ? `${destination}index.html` : destination;
      assert.ok(normalized.startsWith('/'), `${path}: absolute path ${href}`);
      await access(resolve(out, `.${normalized}`));
    }
    if (anchor) {
      const target = destination ? await readFile(resolve(out, `.${destination.endsWith('/') ? destination + 'index.html' : destination}`), 'utf8') : html;
      assert.ok(target.includes(`id="${anchor}"`), `${path}: anchor ${href}`);
    }
    linkCount++;
  }
}
const sitemap = await readFile(resolve(out, 'sitemap.xml'), 'utf8');
if (info.siteUrl) for (const path of info.pages) assert.ok(sitemap.includes(`<loc>${info.siteUrl}${path}</loc>`));
const robots = await readFile(resolve(out, 'robots.txt'), 'utf8');
assert.ok(robots.includes(info.indexable ? 'Allow: /' : 'Disallow: /'));
console.log(`Verified: ${info.pages.length + info.errors.length} pages, ${linkCount} links and assets, language pairs, H1, metadata, JSON-LD, sitemap, robots and no fictional contact details.`);
