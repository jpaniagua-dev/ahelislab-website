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
    : `<nav class="footer-nav" aria-label="Notre offre"><p class="footer-title">Notre offre</p><ul><li><a href="/services/">Création et refonte de marque digitale</a></li></ul></nav><nav class="footer-nav" aria-label="Découvrir Ahelis Lab"><p class="footer-title">Ahelis Lab</p><ul><li><a href="/produits/">Produits</a></li><li><a href="/studio/">Le studio</a></li><li><a href="/approche/">Notre approche</a></li><li><a href="/contact/">Contact</a></li></ul></nav>`;
  const description = product ? 'Studio digital indépendant à Genève.<br>Stratégie, design, développement &amp; IA.' : 'Agence digitale indépendante à Genève.<br>Création et refonte de marque digitale.';
  return `<footer class="site-footer${product ? ' product-footer' : ''}"><div class="container">
    <div class="footer-grid"><div class="footer-brand"><a class="brand" href="${studio}" aria-label="Ahelis Lab, accueil">${wordmark}</a><p>${description}</p>${product ? '' : '<a class="text-link" href="/contact/">Parlons de votre marque</a>'}</div>${links}</div>
    <div class="footer-bottom"><p class="footer-swiss"><svg class="footer-swiss-flag" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect width="20" height="20" rx="3" fill="#da291c"/><path d="M8 4h4v4h4v4h-4v4H8v-4H4V8h4z" fill="#fff"/></svg><span>Conçu, opéré et hébergé en Suisse</span></p><div class="footer-legal"><p>© 2026 Ahelis Lab</p><a href="${privacy}">Confidentialité</a></div><p class="footer-credit" lang="${locale === 'fr' ? 'fr-CH' : 'en'}"><span>Made with</span><svg class="footer-heart" width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="love" focusable="false"><path fill="currentColor" d="M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12Z"/></svg><span>by <a href="${creditUrl}">${creditName}</a></span></p></div>
  </div></footer>`;
}
