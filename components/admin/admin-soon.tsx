import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

/**
 * Tela-esqueleto de módulo do admin (estrutura pronta; lógica entra na etapa de infra).
 * Reutilizada por Páginas, Elenco, Patrocinadores, Galeria, Documentos e Histórias.
 */
export async function AdminSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const t = await getTranslations('admin');
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-sub">{description}</p>
      </div>
      <div className="admin-placeholder">
        <span className="admin-placeholder-icon" aria-hidden="true">
          {icon}
        </span>
        <p>{t('soonGeneric')}</p>
        <span className="admin-badge admin-badge--soon">{t('comingSoon')}</span>
      </div>
    </div>
  );
}
