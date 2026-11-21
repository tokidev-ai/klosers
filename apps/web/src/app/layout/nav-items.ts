import type { IconName } from '../shared/icon';

export interface NavItem {
  label: string;
  /** Route path, relative to the app root. */
  path: string;
  icon: IconName;
}

export const MAIN_NAV: readonly NavItem[] = [
  { label: 'Inicio', path: '/inicio', icon: 'dashboard' },
  { label: 'Clientes', path: '/clientes', icon: 'people' },
  { label: 'Tablero de ventas', path: '/tablero', icon: 'board' },
  { label: 'Calendario', path: '/calendario', icon: 'calendar' },
  { label: 'Servicios', path: '/servicios', icon: 'category' },
];

/** Shown to admins only, under the "Administración" heading. */
export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Usuarios y equipos', path: '/admin/usuarios', icon: 'person' },
  { label: 'Configuración', path: '/admin/configuracion', icon: 'shield' },
];
