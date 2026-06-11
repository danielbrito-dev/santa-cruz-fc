import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: { '*': ['./legacy/**'] },
  outputFileTracingIncludes: {
    '/[locale]/admin/conteudo': ['./content/site.json'],
    '/[locale]': ['./content/site.json'],
  },
  images: {
    // uploads do admin (Supabase Storage). Hosts fora daqui caem no <img> normal (PosImg).
    remotePatterns: [{ protocol: 'https' as const, hostname: 'hnbmfseltirzruidodve.supabase.co' }],
  },
};

export default withNextIntl(nextConfig);
