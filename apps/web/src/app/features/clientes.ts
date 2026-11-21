import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../shared/coming-soon';
import { PageHeader } from '../shared/page-header';

@Component({
  selector: 'app-clientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header
        title="Clientes"
        description="Todos tus clientes y prospectos en un solo lugar."
      />
      <app-coming-soon />
    </div>
  `,
})
export class Clientes {}
