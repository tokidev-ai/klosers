import type { Currency } from './common';

/** Path: `services/{serviceId}` */
export interface Service {
  name: string;
  description: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: Currency;
  category: string;
  active: boolean;
  /** Every service belongs to exactly one team. */
  teamId: string;
  materialUrls: string[];
}
