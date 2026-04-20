import Link from 'next/link';
import prisma from '@/lib/db';
import UserActions from './UserActions';
import { getLocaleObj, getTranslation } from '@/lib/i18n';

export default async function AdminUsersPage() {
  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { role: true },
    take: 50,
  });

  const roles = await prisma.role.findMany({ orderBy: { weight: 'desc' } });

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_users.title')}</h1>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('admin_users.col_user')}</th>
              <th>{t('admin_users.col_email')}</th>
              <th>{t('admin_users.col_role')}</th>
              <th>{t('admin_users.col_mc')}</th>
              <th>{t('admin_users.col_reg')}</th>
              <th>{t('admin_users.col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-overlay)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: user.role.color, overflow: 'hidden',
                    }}>
                      {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username[0]}
                    </div>
                    <Link href={`/members/${user.id}`} style={{ color: user.role.color, fontWeight: 500 }}>
                      {user.username}
                    </Link>
                  </div>
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</td>
                <td>
                  <span className="badge badge-role" style={{ background: user.role.color + '22', color: user.role.color }}>
                    {user.role.name}
                  </span>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{user.minecraftName || '—'}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <UserActions userId={user.id} currentRoleId={user.roleId} roles={roles} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
