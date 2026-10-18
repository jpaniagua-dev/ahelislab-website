import { staticPlanet } from '../components/shared.mjs';
import { processSteps } from '../components/process.mjs';

export function homeContent() {
  return `<section class="hero" id="accueil" data-scene="explore">
    <div class="container hero-grid"><div class="hero-content">
      <p class="eyebrow hero-eyebrow">Agence digitale à Genève</p>
      <h1>Votre marque.<br><span class="accent">Sur le web.</span></h1>
      <p class="hero-copy">Création ou refonte de votre identité digitale et de votre site web. Un seul accompagnement, de l’idée à la mise en ligne.</p>
      <div class="hero-actions"><a class="button button-primary" href="/contact/" data-planet-react>Parlons de votre marque</a><a class="button button-quiet" href="/services/">Découvrir l’offre</a></div>
    </div><div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="600">${staticPlanet}</div></div></div>
  </section>
  <section class="expertises section" id="expertises" data-scene="imagine"><div class="container">
    <div class="section-heading" data-reveal><h2>Votre marque digitale,<br>de bout en bout.</h2><p class="section-lead">Un projet unique pour clarifier ce que vous proposez, soigner votre image et construire le site qui la porte.</p></div>
    <article class="brand-offer" data-reveal><div><h3>Création ou refonte</h3><p>Vous démarrez une activité ou votre présence en ligne ne vous représente plus ? Nous partons de votre situation pour concevoir une image cohérente et un site web qui vous ressemble.</p><p>Nous utilisons l’IA pour concevoir et réaliser votre projet au service de vos objectifs. Nous l’intégrons aussi à vos outils et à vos processus pour simplifier le travail de vos équipes au quotidien.</p></div><ul><li>Votre positionnement clarifié.</li><li>Une direction visuelle cohérente.</li><li>Un site web sur mesure, adapté au mobile.</li><li>L’IA intégrée à votre façon de travailler.</li></ul></article>
    <a class="text-link" href="/services/">Voir ce que comprend l’offre</a>
  </div></section>
  <section class="studio light-section section" id="studio" data-scene="connect"><div class="container studio-grid">
    <figure class="studio-art" data-reveal><img src="/images/ahelis-orbit-still-life.webp" width="1536" height="1024" alt="Une petite planète jaune et une orbite de papier ivoire, illustration de l’univers Ahelis Lab." loading="lazy" decoding="async"></figure>
    <div class="studio-content" data-reveal><h2>Des idées ambitieuses.<br>Les pieds sur terre.</h2><p class="studio-intro">Une agence indépendante à Genève. Un interlocuteur pour votre marque et votre site.</p><p>Nous accompagnons les PME, indépendants et particuliers de Suisse romande et d’ailleurs. Votre activité guide nos choix, avec des échanges directs à chaque étape.</p><a class="text-link" href="/studio/">Rencontrer le studio</a></div>
  </div></section>
  <section class="approach section" id="approche" data-scene="build"><div class="container"><div class="section-heading" data-reveal><h2>De l’idée à la mise en ligne.</h2><p class="section-lead">Quatre étapes, avec des échanges et des validations à chaque avancée.</p></div>${processSteps()}<a class="text-link" href="/approche/">Comprendre notre approche</a></div></section>
  <section class="contact section" id="contact" data-scene="launch"><div class="container contact-preview"><div data-reveal><h2>Parlons de votre projet.</h2><p>Présentez-nous votre activité et ce que vous souhaitez créer ou améliorer. Une première idée suffit ; le périmètre se précise ensemble.</p><a class="button button-primary" href="/contact/">Préparer votre message</a></div><div class="planet-dock contact-dock" data-planet-dock data-size="240">${staticPlanet}</div></div></section>`;
}
