import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoon } from '../../shared/coming-soon';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-configuracion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  template: `
    <div class="flex flex-col gap-3">
      <app-page-header
        title="Configuración"
        description="Etapas de venta, moneda, tipo de cambio y reglas de reserva."
      />
      <app-coming-soon />
    </div>
  `,
})
export class Configuracion {}
