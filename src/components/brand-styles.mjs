import { readFile } from 'node:fs/promises';

export async function sharedBrandStyles() {
  return (await Promise.all(['language-switcher', 'footer'].map(name => readFile(new URL(import.meta.resolve(`@ahelis/brand/styles/${name}.css`)), 'utf8')))).join('\n');
}
