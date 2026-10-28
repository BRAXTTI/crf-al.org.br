import { newsApi } from '../_news';
import type { NewsEnv } from '../_news';
import { cachedNewsResponse, newsResponseKey } from '../_news-response-cache';
export const onRequest = (context: { request: Request; env?: NewsEnv; waitUntil: (promise: Promise<unknown>) => void }) => {
  if (context.request.method !== 'GET') return newsApi(context.request, context);
  const scope = `${context.env?.WP_SITE_URL || ''}|${context.env?.NEWS_ARCHIVE_API_URL || ''}`;
  return cachedNewsResponse(context, newsResponseKey(context.request, scope), () => newsApi(context.request, context));
};
