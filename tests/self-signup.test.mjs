import test from 'node:test';
import assert from 'node:assert/strict';
import {getConfig} from '../src/config.mjs';
import {businessPages} from '../src/business/site.mjs';
import {vaultLayout} from '../src/vault/site.mjs';
import {header} from '../src/components/shared.mjs';
import {localizeMarkup} from '../src/i18n/index.mjs';

test('the agency exposes one shared sign-in link in each language',()=>{
  for(const locale of ['fr','en']) {
    const html=localizeMarkup(header('/',locale),locale);
    assert.equal((html.match(/\/login\?language=/g)??[]).length,1);
    assert.ok(html.includes('href="https://ahelislab.ch/login?language='+locale+'"'));
    assert.ok(html.includes(locale==='fr'?'>Se connecter</a>':'>Sign in</a>'));
  }
});

test('Vault navigation uses the shared login in both languages with signup open or closed',()=>{
  for(const enabled of ['true','false']) for(const locale of ['fr','en']) {
    const config=getConfig({SITE_URL:'https://vault.ahelislab.ch',VAULT_CUSTOMER_PORTAL_ENABLED:'true',AHELIS_SELF_SIGNUP_ENABLED:enabled});
    const html=vaultLayout({config,locale,basePath:'/',title:'Vault',description:'Vault',content:'',assets:{css:'site.css',js:'site.js'}});
    assert.ok(html.includes('href="https://ahelislab.ch/login?language='+locale+'"'));
    assert.ok(html.includes(locale==='fr'?'>Se connecter</a>':'>Sign in</a>'));
    assert.ok(!html.includes('>Espace client</a>'));
  }
});
test('public signup stays closed by default and opens in both languages only after explicit activation',()=>{
  const closed=getConfig({});assert.equal(closed.selfSignupEnabled,false);
  assert.ok(businessPages(closed).every(page=>!page.content.includes('/api/auth/start')));
  const opened=businessPages(getConfig({AHELIS_SELF_SIGNUP_ENABLED:'true'}));
  for(const page of opened){assert.ok(page.content.includes('https://ahelislab.ch/login?language='+page.locale));assert.ok(page.content.includes(page.locale==='fr'?'60 jours sans carte':'60 days without a card'));assert.ok(!page.content.includes('arrange the conditions for a trial'));assert.ok(!page.content.includes('aucune inscription publique'));assert.ok(page.faqs.some(pair=>pair[1].includes(page.locale==='fr'?'L’essai de 60 jours':'The 60-day trial')));}
});
