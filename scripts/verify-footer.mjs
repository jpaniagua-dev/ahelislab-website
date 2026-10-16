import assert from 'node:assert/strict';

export function verifyFooter(html, { locale, product, agencyUrl = "https://ahelislab.ch" }) {
  const privacy = `${agencyUrl}/privacy/`;
  const footer = html.match(/<footer class="site-footer[^"]*">(.*?)<\/footer>/s)?.[1];
  assert.ok(footer, 'shared footer composition');
  assert.ok(footer.includes('footer-swiss-flag') && footer.includes('footer-credit'));
  assert.ok(footer.includes(locale === 'en' ? 'Designed, operated and hosted in Switzerland' : 'Conçu, opéré et hébergé en Suisse'));
  assert.ok(footer.includes(locale === 'en' ? 'Made with' : 'Créé avec'));
  assert.ok(footer.includes(`aria-label="${locale === 'en' ? 'love' : 'amour'}"`));
  assert.ok(footer.includes(`href="${privacy}"`));
  assert.ok(!footer.includes('/confidentialite/') && !footer.includes('/en/privacy/'));
  if (product) {
    assert.ok(footer.includes(`href="${agencyUrl}${locale === 'en' ? '/en/' : '/'}">${locale === 'en' ? 'Discover the studio' : 'Découvrir le studio'}</a>`));
    assert.ok(footer.includes(`href="https://ahelislab.ch${locale === 'en' ? '/en/products/' : '/produits/'}">${locale === 'en' ? 'All our products' : 'Tous nos produits'}</a>`));
    assert.ok(!footer.includes('Paniagua.dev'), 'product attribution belongs to Ahelis Lab');
  }
}
