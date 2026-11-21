import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from './layout.service';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/** The layout every signed-in screen uses: sidebar, top bar and the page itself. */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar],
  host: { class: 'flex min-h-dvh bg-canvas' },
  template: `
    <app-sidebar />
    @if (layout.isPhone() && layout.drawerOpen()) {
      <div
        class="fixed inset-0 z-30 bg-black/50"
        aria-hidden="true"
        (click)="layout.closeDrawer()"
      ></div>
    }
    <div class="flex min-w-0 flex-1 flex-col">
      <app-topbar />
      <main class="mx-auto w-full max-w-[1360px] p-2 sm:p-3">
        <router-outlet />
      </main>
    </div>
  `,
})
export class Shell {
  protected readonly layout = inject(LayoutService);
}
