import { refreshNewsIndex, warmNewsPosts } from '../../functions/_news';
import type { NewsEnv } from '../../functions/_news';

export default {
  async scheduled(_controller: ScheduledController, env: NewsEnv, ctx: ExecutionContext) {
    const context = { env, waitUntil: (promise: Promise<unknown>) => ctx.waitUntil(promise) };
    // Await permite que falhas apareçam no histórico dos Cron Triggers.
    const index = await refreshNewsIndex(context);
    // Sem índice novo (lease ativo), usa o último índice gravado no KV.
    await warmNewsPosts(context, index);
  },
} satisfies ExportedHandler<NewsEnv>;
