'use client';

import { useRouter } from 'next/navigation';

export default function UserActions({ userId, currentRoleId, roles }: { userId: string; currentRoleId: string; roles: any[] }) {
  const router = useRouter();

  const changeRole = async (roleId: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roleId }),
    });
    router.refresh();
  };

  const deleteUser = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esta acción es irreversible y eliminará todos sus foros y tickets asociados.')) return;
    
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <select
        className="form-select"
        value={currentRoleId}
        onChange={(e) => changeRole(e.target.value)}
        style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem', minWidth: '120px' }}
      >
        {roles.map((role: any) => (
          <option key={role.id} value={role.id}>{role.name}</option>
        ))}
      </select>
      
      <button 
        onClick={deleteUser} 
        className="btn btn-danger btn-sm" 
        style={{ padding: '0.375rem 0.625rem' }}
        title="Eliminar Usuario"
      >
        🗑️
      </button>
    </div>
  );
}
