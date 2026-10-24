import { renderLanguageSwitcher } from '@ahelis/brand';
import { escapeHtml as e, footer } from '../components/shared.mjs';
import { businessContent, businessFaqsFor } from '../pages/business.mjs';
import { localizeMarkup, translate, clientMessages } from '../i18n/index.mjs';

const routes = { '/': '/en/', '/404.html': '/en/404.html' };
export const businessPath = (base, locale) => locale === 'en' ? routes[base] : base;
const language = locale => locale === 'fr' ? 'fr-CH' : 'en';

export function businessPages(config) {
  return ['fr', 'en'].flatMap(locale => {
    const t = (fr, en) => locale === 'fr' ? fr : en;
    return [
      { basePath: '/', title: translate('Ahelis Business | Votre budget mensuel, simplement', locale), description: translate('Découvrez Ahelis Business, une bêta accompagnée pour suivre votre budget personnel en CHF, préparer vos mois et facturer votre activité complémentaire.', locale), faqs: businessFaqsFor(config).map(pair => pair.map(value => translate(value, locale))), content: config.selfSignupEnabled ? signupContent(config,locale) : localizeMarkup(businessContent(config), locale) },
    ].map(page => ({ ...page, locale, path: businessPath(page.basePath, locale) }));
  });
}

export function businessErrors() {
  return ['fr', 'en'].map(locale => ({ locale, basePath: '/404.html', path: businessPath('/404.html', locale), title: locale === 'fr' ? 'Page introuvable | Ahelis Business' : 'Page not found | Ahelis Business', description: locale === 'fr' ? 'Cette page n’existe pas. Retrouvez la présentation Ahelis Business et sa bêta de budget personnel.' : 'This page does not exist. Explore Ahelis Business and its personal budgeting beta.', content: `<section class="page-intro section"><div class="container"><h1>${locale === 'fr' ? 'Page introuvable.' : 'Page not found.'}</h1><a class="button button-primary" href="${businessPath('/', locale)}">${locale === 'fr' ? 'Retour à Business' : 'Back to Business'}</a></div></section>` }));
}

export function businessLayout({ title, description, path, basePath, locale, content, faqs = [], config, assets }) {
  const t = (fr, en) => locale === 'fr' ? fr : en;
  const p = base => businessPath(base, locale);
  const error = basePath === '/404.html';
  const url = `${config.siteUrl}${path}`;
  const publisher = { '@type': 'Organization', '@id': `${config.agencyUrl}/#studio`, name: 'Ahelis Lab', url: config.agencyUrl, email: config.email };
  const graph = [publisher, { '@type': 'WebSite', name: 'Ahelis Business', url: config.siteUrl, inLanguage: language(locale), publisher: { '@id': publisher['@id'] } }, { '@type': 'WebPage', name: title, description, url, inLanguage: language(locale) }];
  if (basePath === '/') graph.push({ '@type': 'SoftwareApplication', name: 'Ahelis Business', applicationCategory: 'FinanceApplication', operatingSystem: 'Web', description, url, publisher: { '@id': publisher['@id'] } });
  if (faqs.length) graph.push({ '@type': 'FAQPage', inLanguage: language(locale), mainEntity: faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) });
  return `<!doctype html><html lang="${language(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="robots" content="${config.indexable && !error ? 'index,follow' : 'noindex,nofollow'}"><meta name="theme-color" content="#08162b"><link rel="icon" href="/favicon.svg" type="image/svg+xml">${!error ? `<link rel="canonical" href="${e(url)}">${['fr', 'en'].map(l => `<link rel="alternate" hreflang="${language(l)}" href="${config.siteUrl}${businessPath(basePath, l)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${config.siteUrl}${basePath}">` : ''}<meta property="og:type" content="website"><meta property="og:site_name" content="Ahelis Business"><meta property="og:locale" content="${locale === 'fr' ? 'fr_CH' : 'en_GB'}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:image" content="${config.siteUrl}/business/budget-${locale}.png"><meta property="og:image:alt" content="${t('Ahelis Business avec des données fictives', 'Ahelis Business with fictional data')}">${!error ? `<meta property="og:url" content="${e(url)}">` : ''}<meta name="twitter:card" content="summary_large_image"><link rel="preload" href="/fonts/manrope-latin-variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/${assets.css}"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script><script type="module" src="/assets/${assets.js}"></script><noscript><style>.business-site .menu-toggle{display:none}.business-site .nav-links{display:flex;position:static;flex-wrap:wrap;padding:16px 0;background:none}.business-site .site-header{height:auto;position:relative}.business-site .nav-inner{flex-wrap:wrap}</style></noscript></head><body class="business-site" data-page="business" data-locale="${locale}" data-contact-email="${e(config.email)}" data-messages="${e(JSON.stringify(clientMessages(locale)))}"><a class="skip-link" href="#main">${t('Aller au contenu', 'Skip to content')}</a><header class="site-header"><div class="container nav-inner"><a class="brand business-brand" href="${p('/')}" aria-label="Ahelis Business"><img src="/business/app-icon.svg" width="36" height="36" alt=""><span>Ahelis <strong>Business</strong></span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button><nav class="nav-links" id="navigation" aria-label="${t('Navigation principale', 'Main navigation')}"><a href="${p('/')}#features">${t('Fonctionnement', 'Features')}</a><a href="${p('/')}#questions">${t('Questions', 'Questions')}</a><a href="${p('/')}#business-contact">Contact</a><a href="${e(config.agencyUrl)}/login?language=${locale}">${t('Se connecter', 'Sign in')}</a>${renderLanguageSwitcher({ value: locale, links: { fr: businessPath(basePath, 'fr'), en: businessPath(basePath, 'en') }, label: t('Langue', 'Language'), theme: 'dark', separator: true })}</nav></div></header><main id="main" tabindex="-1">${content}</main>${localizeMarkup(footer({ config, locale, product: true }), locale)}</body></html>`;
}

// Opening self-service remains an explicit build decision after the account/data migration.
function signupContent(config,locale) {
  const t=(fr,en)=>locale==='fr'?fr:en;
  return localizeMarkup(businessContent(config),locale)
    .replace(/<div class="business-actions">.*?<\/div>/s,`<div class="business-actions"><a class="button button-primary" href="${e(config.agencyUrl)}/login?language=${locale}">${t('Essayer 60 jours gratuitement','Try it free for 60 days')}</a><a class="text-link" href="#business-contact">${t('Nous contacter','Contact us')}</a></div>`)
    .replace(t('Bêta accompagnée · CHF · Français et anglais','Guided beta · CHF · French and English'),t('60 jours sans carte · CHF · Français et anglais','60 days without a card · CHF · French and English'))
    .replace(t('Nous présentons l’application et préparons les conditions d’un essai avec vous.','We will introduce the application and arrange the conditions for a trial with you.'),t('Créez votre compte Ahelis et activez votre espace personnel en quelques étapes.','Create your Ahelis account and activate your personal space in a few steps.'))
    .replace(t('La bêta actuelle fonctionne en CHF, en français et en anglais. Les modalités d’accès et l’offre se discutent directement avec Ahelis Lab.','The current beta works in CHF, in French and English. Access arrangements and the offer are discussed directly with Ahelis Lab.'),t('Après l’essai, vos données restent consultables et exportables. Un abonnement sera nécessaire pour les modifier. Les tarifs seront confirmés avant l’ouverture des paiements.','After the trial, your data remains available to view and export. A subscription will be required to edit it. Pricing will be confirmed before payments open.'));
}
