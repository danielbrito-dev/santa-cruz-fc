import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');
  return <main>{t('news')}</main>;
}
