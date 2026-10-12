import { services } from '../data/services.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

export const wordmark = `<span class="brand-mark" aria-hidden="true"></span><span class="wordmark">AHELIS <span class="brand-slash">/</span> LAB<span class="brand-period">.</span></span>`;

export function header(path) {
  const home = path === '/';
  const sectionLink = hash => `${home ? '' : '/'}#${hash}`;
  return `<a class="skip-link" href="#main">Aller au contenu</a>
    <header class="site-header"><div class="container nav-inner">
      <a class="brand" href="/" aria-label="Ahelis Lab, accueil">${wordmark}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button>
      <nav class="nav-links" id="navigation" aria-label="Navigation principale">
        <a href="${sectionLink('expertises')}">Expertises</a><a href="${sectionLink('studio')}">Le studio</a><a href="${sectionLink('approche')}">Notre approche</a>
        <a class="button button-nav" href="${sectionLink('contact')}">Parlons de votre projet</a>
      </nav>
    </div></header>`;
}

export function footer() {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-top"><a class="brand" href="/" aria-label="Ahelis Lab, accueil">${wordmark}</a><p>Un regard curieux.<br>Des idées qui prennent forme.</p><a class="text-link" href="/#contact">Parlons de votre projet</a></div>
    <div class="footer-services">${services.map(s => `<a href="/services/${s.slug}/">${s.label}</a>`).join('')}</div>
    <div class="footer-bottom"><p>© 2026 Ahelis Lab</p><p>Studio digital à Genève, Suisse</p><a href="/confidentialite/">Confidentialité</a></div>
  </div></footer>`;
}

const planetObject = `<div class="planet-system">
      <div class="planet-aura"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div>
      <div class="trajectory"></div><div class="planet"></div><div class="moon"></div><div class="spark"></div>
    </div>`;
export const staticPlanet = `<noscript><div class="planet-static" aria-hidden="true">${planetObject}</div></noscript>`;

export function planet() {
  // Keep an independent animated visual in each reserved dock, including the hero.
  return `<div class="cosmos" aria-hidden="true"><div class="stars"></div></div>
    <div class="planet-stage" aria-hidden="true">${planetObject}</div>
    <button class="motion-control" type="button" aria-pressed="true" aria-label="Mettre les animations en pause" hidden><span class="motion-symbol" aria-hidden="true"></span><span class="motion-label">Animations</span></button>`;
}

export function faqSection(faqs, { home = false } = {}) {
  return `<section class="faq section" id="questions" data-scene="questions"><div class="container faq-layout">
    <div class="section-heading" data-reveal><h2>Avant de se lancer.</h2></div>
    <div class="faq-list">${faqs.map(([q, a], i) => `<details class="faq-item" data-reveal><summary><span>${escapeHtml(q)}</span><span class="faq-plus" aria-hidden="true"></span></summary><p>${escapeHtml(a)}</p></details>`).join('')}</div>
  </div></section>`;
}

export function layout({ title, description, path = '/', content, faqs = [], service, config, assets }) {
  const url = config.siteUrl ? `${config.siteUrl}${path}` : undefined;
  const organization = { '@type': 'Organization', '@id': config.siteUrl ? `${config.siteUrl}/#studio` : '#studio', name: 'Ahelis Lab', description: 'Studio web basé à Genève : stratégie, design UX/UI, développement et IA pour PME, indépendants et particuliers.', ...(config.siteUrl ? { url: `${config.siteUrl}/` } : {}), ...(config.email ? { email: config.email } : {}), areaServed: [{ '@type': 'Place', name: 'Suisse romande' }, { '@type': 'Place', name: 'International' }] };
  const graph = [organization, { '@type': 'WebSite', name: 'Ahelis Lab', ...(config.siteUrl ? { url: `${config.siteUrl}/` } : {}), inLanguage: 'fr-CH', publisher: { '@id': organization['@id'] } }, { '@type': 'WebPage', ...(url ? { url, '@id': `${url}#page` } : {}), name: title, description, inLanguage: 'fr-CH', about: { '@id': organization['@id'] } }];
  if (faqs.length) graph.push({ '@type': 'FAQPage', ...(url ? { '@id': `${url}#questions` } : {}), mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  if (service) graph.push({ '@type': 'Service', name: service.label, description: service.intro, ...(url ? { url } : {}), provider: { '@id': organization['@id'] }, areaServed: { '@type': 'Place', name: 'Suisse romande' } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', ...(config.siteUrl ? { item: `${config.siteUrl}/` } : {}) }, { '@type': 'ListItem', position: 2, name: service.label, ...(url ? { item: url } : {}) }] });
  return `<!doctype html>
<html lang="fr-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${config.indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}">
<meta name="theme-color" content="#08162b"><meta name="color-scheme" content="dark light"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
${url ? `<link rel="canonical" href="${escapeHtml(url)}"><meta property="og:url" content="${escapeHtml(url)}">` : ''}
<meta property="og:type" content="website"><meta property="og:locale" content="fr_CH"><meta property="og:site_name" content="Ahelis Lab"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">
<link rel="preload" href="/fonts/manrope-latin-variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/${assets.css}"><noscript><style>@media(max-width:900px){html .site-header{height:auto;position:relative}html .nav-inner{flex-wrap:wrap;padding-block:24px}html .menu-toggle{display:none}html .nav-links{display:flex;position:static;padding:15px 0 0;background:none;border:0}}</style></noscript><script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>
<script type="module" src="/assets/${assets.js}"></script></head>
<body data-page="${service ? 'service' : path === '/' ? 'home' : 'document'}" data-contact-email="${escapeHtml(config.email)}">
${header(path)}${planet()}<main id="main" tabindex="-1">${content}</main>${footer()}
</body></html>`;
}
