// Read generated pages and verify metadata, structured data and internal links.
// Usage: node scripts/verify.mjs after a build. This command does not modify files.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectRoot } from './build.mjs';

const out = resolve(projectRoot, 'dist');
const info = JSON.parse(await readFile(resolve(out, 'build-info.json'), 'utf8'));
let linkCount = 0;
const titles = new Set();
for (const path of [...info.pages, '/404.html']) {
  const file = path === '/404.html' ? resolve(out, '404.html') : resolve(out, `.${path}`, 'index.html');
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: exactly one H1`);
  assert.ok(html.includes('<html lang="fr-CH">'), `${path}: language`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title && !titles.has(title), `${path}: unique title`);
  titles.add(title);
  assert.ok(html.match(/<meta name="description" content="[^"]{40,}"/), `${path}: description`);
  assert.ok(!html.includes('hello@ahelis.lab'), `${path}: no fictional contact address`);
  assert.ok(html.includes('noindex') || info.indexable, `${path}: controlled indexing`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  for (const entity of schema['@graph']) {
    if (entity['@type'] === 'FAQPage') for (const question of entity.mainEntity) {
      // Structured answers must also be present in the rendered HTML.
      const text = question.acceptedAnswer.text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      assert.ok(html.includes(text), `${path}: consistent FAQ JSON-LD`);
    }
  }
  if (info.siteUrl && path !== '/404.html') assert.ok(html.includes(`rel="canonical" href="${info.siteUrl}${path}"`), `${path}: canonical`);
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
console.log(`Verified: ${info.pages.length + 1} pages, ${linkCount} links and assets, H1, metadata, JSON-LD, sitemap, robots and no fictional contact details.`);
