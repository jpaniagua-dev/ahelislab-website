import { services } from '../data/services.mjs';
import { escapeHtml, faqSection, staticPlanet } from '../components/shared.mjs';

export function serviceContent(service) {
  return `<section class="service-hero hero" data-scene="explore"><div class="container hero-grid">
    <div class="hero-content"><nav class="breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><a href="/services/">Services</a><span aria-hidden="true">/</span><span aria-current="page">${service.label}</span></nav><h1>${escapeHtml(service.headline).replace('\n', '<br>')}</h1><p class="hero-copy">${service.intro}</p><div class="hero-actions"><a class="button button-primary" href="/contact/" data-planet-react>Parlons de votre projet</a><a class="button button-quiet" href="#contenu">En savoir plus</a></div></div>
    <div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="490">${staticPlanet}</div></div>
  </div></section>
  <section class="service-detail section" id="contenu" data-scene="imagine"><div class="container"><div class="section-heading heading-with-planet"><div data-reveal><h2>Du besoin<br><span class="accent">au résultat.</span></h2><p class="section-lead">${service.audience}</p></div><div class="planet-dock compact-dock" data-planet-dock data-size="190"></div></div><div class="deliverable-grid">${service.deliverables.map(([title, text], i) => `<article class="deliverable" data-reveal><span class="card-number">0${i + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div></section>
  <section class="light-section service-approach section" data-scene="build"><div class="container service-approach-grid"><div data-reveal><h2>Comment ça se passe.</h2></div><div data-reveal><p>${service.approach}</p><a class="text-link" href="/approche/">Notre méthode</a></div></div></section>
  ${faqSection(service.faqs)}
  <section class="service-cta section" data-scene="launch"><div class="container heading-with-planet"><div data-reveal><h2>Et si on en parlait ?</h2><a class="button button-primary" href="/contact/" data-planet-react>Parlons de votre projet</a></div><div class="planet-dock compact-dock" data-planet-dock data-size="260"></div></div></section>
  <section class="related-services section"><div class="container"><h2>Les autres expertises du Lab.</h2><div class="related-grid">${services.filter(s => s.slug !== service.slug).map(s => `<a href="/services/${s.slug}/" class="related-service"><span>${s.label}</span></a>`).join('')}</div></div></section>`;
}

export function privacyContent(config) {
  return `<section class="document section"><div class="container document-inner"><span class="eyebrow">Ahelis Lab</span><h1>Confidentialité.</h1><p class="document-lead">Cette version du site privilégie une navigation simple, sans outil de suivi publicitaire ni mesure d’audience intégrée.</p>
    <h2>Vos messages</h2><p>Le <a href="/contact/">formulaire de contact</a> transmet votre nom, votre adresse e-mail, le type de projet et votre message au studio pour répondre à votre demande.</p><p>L’envoi passe par notre serveur puis par Resend, notre prestataire d’e-mail. Votre adresse sert à vous répondre. Le site n’enregistre pas votre message dans le stockage du navigateur et ne vous inscrit à aucune liste marketing.</p><p>Les journaux de l’application ne contiennent pas le contenu de votre demande. Des données techniques sont utilisées temporairement pour limiter les abus.</p>
    <h2>Préférence d’animation</h2><p>Le site respecte la préférence de réduction des mouvements de votre appareil. Vous pouvez ajuster cette préférence dans votre système ; aucun choix d’animation n’est enregistré par le site.</p>
    <h2>Accès au site</h2><p>L’hébergement peut traiter les informations techniques nécessaires à la mise à disposition du site, comme l’adresse IP et les journaux d’accès. La version de consultation reste non indexable.</p>
    <h2>Nous contacter</h2><p>${config.email ? `Pour une question, vous pouvez écrire à <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>.` : 'Les coordonnées de contact seront complétées lors de la mise en ligne publique.'}</p><a class="button button-outline" href="/">Retour au studio</a></div></section>`;
}

export function notFoundContent() {
  return `<section class="not-found hero" data-scene="explore"><div class="container hero-grid"><div><span class="eyebrow">404 / Hors de l’orbite</span><h1>Cette page a<br>pris le large.</h1><p class="hero-copy">Retrouvons le bon point de départ.</p><a class="button button-primary" href="/">Retour au studio</a></div><div class="planet-dock" data-planet-dock data-size="480">${staticPlanet}</div></div></section>`;
}
