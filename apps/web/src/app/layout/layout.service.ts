import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { readStored, writeStored } from '../core/storage';

/** Tailwind's `md` (768px) and `lg` (1024px), as max-width queries. */
const PHONE = '(max-width: 767.98px)';
const BELOW_DESKTOP = '(max-width: 1023.98px)';
const COLLAPSED_KEY = 'klosers.sidebarCollapsed';

/**
 * State of the sidebar.
 *
 * Desktop: a 240px sidebar that collapses to a 64px icon rail. Tablet: the same, collapsed by
 * default. Phone: the sidebar is a drawer that slides over the page.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpoints = inject(BreakpointObserver);

  readonly isPhone = toSignal(this.breakpoints.observe(PHONE).pipe(map((state) => state.matches)), {
    initialValue: this.breakpoints.isMatched(PHONE),
  });

  private readonly collapsedPreference = signal(this.restoreCollapsed());

  readonly drawerOpen = signal(false);

  /** The icon rail: only on tablet and desktop, and only when collapsed. */
  readonly rail = computed(() => !this.isPhone() && this.collapsedPreference());

  /** Whether the toggle button should read as "open the menu". */
  readonly menuOpen = computed(() => (this.isPhone() ? this.drawerOpen() : !this.rail()));

  toggleMenu(): void {
    if (this.isPhone()) {
      this.drawerOpen.update((open) => !open);
      return;
    }
    const collapsed = !this.collapsedPreference();
    this.collapsedPreference.set(collapsed);
    writeStored(COLLAPSED_KEY, String(collapsed));
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  private restoreCollapsed(): boolean {
    const stored = readStored(COLLAPSED_KEY);
    return stored === null ? this.breakpoints.isMatched(BELOW_DESKTOP) : stored === 'true';
  }
}
