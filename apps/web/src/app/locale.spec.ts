import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';
import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';

describe('es-BO locale', () => {
  beforeEach(() => {
    registerLocaleData(localeEsBo, 'es-BO');
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'es-BO' }] });
  });

  it('formats numbers with a dot for thousands and a comma for decimals', () => {
    const pipe = TestBed.runInInjectionContext(() => new DecimalPipe('es-BO'));
    expect(pipe.transform(1250.5, '1.2-2')).toBe('1.250,50');
  });

  it('formats dates in Spanish', () => {
    const pipe = TestBed.runInInjectionContext(() => new DatePipe('es-BO'));
    expect(pipe.transform(new Date(2026, 10, 21), "d 'de' MMMM 'de' y")).toBe(
      '21 de noviembre de 2026',
    );
  });
});
