// Export the canonical website chrome for the account service's legal documents.
// Usage: node scripts/export-legal-theme.mjs <account-web/public/legal directory>.
// Re-run after website theme changes; only the three generated theme assets are replaced.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { header, footer } from '../src/components/shared.mjs';
import { localizeMarkup, clientMessages } from '../src/i18n/index.mjs';
import { getConfig } from '../src/config.mjs';
import { sharedBrandStyles } from '../src/components/brand-styles.mjs';

const destination = process.argv[2];
if (!destination) throw new Error('Pass the legal theme output directory.');
const root = fileURLToPath(new URL('../', import.meta.url));
const config = getConfig({ SITE_URL: 'https://ahelislab.ch' });
const absoluteLinks = html => html.replace(/href="\/(?!\/)([^"]*)"/g, 'href="https://ahelislab.ch/$1"');
const chrome = Object.fromEntries(['fr', 'en'].map(locale => [locale, {
  header: absoluteLinks(localizeMarkup(header('/privacy/', locale)
    .replace(/<span class="language-switcher[^\"]*"[\s\S]*?<\/span>/, '<!--terms-languages-->'), locale)),
  footer: absoluteLinks(localizeMarkup(footer({ config, locale, product: true }), locale)),
  messages: clientMessages(locale),
}]));
await mkdir(resolve(destination), { recursive: true });
await writeFile(resolve(destination, 'chrome.json'), JSON.stringify(chrome, null, 2) + '\n');
await writeFile(resolve(destination, 'agency.css'), '/* Generated from the Ahelis Lab website theme. */\n' +
  ((await readFile(resolve(root, 'src/styles/main.css'), 'utf8')) + '\n' + await sharedBrandStyles()).replaceAll("url('/fonts/", "url('/account/assets/"));
await writeFile(resolve(destination, 'agency.js'), '// Generated from the Ahelis Lab website navigation and interactions.\n' + await readFile(resolve(root, 'src/scripts/site.js'), 'utf8'));
console.log('Exported the shared legal theme in French and English.');
