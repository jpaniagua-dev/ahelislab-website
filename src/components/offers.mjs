import { offers } from '../data/offers.mjs';

export function offerSummaries({ headingLevel = 3 } = {}) {
  return offers.map(offer => `<article class="brand-offer" data-reveal><div><h${headingLevel}>${offer.label}</h${headingLevel}><p>${offer.summary}</p><a class="text-link offer-link" href="${offer.path}">${offer.linkLabel}</a></div><ul>${offer.points.map(point => `<li>${point}</li>`).join('')}</ul></article>`).join('');
}
