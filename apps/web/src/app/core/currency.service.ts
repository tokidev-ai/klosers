import { Injectable, signal } from '@angular/core';
import type { Currency } from '@klosers/shared';
import { readStored, writeStored } from './storage';

export interface CurrencyOption {
  value: Currency;
  label: string;
  /** Full name, for the tooltip and screen readers. */
  name: string;
}

const STORAGE_KEY = 'klosers.currency';

/** The Bs / $us switch in the top bar. Screens with amounts read `currency()` to choose what to show. */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly options: readonly CurrencyOption[] = [
    { value: 'Bs', label: 'Bs', name: 'Bolivianos' },
    { value: '$us', label: '$us', name: 'Dólares' },
  ];

  private readonly selected = signal<Currency>(this.restore());
  readonly currency = this.selected.asReadonly();

  select(currency: Currency): void {
    this.selected.set(currency);
    writeStored(STORAGE_KEY, currency);
  }

  private restore(): Currency {
    const stored = readStored(STORAGE_KEY);
    return stored === '$us' ? '$us' : 'Bs';
  }
}
