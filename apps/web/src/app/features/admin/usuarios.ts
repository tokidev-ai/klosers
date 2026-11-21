import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../../shared/coming-soon';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header
        title="Usuarios y equipos"
        description="Invita personas, arma equipos y asigna sus servicios."
      />
      <app-coming-soon />
    </div>
  `,
})
export class Usuarios {}
