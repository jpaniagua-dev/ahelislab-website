import { renderFooterBottom } from '@ahelis/brand';
// One footer composition for the studio and every product website.
export function renderFooter({ wordmark, config, locale = 'fr', product = false }) {
  const agency = config?.agencyUrl || 'https://ahelislab.ch';
  const studio = product ? `${agency}${locale === 'en' ? '/en/' : '/'}` : '/';
  const products = `${agency}${locale === 'en' ? '/en/products/' : '/produits/'}`;
  const privacy = `${agency}/privacy/`;
  const creditName = product ? 'Ahelis Lab' : 'Paniagua.dev';
  const creditUrl = product ? studio : 'https://paniagua.dev/';
  const links = product
    ? `<nav class="footer-nav" aria-label="Découvrir Ahelis Lab"><p class="footer-title">Ahelis Lab</p><ul><li><a href="${studio}">Découvrir le studio</a></li><li><a href="${products}">Tous nos produits</a></li><li><a href="${privacy}">Confidentialité</a></li></ul></nav>`
    : `<nav class="footer-nav" aria-label="Nos offres"><p class="footer-title">Nos offres</p><ul><li><a href="/services/marque-digitale/">Création et refonte de marque digitale</a></li><li><a href="/services/accompagnement-ia/">Accompagnement IA</a></li><li><a href="/services/applications-sur-mesure/">Applications sur mesure</a></li></ul></nav><nav class="footer-nav" aria-label="Découvrir Ahelis Lab"><p class="footer-title">Ahelis Lab</p><ul><li><a href="/produits/">Produits</a></li><li><a href="/studio/">Le studio</a></li><li><a href="/approche/">Notre approche</a></li><li><a href="/contact/">Contact</a></li></ul></nav>`;
  const description = product ? 'Studio digital indépendant à Genève.<br>Stratégie, design, développement &amp; IA.' : 'Agence digitale indépendante à Genève.<br>Marque digitale, IA et applications sur mesure.';
  return `<footer class="site-footer${product ? ' product-footer' : ''}"><div class="container">
    <div class="footer-grid"><div class="footer-brand"><a class="brand" href="${studio}" aria-label="Ahelis Lab, accueil">${wordmark}</a><p>${description}</p>${product ? '' : '<a class="text-link" href="/contact/">Parlons de votre projet</a>'}</div>${links}</div>
    ${renderFooterBottom({ locale: 'fr', theme: 'dark', creditName, creditHref: creditUrl }).replace('lang="fr-CH"', `lang="${locale === 'fr' ? 'fr-CH' : 'en'}"`)}
  </div></footer>`;
}
