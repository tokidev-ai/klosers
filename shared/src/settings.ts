import type { Currency } from './common';

/** Path: `settings/app` */
export interface AppSettings {
  companyName: string;
  /** Default currency for new amounts. */
  currency: Currency;
  /** Bolivianos per US dollar. Default 6.96. */
  exchangeRate: number;
  /** IANA time zone, for example `America/La_Paz`. */
  timezone: string;
  pipelineStages: PipelineStage[];
  lossReasons: string[];
  bookingRules: BookingRules;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  /** Won and Lost always stay last. */
  kind: 'open' | 'won' | 'lost';
}

export interface BookingRules {
  minNoticeHours: number;
  maxDaysAhead: number;
  bufferMinutes: number;
}
