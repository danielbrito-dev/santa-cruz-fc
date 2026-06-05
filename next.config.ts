import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: { '*': ['./legacy/**'] },
  outputFileTracingIncludes: {
    '/[locale]/admin/conteudo': ['./content/site.json'],
    '/[locale]': ['./content/site.json'],
  },
};

export default withNextIntl(nextConfig);
