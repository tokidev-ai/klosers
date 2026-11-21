import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../shared/coming-soon';
import { PageHeader } from '../shared/page-header';

@Component({
  selector: 'app-servicios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header title="Servicios" description="Lo que vende cada equipo, con sus precios." />
      <app-coming-soon />
    </div>
  `,
})
export class Servicios {}
