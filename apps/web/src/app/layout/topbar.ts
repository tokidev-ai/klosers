import {
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyService } from '../core/currency.service';
import { ROLE_LABELS, SessionService } from '../core/session.service';
import { Icon } from '../shared/icon';
import { LayoutService } from './layout.service';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkMenu, CdkMenuGroup, CdkMenuItem, CdkMenuItemRadio, CdkMenuTrigger, Icon],
  host: {
    class:
      'sticky top-0 z-20 flex min-h-8 flex-wrap items-center gap-1 border-b border-divider bg-surface px-1 py-1 sm:gap-2 sm:px-3',
  },
  templateUrl: './topbar.html',
})
export class Topbar {
  protected readonly layout = inject(LayoutService);
  protected readonly session = inject(SessionService);
  protected readonly currencies = inject(CurrencyService);

  /** Menus that open from the right edge line up with the button's right side. */
  protected readonly endPosition = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
  ] as const;

  protected roleLabel(): string {
    const role = this.session.role();
    return role ? ROLE_LABELS[role] : '';
  }
}
