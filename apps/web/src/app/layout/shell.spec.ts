import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Role } from '@klosers/shared';
import { routes } from '../app.routes';
import { SessionService } from '../core/session.service';

function fakeSession(role: Role | null) {
  const teams = signal([{ id: 't1', name: 'Corporativo' }]);
  return {
    role: signal(role),
    isAdmin: signal(role === 'admin'),
    displayName: signal('Sofía Rojas'),
    email: signal('sofia.rojas@klosers.test'),
    initials: signal('SR'),
    teams,
    canSwitchTeam: signal(role === 'admin'),
    activeTeamId: signal<string | null>(role === 'admin' ? null : 't1'),
    activeTeamName: signal(role === 'admin' ? 'Todos los equipos' : 'Corporativo'),
    selectTeam: vi.fn(),
    signOut: vi.fn(),
  };
}

async function render(role: Role | null, url = '/inicio') {
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), { provide: SessionService, useValue: fakeSession(role) }],
  });
  const harness = await RouterTestingHarness.create(url);
  const root = harness.routeNativeElement!.closest('app-shell') ?? document.body;
  return { harness, root: root as HTMLElement };
}

const text = (el: Element) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '';

describe('App shell', () => {
  it('lists the five sections for a member and hides the admin group', async () => {
    const { root } = await render('member');
    const links = Array.from(root.querySelectorAll('nav a')).map(text);
    expect(links).toEqual(['Inicio', 'Clientes', 'Tablero de ventas', 'Calendario', 'Servicios']);
    expect(root.textContent).not.toContain('Administración');
  });

  it('adds the admin group for admins', async () => {
    const { root } = await render('admin');
    const links = Array.from(root.querySelectorAll('nav a')).map(text);
    expect(links).toEqual([
      'Inicio',
      'Clientes',
      'Tablero de ventas',
      'Calendario',
      'Servicios',
      'Usuarios y equipos',
      'Configuración',
    ]);
    expect(root.querySelector('#admin-heading')?.textContent).toContain('Administración');
  });

  it('marks the current section for assistive technology', async () => {
    const { root } = await render('member', '/clientes');
    const current = root.querySelector('nav a[aria-current="page"]');
    expect(current && text(current)).toBe('Clientes');
  });

  it('shows the top bar controls: search, currency switch, notifications and account menu', async () => {
    const { root } = await render('member');
    expect(root.querySelector('input[type="search"]')).toBeTruthy();
    expect(root.querySelector('[aria-label="Moneda"]')).toBeTruthy();
    expect(root.querySelector('button[aria-label="Notificaciones"]')).toBeTruthy();
    expect(root.querySelector('button[aria-label="Menú de cuenta"]')?.textContent).toContain('SR');
  });

  it('shows the team as a chip for a member and a picker for an admin', async () => {
    const member = await render('member');
    expect(member.root.querySelector('button[aria-label="Cambiar de equipo"]')).toBeNull();
    expect(member.root.querySelector('app-topbar')?.textContent).toContain('Equipo Corporativo');
    TestBed.resetTestingModule();

    const admin = await render('admin');
    const picker = admin.root.querySelector('button[aria-label="Cambiar de equipo"]');
    expect(picker && text(picker)).toContain('Todos los equipos');
  });

  it('collapses the sidebar from 240px to a 64px rail and back', async () => {
    const { harness, root } = await render('member');
    const sidebar = root.querySelector('app-sidebar') as HTMLElement;
    const toggle = root.querySelector('app-topbar button') as HTMLButtonElement;
    expect(sidebar.className).toContain('w-30');

    toggle.click();
    harness.detectChanges();
    expect(sidebar.className).toContain('w-8');
    expect(sidebar.className).not.toContain('w-30');
    expect(sidebar.querySelector('nav a')?.getAttribute('aria-label')).toBe('Inicio');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    harness.detectChanges();
    expect(sidebar.className).toContain('w-30');
  });

  it('switches the currency between Bs and $us', async () => {
    const { harness, root } = await render('member');
    const [bs, usd] = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[aria-label="Moneda"] button'),
    );
    expect(bs.getAttribute('aria-pressed')).toBe('true');

    usd.click();
    harness.detectChanges();
    expect(usd.getAttribute('aria-pressed')).toBe('true');
    expect(bs.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('Routes', () => {
  const shellRoutes = routes[0].children ?? [];
  const sections = ['inicio', 'clientes', 'tablero', 'calendario', 'servicios'];

  it.each(sections)('lazy-loads %s', (path) => {
    const route = shellRoutes.find((r) => r.path === path);
    expect(route?.loadComponent).toBeTypeOf('function');
    expect(route?.component).toBeUndefined();
  });

  it.each(['usuarios', 'configuracion'])('lazy-loads admin/%s', (path) => {
    const admin = shellRoutes.find((r) => r.path === 'admin');
    const route = admin?.children?.find((r) => r.path === path);
    expect(route?.loadComponent).toBeTypeOf('function');
  });

  it('opens each section with its own title', async () => {
    const { root } = await render('admin', '/tablero');
    expect(root.querySelector('h1')?.textContent).toBe('Tablero de ventas');
  });

  it('sends the empty address to Inicio', async () => {
    const { harness } = await render('member', '/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Inicio');
  });

  it('shows a not-found page for unknown addresses', async () => {
    const { root } = await render('member', '/no-existe');
    expect(root.querySelector('h1')?.textContent).toBe('Página no encontrada');
  });
});
