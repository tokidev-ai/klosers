import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="rounded-md border border-dashed border-divider bg-surface p-4 text-center text-sm text-ink-soft"
    >
      Esta sección se está construyendo y estará disponible pronto.
    </div>
  `,
})
export class ComingSoon {}
