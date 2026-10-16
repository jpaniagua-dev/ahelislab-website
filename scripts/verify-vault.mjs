// Verify the generated product website, links and availability without contacting external services.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectRoot } from './build.mjs';
import { vaultRoutes, vaultPath } from '../src/vault/site.mjs';
import { escapeHtml } from '../src/components/shared.mjs';
import { createHash } from 'node:crypto';
import { verifyFooter } from './verify-footer.mjs';
const root = resolve(projectRoot, 'dist-vault');
const info = JSON.parse(await readFile(resolve(root, 'build-info.json'), 'utf8'));
assert.equal(info.pages.length, 8);
assert.equal(info.errors.length, 2);
const titles = new Set();
const nginxHeaders = await readFile(resolve(root, 'nginx-security-headers.conf'), 'utf8');
let links = 0;
for (const { path, basePath, locale } of info.translations) {
  assert.ok(Object.hasOwn(vaultRoutes, basePath));
  const error = basePath === '/404.html';
  const html = await readFile(resolve(root, `.${path}`, error ? '' : 'index.html'), 'utf8');
  verifyFooter(html, { locale, product: true, agencyUrl: info.agencyUrl });
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: one H1`);
  const title = html.match(/<title>(.*?)<\/title>/s)[1];
  assert.ok(!titles.has(title)); titles.add(title);
  assert.ok(html.includes(`<html lang="${locale === 'fr' ? 'fr-CH' : 'en'}">`));
  assert.ok(html.includes('noindex') || info.indexable);
  assert.equal(html.includes('rel="canonical"'), !error);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const schemaText = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  assert.ok(nginxHeaders.includes(`'sha256-${createHash('sha256').update(schemaText).digest('base64')}'`), `${path}: generated CSP hash`);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.ok(html.match(/<meta name="description" content="[^"]{40,}"/));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${path}: unique IDs`);
  for (const l of ['fr','en']) {
    assert.ok(html.includes(`href="${vaultPath(basePath,l)}" lang="${l}"`), `${path}: equivalent language link`);
    if (!error) assert.ok(html.includes(`href="${info.siteUrl}${vaultPath(basePath,l)}"`), `${path}: canonical and alternate URLs`);
  }
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    const [destination, anchor] = href.split('#');
    const target = destination ? await readFile(resolve(root, `.${destination}`, destination.endsWith('/') ? 'index.html' : '')) : Buffer.from(html);
    if (anchor) assert.ok(target.toString().includes(`id="${anchor}"`));
    links++;
  }
  const faq = schema['@graph'].find(entity => entity['@type'] === 'FAQPage');
  assert.equal(Boolean(faq), basePath === '/');
  if (faq) for (const q of faq.mainEntity) assert.ok(html.includes(escapeHtml(q.acceptedAnswer.text)));
  if (basePath === '/contact/') {
    assert.ok(html.includes('name="project" value="vault"'));
    assert.ok(html.includes('hello@ahelislab.ch'));
    assert.ok(!html.includes('label for="project"'));
  }
  if (basePath === '/telecharger/') {
    const hasInstaller = /href="\/downloads\//.test(html);
    assert.equal(hasInstaller, html.includes('SHA-256'), 'downloads require a visible checksum');
    assert.equal(hasInstaller, !html.includes(locale === 'fr' ? 'bientôt disponible.' : 'coming soon.'));
  }
  assert.ok(!/MDC|BOOK-VOL|api\.paniagua|vault-mdc|test-clients/.test(html), 'no client or internal deployment data');
}
const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
for (const path of info.pages) assert.ok(sitemap.includes(`${info.siteUrl}${path}`));
for (const path of info.errors) assert.ok(!sitemap.includes(path));
assert.ok((await readFile(resolve(root,'robots.txt'),'utf8')).includes(info.indexable ? 'Allow: /' : 'Disallow: /'));
await access(resolve(root, 'vault/vault-demo.png'));
assert.ok(!info.pages.some(path => /privacy|confidentialite/.test(path)));
for (const path of ['/privacy/', '/confidentialite/', '/en/privacy/']) assert.equal(info.redirects[path], `${info.agencyUrl}/privacy/`);
console.log(`Vault verified: 10 pages, ${links} links/assets, metadata, language pairs, forms and download availability.`);
