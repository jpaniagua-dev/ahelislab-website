import { services } from '../data/services.mjs';
import { locales, languageTags, translate, localizedPath, localizeMarkup, clientMessages } from '../i18n/index.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

export const wordmark = `<span class="brand-mark" aria-hidden="true"></span><span class="wordmark">AHELIS <span class="brand-slash">/</span> LAB<span class="brand-period">.</span></span>`;

export function header(path, locale = 'fr') {
  const active = url => path === url || (url === '/services/' && path.startsWith(url)) ? ' aria-current="page"' : '';
  return `<a class="skip-link" href="#main">Aller au contenu</a>
    <header class="site-header"><div class="container nav-inner">
      <a class="brand" href="/" aria-label="Ahelis Lab, accueil">${wordmark}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button>
      <nav class="nav-links" id="navigation" aria-label="Navigation principale">
        ${[['/services/', 'Services'], ['/produits/', 'Produits'], ['/studio/', 'Le studio'], ['/approche/', 'Notre approche'], ['/contact/', 'Contact']].map(([url, label]) => `<a href="${url}"${active(url)}>${label}</a>`).join('')}
        <span class="language-switcher" role="group" aria-label="Langue">${locales.map(language => `<a href="${localizedPath(path, language)}" lang="${language}" hreflang="${languageTags[language]}" aria-label="${language === 'fr' ? 'Français' : 'English'}"${language === locale ? ' aria-current="true"' : ''}>${language.toUpperCase()}</a>`).join('')}</span>
      </nav>
    </div></header>`;
}

