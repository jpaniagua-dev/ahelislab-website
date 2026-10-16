import { english } from './en.mjs';
import { productsEnglish } from './products-en.mjs';
import { businessEnglish } from './business-en.mjs';

export const locales = ['fr', 'en'];
export const languageTags = { fr: 'fr-CH', en: 'en' };
export const routes = {
  '/': '/en/', '/services/': '/en/services/', '/produits/': '/en/products/', '/studio/': '/en/studio/',
  '/approche/': '/en/approach/', '/contact/': '/en/contact/',
  '/privacy/': '/privacy/', '/404.html': '/en/404.html',
  '/services/creation-site-web/': '/en/services/website-creation/',
  '/services/design-ux-ui/': '/en/services/ux-ui-design/',
  '/services/developpement-sur-mesure/': '/en/services/custom-development/',
  '/services/ia-automatisation/': '/en/services/ai-automation/'
};
const frenchSignature = { 'Made with': 'Créé avec', by: 'par', love: 'amour' };
const footerEnglish = { 'Découvrir le studio': 'Discover the studio', 'Tous nos produits': 'All our products' };
const neutral = new Set(['AHELIS', 'LAB', 'Ahelis Lab', 'Ahelis Vault', 'Ahelis Business', 'Paniagua.dev', 'FR', 'EN', 'English', 'Français']);

export function translate(value, locale = 'fr') {
  if (!locales.includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
  if (locale === 'fr') return frenchSignature[value] || value;
  if (Object.hasOwn(footerEnglish, value)) return footerEnglish[value];
  if (Object.hasOwn(businessEnglish, value)) return businessEnglish[value];
  if (Object.hasOwn(productsEnglish, value)) return productsEnglish[value];
  if (Object.hasOwn(english, value)) return english[value];
  if (!value.trim() || neutral.has(value) || /^[\d\s*/.↗©]+$/.test(value) || /^[^\s<>]+@[^\s<>]+$/.test(value) || /^© \d{4} Ahelis Lab$/.test(value)) return value;
  if (value.includes('\n')) return value.split('\n').map(part => translate(part, locale)).join('\n');
  throw new Error(`Missing ${locale} translation: ${value}`);
}

export function localizedPath(path, locale = 'fr') {
  if (path === '/privacy/') return `/privacy/#privacy-${locale}`;
  const [base, anchor] = path.split('#');
  return `${locale === 'en' ? routes[base] || base : base}${anchor === undefined ? '' : `#${anchor}`}`;
}

const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const encode = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

// Translate trusted static template text and accessible attributes at build time.
// Fail on missing entries rather than delivering a partially translated page.
export function localizeMarkup(markup, locale) {
  return markup.replace(/<[^>]+>|[^<]+/g, token => {
    if (token.startsWith('<')) {
      const translated = token.replace(/\b(aria-label|placeholder|alt)="([^"]*)"/g, (_, name, value) => `${name}="${encode(translate(decode(value), locale))}"`);
      return token.includes('hreflang=') ? translated : translated.replace(/\bhref="(\/[^"\s]*)"/g, (_, value) => `href="${localizedPath(value, locale)}"`);
    }
    const text = token.trim();
    return text ? token.replace(text, () => encode(translate(decode(text), locale))) : token;
  }).replace(/(<a[^>]*data-(?:vault|business)-link[^>]*href=")([^"]+)\/("[^>]*>)/g, (_, before, origin, after) => `${before}${origin}${locale === 'en' ? '/en/' : '/'}${after}`)
    .replaceAll('/business/budget-fr.png', `/business/budget-${locale}.png`);
}

export function clientMessages(locale) {
  return Object.fromEntries(Object.entries({
    planet: 'Faire réagir la planète', sendButton: 'Envoyer mon message', sending: 'Envoi en cours…',
    sendFailed: 'Votre message n’a pas pu être envoyé. Réessayez ou écrivez-nous directement par e-mail.',
    rateLimited: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
    invalid: 'Vérifiez les informations du formulaire avant de réessayer.'
  }).map(([key, value]) => [key, translate(value, locale)]));
}
