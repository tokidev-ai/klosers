/**
 * Region for every Cloud Function.
 *
 * It must match the Firestore location, because Firestore triggers run in the database's
 * region. The production database in leadport-dev was created in nam5, a United States
 * multi-region whose functions region is us-central1. A database location can never change.
 */
export const REGION = 'us-central1';
