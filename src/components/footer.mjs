import { renderSiteFooter } from '@ahelis/brand';

// Only site content and destinations live here. Markup and styles belong to ahelis-ui.
export function renderFooter({ config, locale = 'fr', product = false } = {}) {
  const agency = config?.agencyUrl || 'https://ahelislab.ch';
  const studio = product ? `${agency}${locale === 'en' ? '/en/' : '/'}` : '/';
  const products = `${agency}${locale === 'en' ? '/en/products/' : '/produits/'}`;
  const navigation = product
    ? [{ title: 'Ahelis Lab', label: 'Découvrir Ahelis Lab', links: [
      { href: studio, label: 'Découvrir le studio' },
      { href: products, label: 'Tous nos produits' },
      { href: agency + '/privacy/', label: 'Confidentialité' },
    ] }]
    : [
      { title: 'Nos offres', links: [
        { href: '/services/marque-digitale/', label: 'Création et refonte de marque digitale' },
        { href: '/services/accompagnement-ia/', label: 'Accompagnement IA' },
        { href: '/services/applications-sur-mesure/', label: 'Applications sur mesure' },
      ] },
      { title: 'Ahelis Lab', label: 'Découvrir Ahelis Lab', links: [
        { href: '/produits/', label: 'Produits' }, { href: '/studio/', label: 'Le studio' },
        { href: '/approche/', label: 'Notre approche' }, { href: '/contact/', label: 'Contact' },
      ] },
    ];
  // Keep French source copy for the existing strict static translation pipeline.
  return renderSiteFooter({
    navigation,
    description: product
      ? ['Studio digital indépendant à Genève.', 'Stratégie, design, développement & IA.']
      : ['Agence digitale indépendante à Genève.', 'Marque digitale, IA et applications sur mesure.'],
    brandHref: studio, brandLabel: 'Ahelis Lab, accueil',
    ...(!product ? { callToAction: { href: '/contact/', label: 'Parlons de votre projet' } } : {}),
    locale: 'fr', theme: 'dark', creditName: product ? 'Ahelis Lab' : 'Paniagua.dev',
    creditHref: product ? studio : 'https://paniagua.dev/',
  }).replaceAll('lang="fr-CH"', `lang="${locale === 'fr' ? 'fr-CH' : 'en'}"`);
}