export function footer() {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div class="footer-brand"><a class="brand" href="/" aria-label="Ahelis Lab, accueil">${wordmark}</a><p>Studio digital indépendant à Genève.<br>Stratégie, design, développement &amp; IA.</p><a class="text-link" href="/contact/">Parlons de votre projet</a></div>
      <nav class="footer-nav" aria-label="Services du studio"><p class="footer-title"><a href="/services/">Services</a></p><ul>${services.map(s => `<li><a href="/services/${s.slug}/">${s.label}</a></li>`).join('')}</ul></nav>
      <nav class="footer-nav" aria-label="Découvrir Ahelis Lab"><p class="footer-title">Ahelis Lab</p><ul><li><a href="/produits/">Produits</a></li><li><a href="/studio/">Le studio</a></li><li><a href="/approche/">Notre approche</a></li><li><a href="/contact/">Contact</a></li></ul></nav>
    </div>
    <div class="footer-bottom"><p class="footer-swiss"><svg class="footer-swiss-flag" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect width="20" height="20" rx="3" fill="#da291c"/><path d="M8 4h4v4h4v4h-4v4H8v-4H4V8h4z" fill="#fff"/></svg><span>Conçu, opéré et hébergé en Suisse</span></p><div class="footer-legal"><p>© 2026 Ahelis Lab</p><a href="/confidentialite/">Confidentialité</a></div>
    <p class="footer-credit" lang="en"><span>Made with</span><svg class="footer-heart" width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="love" focusable="false"><path fill="currentColor" d="M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12Z"/></svg><span>by <a href="https://paniagua.dev/">Paniagua.dev</a></span></p>
  </div></div></footer>`;
}

const planetObject = `<div class="planet-system">
      <div class="planet-aura"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div>
      <div class="trajectory"></div><div class="planet"></div><div class="moon"></div><div class="spark"></div>
    </div>`;
export const staticPlanet = `<noscript><div class="planet-static" aria-hidden="true">${planetObject}</div></noscript>`;

export function planet() {
  // Keep an independent animated visual in each reserved dock, including the hero.
  return `<div class="cosmos" aria-hidden="true"><div class="stars"></div></div>
    <div class="planet-stage" aria-hidden="true">${planetObject}</div>`;
}

export function faqSection(faqs, { home = false } = {}) {
  return `<section class="faq section" id="questions" data-scene="questions"><div class="container faq-layout">
    <div class="section-heading" data-reveal><h2>Avant de se lancer.</h2></div>
    <div class="faq-list">${faqs.map(([q, a], i) => `<details class="faq-item" data-reveal><summary><span>${escapeHtml(q)}</span><span class="faq-plus" aria-hidden="true"></span></summary><p>${escapeHtml(a)}</p></details>`).join('')}</div>
  </div></section>`;
}

export function layout({ title, description, path = '/', basePath = path, locale = 'fr', content, faqs = [], service, pageType = service ? 'service' : basePath === '/' ? 'home' : 'document', pageLabel, config, assets }) {
  const t = value => translate(value, locale);
  const sourceTitle = title;
  title = t(title);
  description = t(description);
  const language = languageTags[locale];
  const url = config.siteUrl ? `${config.siteUrl}${path}` : undefined;
  const organization = { '@type': 'Organization', '@id': config.siteUrl ? `${config.siteUrl}/#studio` : '#studio', name: 'Ahelis Lab', description: t('Studio web basé à Genève : stratégie, design UX/UI, développement et IA pour PME, indépendants et particuliers.'), ...(config.siteUrl ? { url: `${config.siteUrl}/` } : {}), ...(config.email ? { email: config.email } : {}), areaServed: [{ '@type': 'Place', name: t('Suisse romande') }, { '@type': 'Place', name: 'International' }] };
  const graph = [organization, { '@type': 'WebSite', name: 'Ahelis Lab', ...(config.siteUrl ? { url: `${config.siteUrl}/` } : {}), inLanguage: language, publisher: { '@id': organization['@id'] } }, { '@type': 'WebPage', ...(url ? { url, '@id': `${url}#page` } : {}), name: title, description, inLanguage: language, about: { '@id': organization['@id'] } }];
  if (faqs.length) graph.push({ '@type': 'FAQPage', inLanguage: language, ...(url ? { '@id': `${url}#questions` } : {}), mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: t(q), acceptedAnswer: { '@type': 'Answer', text: t(a) } })) });
  if (service) graph.push({ '@type': 'Service', name: t(service.label), description: t(service.intro), ...(url ? { url } : {}), provider: { '@id': organization['@id'] }, areaServed: { '@type': 'Place', name: t('Suisse romande') } });
  if (basePath !== '/' && pageType !== 'not-found') {
    const crumbs = [{ path: '/', name: 'Accueil' }, ...(service ? [{ path: '/services/', name: 'Services' }] : []), { path: basePath, name: service?.label || pageLabel || sourceTitle.split(' | ')[0] }];
    graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: t(crumb.name), ...(config.siteUrl ? { item: `${config.siteUrl}${localizedPath(crumb.path, locale)}` } : {}) })) });
  }
  const alternatives = config.siteUrl && pageType !== 'not-found' ? `${locales.map(language => `<link rel="alternate" hreflang="${languageTags[language]}" href="${config.siteUrl}${localizedPath(basePath, language)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${config.siteUrl}${basePath}">` : '';
  // Language links already point to their target locale; do not rewrite them.
  const body = localizeMarkup(`${header(basePath, locale)}${planet()}<main id="main" tabindex="-1">${content}</main>${footer()}`, locale)
    .replace(/(<p class="footer-credit") lang="en"/, `$1 lang="${language}"`);
  return `<!doctype html>
<html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${config.indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}">
<meta name="theme-color" content="#08162b"><meta name="color-scheme" content="dark light"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
${url && pageType !== 'not-found' ? `<link rel="canonical" href="${escapeHtml(url)}"><meta property="og:url" content="${escapeHtml(url)}">` : ''}${alternatives}
<meta property="og:type" content="website"><meta property="og:locale" content="${locale === 'fr' ? 'fr_CH' : 'en_GB'}"><meta property="og:site_name" content="Ahelis Lab"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">
<link rel="preload" href="/fonts/manrope-latin-variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/${assets.css}"><noscript><style>@media(max-width:900px){html .site-header{height:auto;position:relative}html .nav-inner{flex-wrap:wrap;padding-block:24px}html .menu-toggle{display:none}html .nav-links{display:flex;position:static;padding:15px 0 0;background:none;border:0}}</style></noscript><script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>
<script type="module" src="/assets/${assets.js}"></script></head>
<body data-page="${pageType}" data-locale="${locale}" data-messages="${escapeHtml(JSON.stringify(clientMessages(locale)))}" data-contact-email="${escapeHtml(config.email)}">
${body}
</body></html>`;
}

export function breadcrumbs(label) {
  return `<nav class="breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(label)}</span></nav>`;
}
