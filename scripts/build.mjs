// Generate dist/ with static pages, fingerprinted assets and crawler metadata.
// Usage: node scripts/build.mjs. Rebuild to replace generated output; sources are preserved.
import { mkdir, rm, readFile, writeFile, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { getConfig } from '../src/config.mjs';
import { services, contactFaqs } from '../src/data/services.mjs';
import { layout } from '../src/components/shared.mjs';
import { servicesContent, studioContent, approachContent, contactContent } from '../src/pages/sections.mjs';
import { homeContent } from '../src/pages/home.mjs';
import { serviceContent, notFoundContent } from '../src/pages/service.mjs';
import { centralPrivacyContent } from '../src/pages/privacy.mjs';
import { locales, localizedPath } from '../src/i18n/index.mjs';

import { productsContent } from '../src/pages/products.mjs';
import { businessPages, businessErrors, businessLayout } from '../src/business/site.mjs';
import { vaultPages, vaultErrors, vaultLayout } from '../src/vault/site.mjs';
import { loadDownload } from '../src/vault/download.mjs';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function build({ site = 'agency' } = {}) {
  if (!['agency', 'vault', 'business'].includes(site)) throw new Error('Unknown website target.');
  const vault = site === 'vault';
  const business = site === 'business';
  const config = getConfig(vault ? { ...process.env, SITE_URL: process.env.VAULT_SITE_URL || 'https://vault.ahelislab.ch', SITE_INDEXABLE: process.env.VAULT_SITE_INDEXABLE } : business ? { ...process.env, SITE_URL: process.env.BUSINESS_SITE_URL || 'https://business.ahelislab.ch', SITE_INDEXABLE: process.env.BUSINESS_SITE_INDEXABLE } : process.env);
  if (vault) config.download = await loadDownload(process.env.VAULT_DOWNLOAD_MANIFEST, resolve(projectRoot, 'public'));
  const out = resolve(projectRoot, vault ? 'dist-vault' : business ? 'dist-business' : 'dist');
  await rm(out, { recursive: true, force: true });
  await mkdir(resolve(out, 'assets'), { recursive: true });
  const assets = {};
  for (const [kind, path] of [['css', 'src/styles/main.css'], ['js', 'src/scripts/site.js']]) {
    const contents = await readFile(resolve(projectRoot, path), 'utf8') + (vault && kind === 'css' ? '\n' + await readFile(resolve(projectRoot, 'src/vault/style.css'), 'utf8') : '');
    const hash = createHash('sha256').update(contents).digest('hex').slice(0, 10);
    assets[kind] = `site.${hash}.${kind}`;
    await writeFile(resolve(out, 'assets', assets[kind]), contents);
  }
  await cp(resolve(projectRoot, 'public'), out, { recursive: true, filter: source => source !== resolve(projectRoot, 'public/downloads') });
  if (config.download) {
    await mkdir(dirname(resolve(out, `.${config.download.url}`)), { recursive: true });
    await cp(config.download.file, resolve(out, `.${config.download.url}`));
  }
  const sourcePages = [
    { path: '/produits/', pageType: 'products', pageLabel: 'Produits', title: 'Les produits du studio | Ahelis Lab', description: 'Découvrez Ahelis Vault pour vos mots de passe et Ahelis Business pour votre budget personnel. Des applications créées par le studio Ahelis Lab.', content: productsContent(config) },
    { path: '/', title: 'Ahelis Lab | Création de sites web & studio digital à Genève', description: 'Ahelis Lab, studio digital à Genève. Création de sites web, design UX/UI, développement et IA pour PME, indépendants et particuliers en Suisse romande.', content: homeContent(config), pageType: 'home' },
    { path: '/services/', pageType: 'services', pageLabel: 'Services', title: 'Services du studio digital à Genève | Ahelis Lab', description: 'Découvrez nos quatre expertises : création de sites web, design UX/UI, développement sur mesure et IA et automatisation en Suisse romande.', content: servicesContent() },
    { path: '/studio/', pageType: 'studio', pageLabel: 'Le studio', title: 'Le studio digital indépendant à Genève | Ahelis Lab', description: 'Découvrez Ahelis Lab : un studio indépendant à Genève, un interlocuteur direct et une approche qui réunit stratégie, design, développement et IA.', content: studioContent() },
    { path: '/approche/', pageType: 'approach', pageLabel: 'Notre approche', title: 'Notre approche, de l’idée au lancement | Ahelis Lab', description: 'Cadrer, dessiner, construire et lancer : découvrez les étapes, les livrables et les validations qui accompagnent votre projet avec Ahelis Lab.', content: approachContent() },
    { path: '/contact/', pageType: 'contact', pageLabel: 'Contact', title: 'Parlons de votre projet | Contact Ahelis Lab', description: 'Présentez votre activité et votre projet à Ahelis Lab. Envoyez votre message au studio et découvrez les réponses sur le budget, la distance et le référencement.', content: contactContent(config), faqs: contactFaqs },
    ...services.map(service => ({ path: `/services/${service.slug}/`, title: service.seoTitle, description: service.description, content: serviceContent(service), faqs: service.faqs, service }))
  ];
  const pages = vault ? vaultPages(config) : business ? businessPages(config) : sourcePages.flatMap(page => locales.map(locale => ({ ...page, basePath: page.path, locale, path: localizedPath(page.path, locale) })));
  if (!vault && !business) pages.push({ path: '/privacy/', basePath: '/privacy/', locale: 'fr', pageType: 'privacy', title: 'Confidentialité / Privacy | Ahelis Lab', description: 'Confidentialité des sites Ahelis Lab et de ses produits. Privacy information for the studio and product websites, browsing and contact enquiries.', content: centralPrivacyContent(config), bilingual: true });
  const redirects = Object.fromEntries((site === 'agency' ? ['/confidentialite/', '/en/privacy/'] : ['/privacy/', '/confidentialite/', '/en/privacy/']).map(path => [path, `${config.agencyUrl}/privacy/`]));
  await writeFile(resolve(out, 'nginx-redirects.conf'), Object.entries(redirects).map(([path, target]) => `location = ${path} { return 301 ${target}; }`).join('\n') + '\n');
  const errors = vault ? vaultErrors() : business ? businessErrors() : locales.map(locale => ({ path: localizedPath('/404.html', locale), basePath: '/404.html', locale, title: 'Page introuvable | Ahelis Lab', description: 'Cette page n’existe pas. Retrouvez le studio Ahelis Lab et ses expertises.', pageType: 'not-found', content: notFoundContent() }));
  const render = vault ? vaultLayout : business ? businessLayout : layout;
  const schemaHashes = new Set();
  const saveHtml = async (file, html) => {
    const schema = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    if (schema) schemaHashes.add(`'sha256-${createHash('sha256').update(schema).digest('base64')}'`);
    await writeFile(file, html);
  };
  for (const page of pages) {
    const directory = resolve(out, `.${page.path}`);
    await mkdir(directory, { recursive: true });
    await saveHtml(resolve(directory, 'index.html'), render({ ...page, config, assets }));
  }
  for (const page of errors) {
    const file = resolve(out, `.${page.path}`);
    await mkdir(dirname(file), { recursive: true });
    await saveHtml(file, render({ ...page, config: { ...config, indexable: false }, assets }));
  }
  const sitemap = config.siteUrl ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${config.siteUrl}${p.path}</loc></url>`).join('')}</urlset>\n` : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
  await writeFile(resolve(out, 'sitemap.xml'), sitemap);
  await writeFile(resolve(out, 'robots.txt'), `User-agent: *\n${config.indexable ? 'Allow: /' : 'Disallow: /'}\n${config.siteUrl ? `Sitemap: ${config.siteUrl}/sitemap.xml\n` : ''}`);
  const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self' ${[...schemaHashes].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'\n${!config.indexable ? '  X-Robots-Tag: noindex, nofollow\n' : ''}\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`;
  // JSON-LD is non-executable data. Only its exact inline hashes are allowed by CSP.
  await writeFile(resolve(out, '_headers'), headers);
  if (vault || business) {
    const nginxHeaders = headers.split('\n/assets/*')[0].split('\n').slice(1).filter(line => line.trim()).map(line => {
      const [, name, value] = line.trim().match(/^([^:]+): (.*)$/);
      return `add_header ${name} "${value}" always;`;
    }).join('\n');
    await writeFile(resolve(out, 'nginx-security-headers.conf'), nginxHeaders + '\n');
  }
  await writeFile(resolve(out, 'build-info.json'), JSON.stringify({ pages: pages.map(p => p.path), errors: errors.map(p => p.path), translations: [...pages, ...errors].map(({ path, basePath, locale }) => ({ path, basePath, locale })), redirects, agencyUrl: config.agencyUrl, indexable: config.indexable, siteUrl: config.siteUrl, assets }, null, 2));
  console.log(`Static build: ${pages.length} pages + ${errors.length} localized 404 pages, ${config.indexable ? 'indexing enabled' : 'private non-indexable preview'}.`);
  return { pages, config, out, redirects };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetIndex = process.argv.indexOf('--site');
  await build({ site: targetIndex === -1 ? 'agency' : process.argv[targetIndex + 1] });
}
