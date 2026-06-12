import { environment } from '../../../environments/environment';

const BRAND_LOGOS: Record<string, string> = {
  netflix: 'brands/netflix.png',
  'youtube premium': 'assets/brands/youtube.svg',
  youtube: 'assets/brands/youtube.svg',
  spotify: 'brands/spotify.png',
  'disney+': 'assets/brands/disney.svg',
  disney: 'assets/brands/disney.svg',
  'canal+': 'assets/brands/canal.svg',
  canal: 'assets/brands/canal.svg',
};

export function resolveLogoUrl(
  logoUrl: string | null | undefined,
  providerName?: string
): string {
  if (logoUrl) {
    if (logoUrl.startsWith('http')) {
      return logoUrl;
    }
    if (logoUrl.startsWith('/')) {
      return `${environment.mediaUrl}${logoUrl}`;
    }
    return `${environment.mediaUrl}/media/${logoUrl}`;
  }

  if (providerName) {
    const key = providerName.toLowerCase().trim();
    if (BRAND_LOGOS[key]) {
      return BRAND_LOGOS[key];
    }
    for (const [brand, asset] of Object.entries(BRAND_LOGOS)) {
      if (key.includes(brand)) {
        return asset;
      }
    }
  }

  return 'assets/brands/default.svg';
}
