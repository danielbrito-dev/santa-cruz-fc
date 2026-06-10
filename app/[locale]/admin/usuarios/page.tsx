import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getSessionUser, listUsers } from '@/server/auth/users';
import { UsuariosAdmin } from '@/components/admin/usuarios-admin';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const me = await getSessionUser();

  if (!me || me.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-page-head">
          <h1 className="admin-page-title">{t('users')}</h1>
          <p className="admin-page-sub">{t('usersNoPermission')}</p>
        </div>
      </div>
    );
  }

  const users = await listUsers();
  return <UsuariosAdmin users={users} currentUserId={me.id} />;
}
