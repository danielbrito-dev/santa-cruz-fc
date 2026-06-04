import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

// NOTE: when a future phase wires the client provider, the httpBatchLink MUST set
// `transformer: superjson` to match the server transformer — otherwise Date/undefined
// round-trips silently break. No client calls exist yet (server uses getServerApi()).
export const trpc = createTRPCReact<AppRouter>();
