import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

// Server Components read content directly via this caller (no HTTP round-trip).
export async function getServerApi() {
  return appRouter.createCaller(await createContext());
}
