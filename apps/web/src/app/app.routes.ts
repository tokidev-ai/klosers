import { Routes } from '@angular/router';
import { Shell } from './layout/shell';

/**
 * Every sidebar section is its own lazy-loaded chunk. The `admin` group is hidden from the
 * sidebar for non-admins; the route guard that enforces it arrives with sign-in (Phase 1).
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () => import('./features/inicio').then((m) => m.Inicio),
      },
      {
        path: 'clientes',
        title: 'Clientes',
        loadComponent: () => import('./features/clientes').then((m) => m.Clientes),
      },
      {
        path: 'tablero',
        title: 'Tablero de ventas',
        loadComponent: () => import('./features/tablero').then((m) => m.Tablero),
      },
      {
        path: 'calendario',
        title: 'Calendario',
        loadComponent: () => import('./features/calendario').then((m) => m.Calendario),
      },
      {
        path: 'servicios',
        title: 'Servicios',
        loadComponent: () => import('./features/servicios').then((m) => m.Servicios),
      },
      {
        path: 'admin',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
          {
            path: 'usuarios',
            title: 'Usuarios y equipos',
            loadComponent: () => import('./features/admin/usuarios').then((m) => m.Usuarios),
          },
          {
            path: 'configuracion',
            title: 'Configuración',
            loadComponent: () =>
              import('./features/admin/configuracion').then((m) => m.Configuracion),
          },
        ],
      },
      {
        path: '**',
        title: 'Página no encontrada',
        loadComponent: () => import('./features/no-encontrada').then((m) => m.NoEncontrada),
      },
    ],
  },
];
