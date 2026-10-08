import { services, homeFaqs } from '../data/services.mjs';
import { escapeHtml, icon, faqSection, staticPlanet } from '../components/shared.mjs';

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
      <p class="eyebrow hero-eyebrow"><span class="small-orbit" aria-hidden="true"></span>Studio digital · Genève, Suisse</p>
      <h1>Votre ambition.<br>Un nouvel<br><span class="accent">univers.</span></h1>
      <p class="hero-copy">Nous donnons vie à vos idées sur le web.<br>Stratégie, design, développement et IA : un regard neuf, du premier déclic à la mise en ligne.</p>
      <div class="hero-actions"><a class="button button-primary" href="#contact" data-planet-react>Parlons de votre projet<span class="button-dot" aria-hidden="true"></span></a><a class="button button-quiet" href="#expertises">Explorer le studio</a></div>
      <p class="hero-audience">Pour les PME, les indépendants et les particuliers.</p>
    </div><div class="hero-visual"><div class="planet-dock" data-planet-dock data-size="560">${staticPlanet}</div><p class="planet-caption"><span class="caption-line" aria-hidden="true"></span>Les grandes idées commencent<br>souvent dans un petit monde.</p></div></div>
    <div class="container hero-bottom"><a class="scroll-link" href="#expertises"><span class="scroll-orbit" aria-hidden="true"></span>La suite de l’exploration</a><span class="hero-coordinate">46°12′ N · 6°09′ E</span><span class="hero-index">01 — EXPLORER</span></div>
  </section>

  <div class="discipline-strip" aria-label="Nos disciplines"><div class="container"><span>Stratégie</span><span class="strip-star" aria-hidden="true">✦</span><span>Design</span><span class="strip-star" aria-hidden="true">✦</span><span>Développement</span><span class="strip-star" aria-hidden="true">✦</span><span>Intelligence artificielle</span></div></div>

  <section class="expertises section" id="expertises" data-scene="imagine"><div class="container">
    <div class="section-heading heading-with-planet"><div data-reveal><span class="eyebrow">01 / Nos expertises</span><h2>Les idées prennent vie.<br><span class="muted-heading">Le reste prend sens.</span></h2><p class="section-lead">Quatre disciplines, une même direction :<br>créer le bon outil pour votre activité.</p></div><div class="planet-dock compact-dock" data-planet-dock data-size="200"></div></div>
    <div class="service-grid">${services.map(s => `<article class="service-card" data-reveal data-planet-react><div class="card-top"><span class="card-number">${s.number}</span><span class="service-icon">${icon(s.icon)}</span></div><span class="card-discipline">${s.discipline}</span><h3>${s.title}</h3><p>${s.summary}</p><a class="text-link stretched-link" href="/services/${s.slug}/" aria-label="Découvrir : ${s.label}">Découvrir</a></article>`).join('')}</div>
  </div></section>

  <section class="studio light-section section" id="studio" data-scene="connect"><div class="container studio-grid">
    <div class="studio-visual"><span class="eyebrow" data-reveal>02 / L’esprit du Lab</span><div class="planet-dock studio-dock" data-planet-dock data-size="340"></div><span class="studio-caption">La curiosité nous fait avancer.</span></div>
    <div class="studio-content" data-reveal><h2>Des idées<br>ambitieuses.<br><span>Les pieds sur terre.</span></h2><p class="studio-intro">Un site beau, c’est bien.<br>Un site beau <em>et utile</em>, c’est le point de départ.</p><p>Chez Ahelis Lab, nous partons de votre réalité pour imaginer ce qui peut la faire avancer. Une présence en ligne plus claire, un parcours plus simple ou un outil qui vous facilite la vie.</p><p>L’IA nous aide à explorer et à produire. Le regard, les choix et l’attention aux détails restent humains.</p><div class="founder"><span class="founder-monogram" aria-hidden="true">JP</span><div><strong>Julio Paniagua</strong><span>Développeur front-end · UX/UI · Fondateur du studio</span></div></div></div>
    <div class="studio-values"><div><span class="value-number">01</span><h3>Un échange direct.</h3><p>Un interlocuteur de la première idée à la mise en ligne.</p></div><div><span class="value-number">02</span><h3>Des choix qui ont du sens.</h3><p>La bonne solution pour votre besoin, sans complexité superflue.</p></div><div><span class="value-number">03</span><h3>Le soin du détail.</h3><p>Ce qui se voit. Et ce qui rend l’expérience agréable.</p></div></div>
  </div></section>

  <section class="offers section" id="projets" data-scene="shape"><div class="container">
    <div class="section-heading heading-with-planet"><div data-reveal><span class="eyebrow">03 / Votre point de départ</span><h2>À chaque ambition,<br><span class="muted-heading">sa trajectoire.</span></h2><p class="section-lead">Vous n’avez pas besoin de tout savoir.<br>Seulement de savoir où vous voulez aller.</p></div><div class="planet-dock compact-dock" data-planet-dock data-size="180"></div></div>
    <div class="offer-grid">${offers.map(([key, name, title, intro, bullets], i) => `<article class="offer-card ${i === 1 ? 'offer-featured' : ''}" data-reveal><div class="offer-label"><span>${name}</span><span class="offer-orbit" aria-hidden="true">${['◌', '◎', '✦'][i]}</span></div><h3>${title.replaceAll('\n', '<br>')}</h3><p>${intro}</p><ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul><a class="button ${i === 1 ? 'button-primary' : 'button-outline'}" href="#contact" data-project="${key}" data-planet-react>Parlons-en</a></article>`).join('')}</div>
    <p class="offer-note">Un périmètre défini ensemble. Un devis adapté à votre projet.</p>
  </div></section>

  <section class="approach section" id="approche" data-scene="build"><div class="container">
    <div class="section-heading heading-with-planet"><div data-reveal><span class="eyebrow">04 / Comment on avance</span><h2>Une idée. Des échanges.<br><span class="accent">Quelque chose de concret.</span></h2></div><div class="planet-dock compact-dock" data-planet-dock data-size="180"></div></div>
    <div class="process-grid">${steps.map(([name, headline, text], i) => `<article class="process-step" data-reveal data-planet-react><div class="process-line"><span></span><span class="step-number">0${i + 1}</span></div><h3>${name}</h3><strong>${headline}</strong><p>${text}</p></article>`).join('')}</div>
    <div class="local-note" data-reveal><span class="local-label">GENÈVE, SUISSE</span><p>Proche de vous.<br><span>Ouvert sur le monde.</span></p><div>Basé à Genève, le studio accompagne les projets en Suisse romande et au-delà. Les échanges à distance font aussi partie du quotidien.</div></div>
  </div></section>

  ${faqSection(homeFaqs, { home: true })}

  <section class="contact section" id="contact" data-scene="launch"><div class="container contact-layout">
    <div class="contact-copy" data-reveal><span class="eyebrow">Et maintenant ?</span><h2>Votre prochaine<br>grande idée<br><span class="accent">commence ici.</span></h2><p>Une idée précise ou une première intuition ?<br>Racontez-nous ce que vous avez en tête.</p><div class="planet-dock contact-dock" data-planet-dock data-size="220"></div>${config.email ? `<a class="contact-email" href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>` : ''}</div>
    <div class="contact-form-wrap" data-reveal><form id="project-form" aria-label="Préparer votre demande de projet">
      <div class="form-row"><div class="form-field"><label for="name">Votre nom <span aria-hidden="true">*</span></label><input id="name" name="name" autocomplete="name" placeholder="Comment vous appelez-vous ?" maxlength="120" required></div><div class="form-field"><label for="email">Votre e-mail <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autocomplete="email" placeholder="vous@exemple.ch" maxlength="254" required></div></div>
      <div class="form-field"><label for="project">Votre projet</label><select id="project" name="project"><option>Un site web</option><option>Une refonte</option><option>Du design UX/UI</option><option>Une application sur mesure</option><option>De l’IA ou de l’automatisation</option><option>Une idée à explorer</option></select></div>
      <div class="form-field"><label for="message">Ce que vous avez en tête <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="4" placeholder="Votre activité, votre idée, ce que vous aimeriez faire évoluer…" maxlength="8000" required></textarea></div>
      <p class="form-note">Les champs marqués d’un * sont nécessaires. Le message est préparé dans votre navigateur. Aucun envoi automatique.</p>
      <button class="button button-primary submit-button" type="submit" disabled>${config.email ? 'Préparer mon e-mail' : 'Préparer mon message'}<span class="button-dot" aria-hidden="true"></span></button>
      <noscript><p class="form-note">${config.email ? `Vous pouvez nous écrire à <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>.` : 'La préparation du message nécessite JavaScript.'}</p></noscript>
    </form><section class="brief-result" id="brief-result" hidden aria-labelledby="brief-title"><h3 id="brief-title">Votre message est prêt.</h3><p>${config.email ? 'Ouvrez votre messagerie pour le relire et l’envoyer.' : 'Vous pouvez copier votre brief pour le conserver.'}</p><label class="sr-only" for="brief-text">Message préparé</label><textarea id="brief-text" rows="8" readonly></textarea><div class="brief-actions">${config.email ? '<a id="compose-email" class="button button-primary" href="#contact">Ouvrir ma messagerie</a>' : ''}<button type="button" class="button button-outline" id="copy-brief">Copier le message</button><button type="button" class="text-link" id="edit-brief">Modifier</button></div><p id="brief-status" class="form-note" role="status" aria-live="polite"></p></section></div>
  </div></section>`;
}
