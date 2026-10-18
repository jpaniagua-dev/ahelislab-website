import { escapeHtml } from './shared.mjs';

export function contactForm(config, { vault = false, product } = {}) {
  const selectedProduct = vault ? 'vault' : product;
  if (selectedProduct && !['vault', 'business'].includes(selectedProduct)) throw new Error('Unsupported contact product.');
  return `    <div class="contact-form-wrap" data-reveal><form id="project-form" aria-label="Contacter Ahelis Lab">
      <div class="form-row"><div class="form-field"><label for="name">Votre nom <span aria-hidden="true">*</span></label><input id="name" name="name" autocomplete="name" placeholder="Comment vous appelez-vous ?" maxlength="120" required></div><div class="form-field"><label for="email">Votre e-mail <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autocomplete="email" placeholder="vous@exemple.ch" maxlength="254" required></div></div>
      ${selectedProduct ? `<input type="hidden" name="project" value="${selectedProduct}">` : '<div class="form-field"><label for="project">Votre projet</label><select id="project" name="project"><option value="website">Créer ma marque digitale et mon site</option><option value="redesign">Refondre ma marque digitale et mon site</option><option value="automation">Accompagnement IA et refonte de mes processus</option><option value="custom">Créer un logiciel ou une application sur mesure</option><option value="explore">Préciser mon projet avec vous</option><option value="vault">Ahelis Vault</option><option value="business">Ahelis Business</option></select></div>'}
      <div class="form-field"><label for="message">Ce que vous avez en tête <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="4" placeholder="Votre activité, votre idée, ce que vous aimeriez faire évoluer…" maxlength="8000" required></textarea></div>
      <div class="contact-trap" aria-hidden="true"><label for="company">Laissez ce champ vide</label><input id="company" name="company" tabindex="-1" autocomplete="off"></div>
      <p class="form-note">* Champs obligatoires. Vos informations servent à répondre à votre demande. <a href="${config.agencyUrl}/privacy/">Confidentialité</a></p>
      <button class="button button-primary submit-button" type="submit" disabled>Envoyer mon message</button>
      <p id="contact-status" class="form-note" role="status" aria-live="polite"></p>
      <noscript><p class="form-note">${config.email ? `Vous pouvez nous écrire à <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>.` : 'L’envoi du message nécessite JavaScript.'}</p></noscript>
    </form><section class="brief-result" id="brief-result" hidden aria-labelledby="brief-title"><h3 id="brief-title">Votre message a été envoyé.</h3><p>Merci pour votre demande. Nous vous répondrons à l’adresse indiquée.</p><button type="button" class="button button-outline" id="new-message">Écrire un autre message</button></section></div>`;
}
