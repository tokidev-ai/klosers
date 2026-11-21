/**
 * Minimal structural type for a Firestore timestamp.
 *
 * Both the web SDK (`firebase/firestore`) and the Admin SDK (`firebase-admin/firestore`)
 * export a `Timestamp` class that satisfies this shape, so the same data-model types
 * work on both sides without importing either SDK here.
 */
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
}

/** Bolivianos (Bs) or US dollars ($us). Each amount keeps its own currency. */
export type Currency = 'Bs' | '$us';

/** Calendar date as `YYYY-MM-DD`. */
export type IsoDate = string;

/** Time of day as `HH:mm` (24 hours). */
export type TimeOfDay = string;
