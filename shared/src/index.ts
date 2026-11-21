/**
 * Shared data-model types for the web app and the Cloud Functions.
 *
 * Types only: keep runtime code out of this folder. Import with `import type` from
 * `@klosers/shared`, an alias set in `apps/web/tsconfig.json` and `functions/tsconfig.json`.
 */
export type * from './bookings';
export type * from './clients';
export type * from './common';
export type * from './scraper';
export type * from './services';
export type * from './settings';
export type * from './stats';
export type * from './users';
