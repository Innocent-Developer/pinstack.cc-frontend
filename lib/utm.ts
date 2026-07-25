/**
 * UTM helpers so founders can see traffic that came from Pinstack
 * (badge embeds, Visit website clicks, etc.) in their analytics.
 */

export const UTM = {
  source: 'pinstack',
  /** Badge embed on an external site → Pinstack product page */
  badgeMedium: 'pinstack_badge',
  /** “Visit website” from a Pinstack product page → founder’s site */
  visitMedium: 'pinstack_listing',
} as const;

/** Append or overwrite UTM query params on any absolute/relative URL. */
export function withUtm(
  url: string,
  params: { source?: string; medium: string; campaign?: string; content?: string }
): string {
  try {
    const base =
      url.startsWith('http://') || url.startsWith('https://')
        ? undefined
        : typeof window !== 'undefined'
          ? window.location.origin
          : 'https://pinstack.cc';
    const u = new URL(url, base);
    u.searchParams.set('utm_source', params.source || UTM.source);
    u.searchParams.set('utm_medium', params.medium);
    if (params.campaign) u.searchParams.set('utm_campaign', params.campaign);
    if (params.content) u.searchParams.set('utm_content', params.content);
    // Prefer clean absolute string when input was absolute
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return u.toString();
    }
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    const join = url.includes('?') ? '&' : '?';
    const parts = [
      `utm_source=${encodeURIComponent(params.source || UTM.source)}`,
      `utm_medium=${encodeURIComponent(params.medium)}`,
    ];
    if (params.campaign) parts.push(`utm_campaign=${encodeURIComponent(params.campaign)}`);
    if (params.content) parts.push(`utm_content=${encodeURIComponent(params.content)}`);
    return `${url}${join}${parts.join('&')}`;
  }
}

/** Product page URL used inside embeddable badge HTML/Markdown. */
export function badgeProductUrl(origin: string, slug: string): string {
  return withUtm(`${origin.replace(/\/$/, '')}/product/${slug}`, {
    medium: UTM.badgeMedium,
    campaign: 'badge',
    content: slug,
  });
}

/** Outbound founder website URL from a Pinstack listing. */
export function visitWebsiteUrl(websiteUrl: string, slug?: string): string {
  return withUtm(websiteUrl, {
    medium: UTM.visitMedium,
    campaign: 'visit_website',
    content: slug,
  });
}
