export function getConfig(env = process.env) {
  const siteUrl = env.SITE_URL?.trim().replace(/\/$/, '') || '';
  const email = env.CONTACT_EMAIL?.trim() ?? 'hello@ahelislab.ch';
  const indexable = env.SITE_INDEXABLE === 'true';
  if (siteUrl) {
    const origin = new URL(siteUrl);
    if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
      throw new Error('SITE_URL must be an HTTP(S) origin without a path, query, fragment or credentials.');
    }
  }
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error('CONTACT_EMAIL must be a valid email address.');
  if (indexable && (!siteUrl || !email)) throw new Error('Indexable builds require a validated SITE_URL and CONTACT_EMAIL.');
  const vaultUrl = (env.VAULT_SITE_URL || 'https://vault.ahelislab.ch').replace(/\/$/, '');
  const businessUrl = (env.BUSINESS_SITE_URL || 'https://business.ahelislab.ch').replace(/\/$/, '');
  const agencyUrl = (env.AGENCY_SITE_URL || 'https://ahelislab.ch').replace(/\/$/, '');
  for (const value of [vaultUrl, businessUrl, agencyUrl]) {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value) throw new Error('Product links require an HTTP(S) origin.');
  }
  return { siteUrl, email, indexable, vaultUrl, businessUrl, agencyUrl, name: 'Ahelis Lab', customerPortalEnabled: env.VAULT_CUSTOMER_PORTAL_ENABLED === 'true' };
}
