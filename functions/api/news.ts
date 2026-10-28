import { newsApi, newsDeadline } from '../_news';
import type { NewsEnv } from '../_news';
import { cachedNewsResponse, newsResponseKey } from '../_news-response-cache';
export const onRequest = async (context: { request: Request; env?: NewsEnv; waitUntil: (promise: Promise<unknown>) => void; next: (request: Request) => Promise<Response> }) => {
  const timings = { cache: 0, kv: 0, asset: 0, rewriter: 0, origin: 0 };
  const timed = Object.assign(context, { timings });
  if (context.request.method !== 'GET') return newsApi(context.request, timed);
  const scope = `${context.env?.WP_SITE_URL || ''}|${context.env?.NEWS_ARCHIVE_API_URL || ''}`;
  const response = await newsDeadline(cachedNewsResponse(timed, newsResponseKey(context.request, scope), () => newsApi(context.request, timed)), timed);
  const result = new Response(response.body, response);
  result.headers.set('Server-Timing', Object.entries(timings).map(([name, value]) => `${name};dur=${value.toFixed(1)}`).join(', '));
  return result;
};
