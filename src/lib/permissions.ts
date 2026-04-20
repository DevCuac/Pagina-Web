import { User } from 'next-auth';

// Define the available system permissions
export const SystemPermissions = {
  // Admin & Core
  'admin.access': { id: 'admin.access', name: 'Acceso Administración', category: 'Administración' },
  'admin.roles.manage': { id: 'admin.roles.manage', name: 'Gestonar Roles y Permisos', category: 'Administración' },
  'admin.servers.manage': { id: 'admin.servers.manage', name: 'Gestonar Servidores', category: 'Administración' },
  'admin.games.manage': { id: 'admin.games.manage', name: 'Gestonar Modos de Juego', category: 'Administración' },
  
  // Content Modules
  'wiki.manage': { id: 'wiki.manage', name: 'Gestonar Wiki (GitBook)', category: 'Contenido' },
  'wiki.edit': { id: 'wiki.edit', name: 'Editar Entradas de Wiki', category: 'Contenido' },
  
  // Support
  'tickets.staff': { id: 'tickets.staff', name: 'Contestar e interactuar como Staff en Tickets', category: 'Soporte' },
  'tickets.manage': { id: 'tickets.manage', name: 'Gestonar Categorías de Tickets', category: 'Soporte' },
  
  // Forums
  'forums.manage': { id: 'forums.manage', name: 'Gestionar Foros y Categorías', category: 'Foros' },
  'forums.moderate': { id: 'forums.moderate', name: 'Moderar Posts de Usuarios', category: 'Foros' },
};

export type PermissionId = keyof typeof SystemPermissions;

/**
 * Parses user role permissions and checks if the user holds a specific permission.
 * By default, if the Role has isAdmin = true, they pass automatically for everything.
 */
export function hasPermission(user: User | undefined | null, permission: PermissionId): boolean {
  if (!user || !user.role) return false;
  
  // System administrators theoretically bypass granular scopes
  if (user.isAdmin) return true;

  try {
    const rawPerms = (user as any).rolePermissions || '{}';
    const parsed = typeof rawPerms === 'string' ? JSON.parse(rawPerms) : rawPerms;
    return !!parsed[permission];
  } catch (err) {
    return false;
  }
}
