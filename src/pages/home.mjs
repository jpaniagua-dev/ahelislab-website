import { services, homeFaqs } from '../data/services.mjs';
import { escapeHtml, faqSection, staticPlanet } from '../components/shared.mjs';

export function homeContent(config) {
  const offers = [
    ['launch', 'Lancer', 'Votre premier\nterrain d’expression.', 'Pour poser les bases de votre activité et vous présenter avec justesse.', ['Direction visuelle', 'Site vitrine sur mesure', 'Bases du référencement', 'Prise en main accompagnée']],
    ['redesign', 'Repenser', 'Un nouveau regard.\nUn nouvel élan.', 'Pour faire évoluer une présence en ligne qui ne vous correspond plus.', ['Analyse du site existant', 'Refonte des parcours et du design', 'Développement et migration', 'Pistes d’amélioration continue']],
    ['build', 'Créer', 'Le projet qui sort\ndu cadre.', 'Pour donner forme à une application ou à un besoin propre à votre métier.', ['Exploration du besoin', 'Prototype UX/UI', 'Développement sur mesure', 'IA et intégrations selon le besoin']]
  ];
  const steps = [
    ['Explorer', 'Tout commence par vous.', 'Votre activité, vos clients, vos contraintes. Nous posons les bonnes questions pour définir un objectif et un périmètre clairs.'],
    ['Imaginer', 'Donner forme à l’idée.', 'Nous dessinons les parcours et les premières maquettes. Vous pouvez voir, comprendre et ajuster la direction avant le développement.'],
    ['Construire', 'Chaque détail compte.', 'Nous développons, vérifions et affinons l’expérience sur les écrans qui comptent. Le contenu, la performance et le référencement font partie du travail.'],
    ['Faire évoluer', 'Le début d’une trajectoire.', 'Nous préparons la mise en ligne et la prise en main. L’accompagnement et les évolutions à prévoir sont définis selon vos besoins.']
  ];
  return `<section class="hero" id="accueil" data-scene="explore">
    <div class="container hero-grid"><div class="hero-content">
      <p class="eyebrow hero-eyebrow">Studio digital indépendant</p>
      <h1>Votre ambition.<br><span class="accent">Un nouvel univers.</span></h1>
      <p class="hero-copy">Stratégie, design, développement et IA pour donner à votre activité une présence qui lui ressemble.</p>
      <div class="hero-actions"><a class="button button-primary" href="#contact" data-planet-react>Parlons de votre projet</a><a class="button button-quiet" href="#expertises">Explorer le studio</a></div>
    </div><div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="600">${staticPlanet}</div></div></div>
  </section>

  <section class="expertises section" id="expertises" data-scene="imagine"><div class="container">
    <div class="section-heading" data-reveal><h2>Une idée ne se construit<br>pas dans une case.</h2><p class="section-lead">Quatre expertises qui se parlent, du premier regard au dernier détail.</p></div>
    <div class="expertise-index">${services.map(s => `<article class="expertise-entry" data-reveal data-planet-react><div class="expertise-title"><span class="expertise-discipline">${s.discipline}</span><h3><a class="stretched-link" href="/services/${s.slug}/">${s.title}</a></h3></div><p>${s.summary}</p><span class="entry-arrow" aria-hidden="true">↗</span></article>`).join('')}</div>
    <p class="audience-note">Pour les PME, les indépendants et les particuliers de Suisse romande. Et les bonnes idées, d’où qu’elles viennent.</p>
  </div></section>

  <section class="studio light-section section" id="studio" data-scene="connect"><div class="container studio-grid">
    <figure class="studio-art" data-reveal><img src="/images/ahelis-orbit-still-life.webp" width="1536" height="1024" alt="Une petite planète jaune et une orbite de papier ivoire, illustration de l’univers Ahelis Lab." loading="lazy" decoding="async"></figure>
    <div class="studio-content" data-reveal><h2>Des idées ambitieuses.<br>Les pieds sur terre.</h2><p class="studio-intro">Un site beau, c’est bien. Un site beau <em>et utile</em>, c’est le point de départ.</p><p>Chez Ahelis Lab, nous partons de votre réalité pour imaginer ce qui peut la faire avancer. Une présence en ligne plus claire, un parcours plus simple ou un outil qui vous facilite la vie.</p><p>L’IA nous aide à explorer et à produire. Le regard, les choix et l’attention aux détails restent humains.</p><div class="founder"><div><strong>Julio Paniagua</strong><span>Fondateur, développement front-end & UX/UI</span></div></div></div>
    <div class="studio-values"><div><h3>Un échange direct.</h3><p>Un interlocuteur de la première idée à la mise en ligne.</p></div><div><h3>Des choix qui ont du sens.</h3><p>La bonne solution pour votre besoin, sans complexité superflue.</p></div><div><h3>Le soin du détail.</h3><p>Ce qui se voit. Et ce qui rend l’expérience agréable.</p></div></div>
  </div></section>

  <section class="offers section" id="projets" data-scene="shape"><div class="container">
    <div class="section-heading" data-reveal><h2>Votre point de départ.</h2><p class="section-lead">Lancer une activité, repenser l’existant ou construire quelque chose de nouveau.</p></div>
    <div class="offer-grid">${offers.map(([key, name, title, intro, bullets], i) => `<article class="offer-card ${i === 1 ? 'offer-featured' : ''}" data-reveal><div class="offer-label">${name}</div><h3>${title.replaceAll('\n', ' ')}</h3><p>${intro}</p><ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul><a class="text-link" href="#contact" data-project="${key}" data-planet-react>Parlons de votre projet <span aria-hidden="true">↗</span></a></article>`).join('')}</div>
    <p class="offer-note">Un périmètre défini ensemble. Un devis adapté à votre projet.</p>
  </div></section>

  <section class="approach section" id="approche" data-scene="build"><div class="container">
    <div class="section-heading" data-reveal><span class="eyebrow">Notre approche</span><h2>On avance ensemble.<br>Vous voyez ce qui prend forme.</h2></div>
    <div class="process-grid">${steps.map(([name, headline, text]) => `<article class="process-step" data-reveal><h3>${name}</h3><strong>${headline}</strong><p>${text}</p></article>`).join('')}</div>
  </div></section>

  ${faqSection(homeFaqs, { home: true })}

  <section class="contact section" id="contact" data-scene="launch"><div class="container contact-layout">
    <div class="contact-copy" data-reveal><h2>Faisons une place<br>à votre idée.</h2><p>Une idée précise ou une première intuition ? Racontez-nous ce que vous avez en tête.</p><div class="planet-dock contact-dock" data-planet-dock data-size="240"></div>${config.email ? `<a class="contact-email" href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>` : ''}</div>
    <div class="contact-form-wrap" data-reveal><form id="project-form" aria-label="Préparer votre demande de projet">
      <div class="form-row"><div class="form-field"><label for="name">Votre nom <span aria-hidden="true">*</span></label><input id="name" name="name" autocomplete="name" placeholder="Comment vous appelez-vous ?" maxlength="120" required></div><div class="form-field"><label for="email">Votre e-mail <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autocomplete="email" placeholder="vous@exemple.ch" maxlength="254" required></div></div>
      <div class="form-field"><label for="project">Votre projet</label><select id="project" name="project"><option>Un site web</option><option>Une refonte</option><option>Du design UX/UI</option><option>Une application sur mesure</option><option>De l’IA ou de l’automatisation</option><option>Une idée à explorer</option></select></div>
      <div class="form-field"><label for="message">Ce que vous avez en tête <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="4" placeholder="Votre activité, votre idée, ce que vous aimeriez faire évoluer…" maxlength="8000" required></textarea></div>
      <p class="form-note">Les champs marqués d’un * sont nécessaires. Le message est préparé dans votre navigateur. Aucun envoi automatique.</p>
      <button class="button button-primary submit-button" type="submit" disabled>${config.email ? 'Préparer mon e-mail' : 'Préparer mon message'}</button>
      <noscript><p class="form-note">${config.email ? `Vous pouvez nous écrire à <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>.` : 'La préparation du message nécessite JavaScript.'}</p></noscript>
    </form><section class="brief-result" id="brief-result" hidden aria-labelledby="brief-title"><h3 id="brief-title">Votre message est prêt.</h3><p>${config.email ? 'Ouvrez votre messagerie pour le relire et l’envoyer.' : 'Vous pouvez copier votre brief pour le conserver.'}</p><label class="sr-only" for="brief-text">Message préparé</label><textarea id="brief-text" rows="8" readonly></textarea><div class="brief-actions">${config.email ? '<a id="compose-email" class="button button-primary" href="#contact">Ouvrir ma messagerie</a>' : ''}<button type="button" class="button button-outline" id="copy-brief">Copier le message</button><button type="button" class="text-link" id="edit-brief">Modifier</button></div><p id="brief-status" class="form-note" role="status" aria-live="polite"></p></section></div>
  </div></section>`;
}
