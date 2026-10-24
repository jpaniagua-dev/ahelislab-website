import { readFile } from 'node:fs/promises';

export async function sharedBrandStyles() {
  const sheets = await Promise.all(['language-switcher', 'footer', 'logos', 'site-footer', 'text-link'].map(async name => {
    const source = new URL(import.meta.resolve(`@ahelis/brand/styles/${name}.css`));
    let css = await readFile(source, 'utf8');
    // Bundle packaged logo images so the same stylesheet works in sites and legal exports.
    for (const match of css.matchAll(/url\('([^']+)'\)/g)) {
      const image = new URL(match[1], source);
      const type = image.pathname.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      const data = (await readFile(image)).toString('base64');
      css = css.replaceAll(match[0], `url('data:${type};base64,${data}')`);
    }
    return css;
  }));
  return sheets.join('\n');
}
