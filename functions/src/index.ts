import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';
import type { Role } from '@klosers/shared';
import { REGION } from './config';

initializeApp();

// One region for every function; cap instances to keep the bill predictable.
setGlobalOptions({ region: REGION, maxInstances: 10 });

const ROLES: readonly Role[] = ['admin', 'team_lead', 'member'];

/** Smoke test for the local emulator and for the first deploy. */
export const ping = onCall(() => ({ ok: true, roles: ROLES }));
