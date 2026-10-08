export function getConfig() {
  const siteUrl = process.env.SITE_URL?.trim().replace(/\/$/, '') || '';
  const email = process.env.CONTACT_EMAIL?.trim() || '';
  const indexable = process.env.SITE_INDEXABLE === 'true';
  if (siteUrl) {
    const origin = new URL(siteUrl);
    if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
      throw new Error('SITE_URL must be an HTTP(S) origin without a path, query, fragment or credentials.');
    }
  }
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error('CONTACT_EMAIL must be a valid email address.');
  if (indexable && (!siteUrl || !email)) throw new Error('Indexable builds require a validated SITE_URL and CONTACT_EMAIL.');
  return { siteUrl, email, indexable, name: 'Ahelis Lab' };
}
