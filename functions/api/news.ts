import { newsApi } from '../_news';
export const onRequest = (context: { request: Request; waitUntil: (promise: Promise<unknown>) => void }) => newsApi(context.request, context);
