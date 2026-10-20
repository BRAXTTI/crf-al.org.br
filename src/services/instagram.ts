import { requestJson } from './http';

export type MediaType = 'image' | 'video' | 'carousel';
export interface InstagramItem {
  link: string;
  image: string;
  caption?: string;
  date?: number;
  type?: MediaType;
}

export async function fetchInstagram(signal: AbortSignal, limit = 4): Promise<InstagramItem[]> {
  const data = await requestJson<{ items?: InstagramItem[] }>('/api/instagram', { signal });
  return Array.isArray(data.items) ? data.items.filter(item => item.link && item.image).slice(0, limit) : [];
}
