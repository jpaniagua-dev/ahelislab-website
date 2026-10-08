// Generate dist/ with static pages, fingerprinted assets and crawler metadata.
// Usage: node scripts/build.mjs. Rebuild to replace generated output; sources are preserved.
import { mkdir, rm, readFile, writeFile, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { getConfig } from '../src/config.mjs';
import { services, homeFaqs } from '../src/data/services.mjs';
import { layout } from '../src/components/shared.mjs';
import { homeContent } from '../src/pages/home.mjs';
import { serviceContent, privacyContent, notFoundContent } from '../src/pages/service.mjs';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function build() {
  const config = getConfig();
  const out = resolve(projectRoot, 'dist');
  await rm(out, { recursive: true, force: true });
  await mkdir(resolve(out, 'assets'), { recursive: true });
  const assets = {};
  for (const [kind, path] of [['css', 'src/styles/main.css'], ['js', 'src/scripts/site.js']]) {
    const contents = await readFile(resolve(projectRoot, path), 'utf8');
    const hash = createHash('sha256').update(contents).digest('hex').slice(0, 10);
    assets[kind] = `site.${hash}.${kind}`;
    await writeFile(resolve(out, 'assets', assets[kind]), contents);
  }
  await cp(resolve(projectRoot, 'public'), out, { recursive: true });
  const pages = [
    { path: '/', title: 'Ahelis Lab — Création de sites web & studio digital à Genève', description: 'Ahelis Lab, studio digital à Genève. Création de sites web, design UX/UI, développement et IA pour PME, indépendants et particuliers en Suisse romande.', content: homeContent(config), faqs: homeFaqs },
    ...services.map(service => ({ path: `/services/${service.slug}/`, title: service.seoTitle, description: service.description, content: serviceContent(service), faqs: service.faqs, service })),
    { path: '/confidentialite/', title: 'Confidentialité | Ahelis Lab', description: 'Les informations sur la confidentialité du site Ahelis Lab, la préparation locale des messages et les préférences d’animation.', content: privacyContent(config) }
  ];
  const schemaHashes = new Set();
  const saveHtml = async (file, html) => {
    const schema = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    if (schema) schemaHashes.add(`'sha256-${createHash('sha256').update(schema).digest('base64')}'`);
    await writeFile(file, html);
  };
  for (const page of pages) {
    const directory = resolve(out, `.${page.path}`);
    await mkdir(directory, { recursive: true });
    await saveHtml(resolve(directory, 'index.html'), layout({ ...page, config, assets }));
  }
  await saveHtml(resolve(out, '404.html'), layout({ title: 'Page introuvable | Ahelis Lab', description: 'Cette page n’existe pas. Retrouvez le studio Ahelis Lab et ses expertises.', path: '/404/', content: notFoundContent(), config: { ...config, indexable: false }, assets }));
  const sitemap = config.siteUrl ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${config.siteUrl}${p.path}</loc></url>`).join('')}</urlset>\n` : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
  await writeFile(resolve(out, 'sitemap.xml'), sitemap);
  await writeFile(resolve(out, 'robots.txt'), `User-agent: *\n${config.indexable ? 'Allow: /' : 'Disallow: /'}\n${config.siteUrl ? `Sitemap: ${config.siteUrl}/sitemap.xml\n` : ''}`);
  const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self' ${[...schemaHashes].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'\n${!config.indexable ? '  X-Robots-Tag: noindex, nofollow\n' : ''}\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`;
  // JSON-LD is non-executable data. Only its exact inline hashes are allowed by CSP.
  await writeFile(resolve(out, '_headers'), headers);
  await writeFile(resolve(out, 'build-info.json'), JSON.stringify({ pages: pages.map(p => p.path), indexable: config.indexable, siteUrl: config.siteUrl, assets }, null, 2));
  console.log(`Static build: ${pages.length} pages + 404, ${config.indexable ? 'indexing enabled' : 'private non-indexable preview'}.`);
  return { pages, config, out };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
