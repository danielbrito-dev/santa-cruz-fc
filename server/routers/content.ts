import { router, publicProcedure } from '../trpc';

export const contentRouter = router({
  site: publicProcedure.query(({ ctx }) => ctx.content.getSiteContent()),
});
