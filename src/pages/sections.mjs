import { services, contactFaqs } from '../data/services.mjs';
import { breadcrumbs, faqSection, staticPlanet, escapeHtml } from '../components/shared.mjs';
import { contactForm } from '../components/contact-form.mjs';
import { studioPresentation } from '../components/studio.mjs';
import { processSteps } from '../components/process.mjs';

export function servicesContent() {
  return `<section class="page-intro section" data-scene="imagine"><div class="container">${breadcrumbs('Services')}<p class="eyebrow">Stratégie · Design · Développement · IA</p><h1>Les compétences pour<br>faire avancer votre projet.</h1><p class="page-lead">Créer, repenser ou relier vos outils numériques. Un projet peut mobiliser une seule expertise ou en combiner plusieurs, selon votre besoin.</p>
  <div class="services-directory">${services.map(s => `<article class="directory-entry" data-reveal><div><h2><a href="/services/${s.slug}/">${s.label}</a></h2><p>${s.audience}</p></div><div><p>${s.summary}</p><a class="text-link" href="/services/${s.slug}/">Découvrir ${s.label.toLowerCase()}</a></div></article>`).join('')}</div>
  <p class="page-lead">Vous partez d’un outil existant ? Un état des lieux permet de préciser ce qui doit évoluer et les compétences nécessaires.</p><a class="button button-primary" href="/contact/">Discuter de votre besoin</a></div></section>`;
}

export function studioContent() {
  return `<section class="page-intro section" data-scene="connect"><div class="container">${breadcrumbs('Le studio')}<p class="eyebrow">Ahelis Lab</p><h1>Un studio indépendant.<br>Des projets qui vous ressemblent.</h1><p class="page-lead">Stratégie, design, développement et IA réunis pour créer des expériences et des produits numériques utiles.</p></div></section>
  <section class="studio light-section section" data-scene="connect"><div class="container studio-grid">${studioPresentation()}</div></section>
  <section class="section" data-scene="build"><div class="container studio-principles"><div data-reveal><h2>Explorer, puis concrétiser.</h2><p>Le Lab est un espace de recherche et d’expérimentation. Nous testons les idées et les choix techniques avant de les intégrer à votre projet. Le besoin guide les outils, du premier prototype à la réalisation.</p><p>Le studio accompagne les PME, indépendants et particuliers de Suisse romande, tous secteurs, avec des échanges possibles à distance et à l’international.</p></div><div data-reveal><h2>Une place précise pour l’IA.</h2><p>L’IA peut aider à explorer une piste, préparer un prototype ou automatiser une tâche. Son usage se décide selon son utilité et les contraintes de confidentialité du projet. Les choix, la relecture et la validation restent humains.</p><a class="text-link" href="/approche/">Découvrir notre façon de travailler</a></div></div></section>
  <section class="service-cta section" data-scene="launch"><div class="container"><h2>Faisons connaissance.</h2><a class="button button-primary" href="/contact/">Parlons de votre projet</a></div></section>`;
}

export function approachContent() {
  return `<section class="page-intro section" data-scene="build"><div class="container">${breadcrumbs('Notre approche')}<p class="eyebrow">Notre approche</p><h1>De l’idée à<br>la mise en ligne.</h1><p class="page-lead">Un projet se construit par étapes. Vous savez ce qui est prévu, ce que vous pouvez valider et ce qui vient ensuite. Le niveau de détail s’adapte au périmètre du projet.</p>${processSteps({ detailed: true })}<a class="button button-primary" href="/contact/">Parlons de votre première étape</a></div></section>`;
}

export function contactContent(config) {
  return `<section class="contact section page-intro" id="contact" data-scene="launch"><div class="container">${breadcrumbs('Contact')}<div class="contact-layout"><div class="contact-copy" data-reveal><p class="eyebrow">Contact</p><h1>Parlons de<br>votre projet.</h1><p>Présentez-nous votre activité et ce que vous souhaitez créer ou améliorer. Une première idée suffit ; le périmètre se précise ensemble.</p><p>Si vous avez déjà un site, indiquez son adresse et ce qui vous manque aujourd’hui.</p><div class="planet-dock contact-dock" data-planet-dock data-size="240">${staticPlanet}</div>${config.email ? `<a class="contact-email" href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>` : ''}</div>${contactForm(config)}</div></div></section>${faqSection(contactFaqs)}`;
}
