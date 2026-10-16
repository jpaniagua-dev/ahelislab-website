import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { projectRoot } from './build.mjs';
import { businessPath } from '../src/business/site.mjs';
import { verifyFooter } from './verify-footer.mjs';

const out = resolve(projectRoot, 'dist-business');
const info = JSON.parse(await readFile(resolve(out, 'build-info.json'), 'utf8'));
assert.equal(info.pages.length, 2);
assert.equal(info.errors.length, 2);
const headers = await readFile(resolve(out, 'nginx-security-headers.conf'), 'utf8');
let links = 0;
for (const entry of info.translations) {
  const { path, basePath, locale } = entry;
  const error = info.errors.includes(path);
  const html = await readFile(resolve(out, `.${path}${error ? '' : 'index.html'}`), 'utf8');
  verifyFooter(html, { locale, product: true, agencyUrl: info.agencyUrl });
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, path);
  assert.ok(html.includes(`<html lang="${locale === 'fr' ? 'fr-CH' : 'en'}">`));
  assert.ok(html.includes('noindex') || info.indexable);
  assert.ok(!html.includes('admin.ahelislab.ch'));
  for (const language of ['fr', 'en']) assert.ok(html.includes(`href="${businessPath(basePath, language)}" lang="${language}"`));
  if (!error) assert.ok(html.includes(`rel="canonical" href="${info.siteUrl}${path}"`));
  const schemaText = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  const schema = JSON.parse(schemaText);
  assert.ok(headers.includes(`sha256-${createHash('sha256').update(schemaText).digest('base64')}`));
  if (basePath === '/') {
    assert.ok(html.includes('name="project" value="business"'));
    assert.ok(html.includes(`/business/budget-${locale}.png`));
    assert.ok(schema['@graph'].some(entity => entity['@type'] === 'SoftwareApplication'));
    const faq = schema['@graph'].find(entity => entity['@type'] === 'FAQPage');
    assert.equal(faq.mainEntity.length, 3);
    for (const question of faq.mainEntity) {
      const text = question.acceptedAnswer.text.replaceAll('&', '&amp;').replaceAll("'", '&#39;');
      assert.ok(html.includes(text));
    }
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    const [target, anchor] = href.split('#');
    const file = target ? resolve(out, `.${target}${target.endsWith('/') ? 'index.html' : ''}`) : null;
    if (file) await access(file);
    if (anchor) assert.ok((file ? await readFile(file, 'utf8') : html).includes(`id="${anchor}"`));
    links++;
  }
}
assert.ok(!info.pages.some(path => /privacy|confidentialite/.test(path)));
for (const path of ['/privacy/', '/confidentialite/', '/en/privacy/']) assert.equal(info.redirects[path], `${info.agencyUrl}/privacy/`);
console.log(`Business verified: 4 pages, ${links} links/assets, language pairs, contact, FAQ, metadata and CSP.`);
