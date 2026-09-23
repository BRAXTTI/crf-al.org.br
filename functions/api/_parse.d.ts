export interface InstagramFeedItem {
  link: string;
  image: string;
}

export const DEFAULT_FEED_URL: string;
export function decodeEntities(value: string): string;
export function parseItems(html: string): InstagramFeedItem[];
export function getInstagramItems(feedUrl?: string): Promise<InstagramFeedItem[]>;
