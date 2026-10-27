import { refreshNewsIndex } from '../../functions/_news';
import type { NewsEnv } from '../../functions/_news';

export default {
  async scheduled(_controller: ScheduledController, env: NewsEnv, ctx: ExecutionContext) {
    // Await permite que falhas apareçam no histórico dos Cron Triggers.
    await refreshNewsIndex({ env, waitUntil: promise => ctx.waitUntil(promise) });
  },
} satisfies ExportedHandler<NewsEnv>;
