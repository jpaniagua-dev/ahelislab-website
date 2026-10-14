import { services } from '../data/services.mjs';
import { staticPlanet } from '../components/shared.mjs';
import { processSteps } from '../components/process.mjs';

export function homeContent() {
  return `<section class="hero" id="accueil" data-scene="explore">
    <div class="container hero-grid"><div class="hero-content">
      <p class="eyebrow hero-eyebrow">Studio digital indépendant</p>
      <h1>Votre ambition.<br><span class="accent">Un nouvel univers.</span></h1>
      <p class="hero-copy">Sites web, applications et automatisations pour faire avancer votre activité. De la première idée au lancement, nous donnons forme à un projet qui vous ressemble.</p>
      <div class="hero-actions"><a class="button button-primary" href="/contact/" data-planet-react>Parlons de votre projet</a><a class="button button-quiet" href="/services/">Nos services</a></div>
    </div><div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="600">${staticPlanet}</div></div></div>
  </section>
  <section class="expertises section" id="expertises" data-scene="imagine"><div class="container">
    <div class="section-heading" data-reveal><h2>Ce que nous créons.</h2><p class="section-lead">Un nouveau site, une interface à repenser ou un outil à construire : les compétences adaptées à votre projet.</p></div>
    <div class="expertise-index">${services.map(s => `<article class="expertise-entry" data-reveal><div class="expertise-title"><h3><a class="stretched-link" href="/services/${s.slug}/">${s.label}</a></h3></div><p>${s.intro}</p><span class="entry-arrow" aria-hidden="true">↗</span></article>`).join('')}</div>
    <a class="text-link" href="/services/">Découvrir nos services</a>
  </div></section>
  <section class="studio light-section section" id="studio" data-scene="connect"><div class="container studio-grid">
    <figure class="studio-art" data-reveal><img src="/images/ahelis-orbit-still-life.webp" width="1536" height="1024" alt="Une petite planète jaune et une orbite de papier ivoire, illustration de l’univers Ahelis Lab." loading="lazy" decoding="async"></figure>
    <div class="studio-content" data-reveal><h2>Des idées ambitieuses.<br>Les pieds sur terre.</h2><p class="studio-intro">Un studio indépendant à Genève. Un interlocuteur de la première idée à la mise en ligne.</p><p>Stratégie, design, développement et IA : nous partons de votre quotidien pour créer des outils utiles, en Suisse romande et à l’international.</p><a class="text-link" href="/studio/">Rencontrer le studio</a></div>
  </div></section>
  <section class="approach section" id="approche" data-scene="build"><div class="container"><div class="section-heading" data-reveal><h2>De l’idée à la mise en ligne.</h2><p class="section-lead">Quatre étapes, avec des échanges et des validations à chaque avancée.</p></div>${processSteps()}<a class="text-link" href="/approche/">Comprendre notre approche</a></div></section>
  <section class="contact section" id="contact" data-scene="launch"><div class="container contact-preview"><div data-reveal><h2>Parlons de votre projet.</h2><p>Présentez-nous votre activité et ce que vous souhaitez créer ou améliorer. Une première idée suffit ; le périmètre se précise ensemble.</p><a class="button button-primary" href="/contact/">Préparer votre message</a></div><div class="planet-dock contact-dock" data-planet-dock data-size="240">${staticPlanet}</div></div></section>`;
}
