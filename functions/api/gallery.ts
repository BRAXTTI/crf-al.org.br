import { contentApi, type ContentEnv } from '../_content';
export const onRequest: PagesFunction<ContentEnv> = context => contentApi(context.request, context);
