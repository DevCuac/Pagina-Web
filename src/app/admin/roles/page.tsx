'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SystemPermissions, PermissionId } from '@/lib/permissions';
import { useTranslation } from '@/components/I18nProvider';

export default function AdminRolesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    name: '', 
    color: '#4f7df9', 
    weight: 0, 
    isStaff: false, 
    isAdmin: false,
    isDefault: false,
    permissions: {} as Record<string, boolean>
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/roles').then(r => r.json()).then(setRoles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing } : form;

    await fetch('/api/admin/roles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    
    setForm({ name: '', color: '#4f7df9', weight: 0, isStaff: false, isAdmin: false, isDefault: false, permissions: {} });
    setEditing(null);
    setLoading(false);
    
    const updated = await fetch('/api/admin/roles').then(r => r.json());
    setRoles(updated);
  };

  const editRole = (role: any) => {
    let parsedPerms = {};
    try { parsedPerms = JSON.parse(role.permissions || '{}'); } catch(e) {}
    
    setForm({ 
      name: role.name, 
      color: role.color, 
      weight: role.weight, 
      isStaff: role.isStaff, 
      isAdmin: role.isAdmin,
      isDefault: role.isDefault,
      permissions: parsedPerms
    });
    setEditing(role.id);
  };

  const deleteRole = async (id: string) => {
    if (!confirm('¿Eliminar este rol?')) return;
    await fetch('/api/admin/roles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setRoles(roles.filter(r => r.id !== id));
  };

  const togglePermission = (permId: string) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permId]: !prev.permissions[permId]
      }
    }));
  };

  // Group permissions by category
  const permCategories = Object.values(SystemPermissions).reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof SystemPermissions[keyof typeof SystemPermissions][]>);

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_roles.title')}</h1>

      <div className="grid grid-2" style={{ alignItems: 'start', gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
            {editing ? t('admin_games.edit') : t('admin_roles.create')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('admin_roles.name')}</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">{t('admin_roles.color')}</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer' }} />
                  <input className="form-input" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin_roles.weight')}</label>
                <input type="number" className="form-input" value={form.weight} onChange={e => setForm({ ...form, weight: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)', border: '1px solid var(--border-muted)' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('admin_roles.legacy')}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Si asignas "Es Admin", todos los permisos granulares inferiores serán ignorados y se le otorgará acceso total a la plataforma.</p>
              
              <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.isStaff} onChange={e => setForm({ ...form, isStaff: e.target.checked })} />
                  {t('admin_roles.legacy_staff')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--accent-danger)', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.isAdmin} onChange={e => setForm({ ...form, isAdmin: e.target.checked })} />
                  {t('admin_roles.legacy_admin')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--accent-info)', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                  {t('admin_roles.is_default')}
                </label>
              </div>
            </div>

            {!form.isAdmin && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h4 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-muted)' }}>{t('admin_roles.granular')}</h4>
                
                {Object.entries(permCategories).map(([category, perms]) => (
                  <div key={category} style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{category}</h5>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {perms.map(p => (
                        <label key={p.id} style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          padding: '0.5rem', 
                          background: form.permissions[p.id] ? 'rgba(79, 125, 249, 0.1)' : 'transparent',
                          border: `1px solid ${form.permissions[p.id] ? 'var(--accent-primary)' : 'var(--border-muted)'}`,
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '0.85rem'
                        }}>
                          <input 
                            type="checkbox" 
                            checked={!!form.permissions[p.id]} 
                            onChange={() => togglePermission(p.id)} 
                            style={{ margin: 0 }}
                          />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editing ? t('admin_games.btn_update') : t('admin_roles.btn_register')}
              </button>
              {editing && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', color: '#4f7df9', weight: 0, isStaff: false, isAdmin: false, isDefault: false, permissions: {} }); }}>
                  {t('admin_games.btn_cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>{t('admin_roles.existing')}</h3>
          {roles.map((role: any) => (
            <div key={role.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: role.color }}>{role.name}</span>
                {role.isAdmin && <span className="badge badge-danger" style={{ fontSize: '0.5625rem' }}>ADMIN</span>}
                {role.isStaff && !role.isAdmin && <span className="badge badge-primary" style={{ fontSize: '0.5625rem' }}>STAFF</span>}
                {role.isDefault && <span className="badge badge-info" style={{ fontSize: '0.5625rem' }}>DEFAULT</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => editRole(role)}>✏️</button>
                {!role.isDefault && <button className="btn btn-ghost btn-sm" onClick={() => deleteRole(role.id)}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
