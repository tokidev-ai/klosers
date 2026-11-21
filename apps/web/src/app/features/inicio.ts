import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../shared/coming-soon';
import { PageHeader } from '../shared/page-header';

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header
        title="Inicio"
        description="Tus números, seguimientos pendientes y llamadas de hoy."
      />
      <app-coming-soon />
    </div>
  `,
})
export class Inicio {}
