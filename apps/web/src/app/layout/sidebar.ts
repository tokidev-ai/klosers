import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SessionService } from '../core/session.service';
import { Icon } from '../shared/icon';
import { LayoutService } from './layout.service';
import { ADMIN_NAV, MAIN_NAV } from './nav-items';

const LINK =
  'flex min-h-[44px] items-center gap-2 rounded-md text-sm text-ink no-underline hover:bg-black/4';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  host: {
    id: 'menu-lateral',
    '[class]': 'hostClass()',
    '[attr.inert]': 'hidden() ? "" : null',
    '(keydown.escape)': 'layout.closeDrawer()',
  },
  template: `
    <div
      class="flex h-8 shrink-0 items-center gap-1.5 border-b border-divider"
      [class.px-2.5]="!layout.rail()"
      [class.justify-center]="layout.rail()"
    >
      <div
        class="flex size-4 shrink-0 items-center justify-center rounded-md bg-primary text-lg font-bold text-white"
        aria-hidden="true"
      >
        K
      </div>
      @if (!layout.rail()) {
        <span class="text-xl font-medium">Klosers</span>
      }
    </div>

    <nav aria-label="Principal" class="flex flex-1 flex-col gap-0.25 overflow-y-auto p-1">
      @for (item of main; track item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="bg-primary/8 font-medium text-primary-dark"
          #link="routerLinkActive"
          ariaCurrentWhenActive="page"
          [class]="linkClass()"
          [attr.title]="layout.rail() ? item.label : null"
          [attr.aria-label]="layout.rail() ? item.label : null"
        >
          <app-icon [name]="item.icon" [class.text-black/54]="!link.isActive" />
          @if (!layout.rail()) {
            <span class="truncate">{{ item.label }}</span>
          }
        </a>
      }

      @if (session.isAdmin()) {
        @if (layout.rail()) {
          <hr class="mx-1 my-1 border-divider" />
        } @else {
          <h2
            class="px-2 pt-2.5 pb-1 text-xs font-medium tracking-[1px] text-ink-soft uppercase"
            id="admin-heading"
          >
            Administración
          </h2>
        }
        @for (item of admin; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary/8 font-medium text-primary-dark"
            #link="routerLinkActive"
            ariaCurrentWhenActive="page"
            [class]="linkClass()"
            [attr.title]="layout.rail() ? item.label : null"
            [attr.aria-label]="layout.rail() ? item.label : null"
          >
            <app-icon [name]="item.icon" [class.text-black/54]="!link.isActive" />
            @if (!layout.rail()) {
              <span class="truncate">{{ item.label }}</span>
            }
          </a>
        }
      }
    </nav>
  `,
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);
  protected readonly session = inject(SessionService);
  protected readonly main = MAIN_NAV;
  protected readonly admin = ADMIN_NAV;

  /** Off-screen on a phone while the drawer is closed, so keyboard focus skips it. */
  protected readonly hidden = computed(() => this.layout.isPhone() && !this.layout.drawerOpen());

  protected readonly hostClass = computed(() => {
    const base = 'flex flex-col border-r border-divider bg-surface';
    if (this.layout.isPhone()) {
      const slide = this.layout.drawerOpen()
        ? 'translate-x-0 shadow-drawer'
        : '-translate-x-full invisible';
      return `${base} fixed inset-y-0 left-0 z-40 w-30 transition-transform duration-200 motion-reduce:transition-none ${slide}`;
    }
    const width = this.layout.rail() ? 'w-8' : 'w-30';
    return `${base} sticky top-0 h-dvh shrink-0 transition-[width] duration-200 motion-reduce:transition-none ${width}`;
  });

  protected readonly linkClass = computed(() =>
    this.layout.rail() ? `${LINK} justify-center` : `${LINK} px-2`,
  );

  constructor() {
    // A tap on a link closes the phone drawer.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.layout.closeDrawer());
  }
}
