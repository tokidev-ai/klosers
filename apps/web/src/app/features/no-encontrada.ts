import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../shared/coming-soon';
import { PageHeader } from '../shared/page-header';

@Component({
  selector: 'app-no-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header
        title="Página no encontrada"
        description="La dirección no existe o ya no está disponible."
      />
      <app-coming-soon />
    </div>
  `,
})
export class NoEncontrada {}
