import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

// runtime: 'nodejs' keeps the middleware OFF the Edge runtime. The Turbopack
// edge bundle references __dirname (undefined on Edge) and 500'd every route on
// Vercel; on the Node runtime __dirname exists, so routing works in production.
export const config = {
  matcher: ['/((?!api|_next|_vercel|images|patrocinadores|.*\\..*).*)'],
  runtime: 'nodejs',
};
