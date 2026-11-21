import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Title block at the top of every screen, plus the placeholder shown until the screen is built. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <h1 class="text-[34px] leading-tight font-normal tracking-[0.25px]">{{ title() }}</h1>
    @if (description()) {
      <p class="mt-0.5 text-[15px] text-ink-soft">{{ description() }}</p>
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
