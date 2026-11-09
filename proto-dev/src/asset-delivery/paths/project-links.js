import endpoints from './project-endpoints.json' with { type: 'json' };

const site = new URL(endpoints.site);
if (!['https:', 'http:'].includes(site.protocol)) throw new Error('Invalid site endpoint');
const siteBaseUrl = site.href.replace(/\/$/, '');

/** Localized text and hrefs resolve the same declared public site. */
export function resolveProjectLinks(value) {
  return typeof value === 'string'
    ? value.replaceAll('{{INTERDEAD_SITE_URL}}', siteBaseUrl)
    : value;
}
