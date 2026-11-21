import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  beforeEach(() => localStorage.clear());

  it('starts in bolivianos', () => {
    expect(TestBed.inject(CurrencyService).currency()).toBe('Bs');
  });

  it('remembers the choice for the next visit', () => {
    TestBed.inject(CurrencyService).select('$us');
    TestBed.resetTestingModule();
    expect(TestBed.inject(CurrencyService).currency()).toBe('$us');
  });

  it('ignores a stored value it does not know', () => {
    localStorage.setItem('klosers.currency', 'EUR');
    expect(TestBed.inject(CurrencyService).currency()).toBe('Bs');
  });
});
