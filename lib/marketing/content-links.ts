// Shared shape for the Marketing/Content curated link list.
//
// Persisted as a JSON blob in `AppSettings` under key `marketing-settings`
// via the /api/settings/marketing route.
//
// The legacy `onedriveUrl` (iframe embed URL) is kept for backward
// compatibility — the client migrates it into contentLinks on load so
// admins don't lose anything.

export type ContentCategory =
  | 'Sales Deck'
  | 'One-Pager'
  | 'Battlecard'
  | 'Case Study'
  | 'Video'
  | 'Technical Doc'
  | 'Brochure'
  | 'Other';

export const CONTENT_CATEGORY_OPTIONS: ContentCategory[] = [
  'Sales Deck',
  'One-Pager',
  'Battlecard',
  'Case Study',
  'Video',
  'Technical Doc',
  'Brochure',
  'Other',
];

export type ContentLink = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: ContentCategory | '';
  addedAt: string; // ISO
};

export type MarketingSettings = {
  /** Curated list of OneDrive / SharePoint / anywhere links. */
  contentLinks?: ContentLink[];
  /** @deprecated Previous single-iframe embed URL. Auto-migrated on load. */
  onedriveUrl?: string;
};

export function makeContentLink(partial: Partial<ContentLink> = {}): ContentLink {
  return {
    id: crypto.randomUUID(),
    title: '',
    url: '',
    description: '',
    category: '',
    addedAt: new Date().toISOString(),
    ...partial,
  };
}

/**
 * Derive the effective links array from a MarketingSettings blob.
 * If `contentLinks` is empty but a legacy `onedriveUrl` exists, synthesize
 * a single entry so the legacy config still shows up in the new UI.
 */
export function effectiveContentLinks(
  settings: MarketingSettings | null | undefined
): ContentLink[] {
  const list = settings?.contentLinks ?? [];
  if (list.length > 0) return list;
  if (settings?.onedriveUrl) {
    return [
      {
        id: 'legacy-onedrive',
        title: 'OneDrive Content Folder',
        url: settings.onedriveUrl,
        description: 'Imported from the previous OneDrive embed setting.',
        category: '',
        addedAt: '',
      },
    ];
  }
  return [];
}
