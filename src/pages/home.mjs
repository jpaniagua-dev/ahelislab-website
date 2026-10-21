import { staticPlanet } from '../components/shared.mjs';
import { processSteps } from '../components/process.mjs';
import { offerSummaries } from '../components/offers.mjs';

export function homeContent() {
  return `<section class="hero" id="accueil" data-scene="explore">
    <div class="container hero-grid"><div class="hero-content">
      <p class="eyebrow hero-eyebrow">Agence digitale à Genève</p>
      <h1>Vous imaginez.<br><span class="accent">Nous créons.</span></h1>
      <p class="hero-copy">Création de marque et de site web, accompagnement IA et développement d’applications sur mesure pour particuliers et PME.</p>
      <div class="hero-actions"><a class="button button-primary" href="/contact/" data-planet-react>Parlons de votre projet</a><a class="button button-quiet" href="/services/">Découvrir nos offres</a></div>
    </div><div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="600">${staticPlanet}</div></div></div>
  </section>
  <section class="expertises section" id="expertises" data-scene="imagine"><div class="container">
    <div class="section-heading" data-reveal><h2>Trois offres.<br>Des objectifs concrets.</h2><p class="section-lead">Créer votre présence en ligne, intégrer l’IA à vos processus ou développer votre application.</p></div>
    ${offerSummaries()}
  </div></section>
  <section class="studio light-section section" id="studio" data-scene="connect"><div class="container studio-grid">
    <figure class="studio-art" data-reveal><img src="/images/ahelis-orbit-still-life.webp" width="1536" height="1024" alt="Une petite planète jaune et une orbite de papier ivoire, illustration de l’univers Ahelis Lab." loading="lazy" decoding="async"></figure>
    <div class="studio-content" data-reveal><h2>Des idées ambitieuses.<br>Les pieds sur terre.</h2><p class="studio-intro">Une agence indépendante à Genève. Un interlocuteur pour votre marque et votre site.</p><p>Nous accompagnons les PME, indépendants et particuliers de Suisse romande et d’ailleurs. Votre activité guide nos choix, avec des échanges directs à chaque étape.</p><a class="text-link" href="/studio/">Rencontrer le studio</a></div>
  </div></section>
  <section class="approach section" id="approche" data-scene="build"><div class="container"><div class="section-heading" data-reveal><h2>De l’idée à la mise en ligne.</h2><p class="section-lead">Quatre étapes, avec des échanges et des validations à chaque avancée.</p></div>${processSteps()}<a class="text-link" href="/approche/">Comprendre notre approche</a></div></section>
  <section class="contact section" id="contact" data-scene="launch"><div class="container contact-preview"><div data-reveal><h2>Parlons de votre projet.</h2><p>Présentez-nous votre activité et ce que vous souhaitez créer ou améliorer. Une première idée suffit. Nous préciserons ensemble les contours de votre projet.</p><a class="button button-primary" href="/contact/">Préparer votre message</a></div><div class="planet-dock contact-dock" data-planet-dock data-size="240">${staticPlanet}</div></div></section>`;
}
