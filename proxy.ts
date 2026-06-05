import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './lib/i18n/routing';

// Next.js 16 renamed `middleware.ts` → `proxy.ts`. Running here on the Node.js
// runtime (the proxy default) instead of Edge avoids the Turbopack edge bundle's
// `__dirname is not defined` ReferenceError that 500'd every route on Vercel.
const handle = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return handle(request);
}

export const proxyConfig = {
  matcher: ['/((?!api|_next|_vercel|images|patrocinadores|.*\\..*).*)'],
};
