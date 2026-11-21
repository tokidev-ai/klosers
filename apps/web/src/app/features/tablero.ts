import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../shared/coming-soon';
import { PageHeader } from '../shared/page-header';

@Component({
  selector: 'app-tablero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header
        title="Tablero de ventas"
        description="Mueve cada cliente por las etapas de venta."
      />
      <app-coming-soon />
    </div>
  `,
})
export class Tablero {}
