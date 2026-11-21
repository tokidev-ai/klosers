/**
 * Region for every Cloud Function.
 *
 * Choose it once, in P0-03.2, together with the Firestore location, which can never be
 * changed after the database is created. São Paulo (southamerica-east1) is the proposed
 * default for a Bolivian team; change this one constant if the team picks another region.
 */
export const REGION = "southamerica-east1";

/** The local demo project. It only exists inside the Firebase emulators. */
export const DEMO_PROJECT_ID = "demo-klosers";
