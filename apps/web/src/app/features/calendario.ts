import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../shared/coming-soon';
import { PageHeader } from '../shared/page-header';

@Component({
  selector: 'app-calendario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header title="Calendario" description="Llamadas agendadas y tu disponibilidad." />
      <app-coming-soon />
    </div>
  `,
})
export class Calendario {}
