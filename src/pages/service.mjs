import { escapeHtml, faqSection, staticPlanet } from '../components/shared.mjs';

export function serviceContent(service) {
  const offerPath = service.slug === 'ia-automatisation' ? '/services/accompagnement-ia/' : service.slug === 'developpement-sur-mesure' ? '/services/applications-sur-mesure/' : '/services/marque-digitale/';
  return `<section class="service-hero hero" data-scene="explore"><div class="container hero-grid">
    <div class="hero-content"><nav class="breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><a href="/services/">Nos offres</a><span aria-hidden="true">/</span><span aria-current="page">${service.label}</span></nav><p class="service-context"><a href="${offerPath}">Une expertise au service de votre projet</a></p><h1>${escapeHtml(service.headline).replace('\n', '<br>')}</h1><p class="hero-copy">${service.intro}</p><div class="hero-actions"><a class="button button-primary" href="${offerPath}">Découvrir l’offre</a><a class="button button-quiet" href="#contenu">En savoir plus</a></div></div>
    <div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="490">${staticPlanet}</div></div>
  </div></section>
  <section class="service-detail section" id="contenu" data-scene="imagine"><div class="container"><div class="section-heading heading-with-planet"><div data-reveal><h2>Du besoin<br><span class="accent">au résultat.</span></h2><p class="section-lead">${service.audience}</p></div><div class="planet-dock compact-dock" data-planet-dock data-size="190"></div></div><div class="deliverable-grid">${service.deliverables.map(([title, text], i) => `<article class="deliverable" data-reveal><span class="card-number">0${i + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div></section>
  <section class="light-section service-approach section" data-scene="build"><div class="container service-approach-grid"><div data-reveal><h2>Comment ça se passe.</h2></div><div data-reveal><p>${service.approach}</p><a class="text-link" href="/approche/">Notre méthode</a></div></div></section>
  ${faqSection(service.faqs)}
  <section class="service-cta section" data-scene="launch"><div class="container heading-with-planet"><div data-reveal><h2>Et si on en parlait ?</h2><a class="button button-primary" href="/contact/" data-planet-react>Parlons de votre projet</a></div><div class="planet-dock compact-dock" data-planet-dock data-size="260"></div></div></section>
  <section class="related-services section"><div class="container"><h2>Trois offres pour votre projet.</h2><p>Marque digitale, accompagnement IA et applications sur mesure. Chaque offre réunit les compétences nécessaires pour passer de vos objectifs à leur mise en œuvre.</p><a class="text-link" href="/services/">Découvrir nos offres</a></div></section>`;
}

export function notFoundContent() {
  return `<section class="not-found hero" data-scene="explore"><div class="container hero-grid"><div><span class="eyebrow">404 / Hors de l’orbite</span><h1>Cette page a<br>pris le large.</h1><p class="hero-copy">Retrouvons le bon point de départ.</p><a class="button button-primary" href="/">Retour au studio</a></div><div class="planet-dock" data-planet-dock data-size="480">${staticPlanet}</div></div></section>`;
}
