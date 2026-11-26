// Firestore rules tests. Run with `npm run test:rules`, which starts the Firestore emulator.
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

/** @type {import('@firebase/rules-unit-testing').RulesTestEnvironment} */
let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-klosers',
    firestore: { rules: readFileSync('firestore/firestore.rules', 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

/** Profiles the rules read to decide if a user is active and which teams they belong to. */
const profiles = {
  admin: { role: 'admin', status: 'active', teamIds: [], primaryTeamId: null },
  leadA: { role: 'team_lead', status: 'active', teamIds: ['teamA'], primaryTeamId: 'teamA' },
  memberA: { role: 'member', status: 'active', teamIds: ['teamA'], primaryTeamId: 'teamA' },
  memberB: { role: 'member', status: 'active', teamIds: ['teamB'], primaryTeamId: 'teamB' },
  gone: { role: 'member', status: 'deactivated', teamIds: ['teamA'], primaryTeamId: 'teamA' },
};

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const [uid, profile] of Object.entries(profiles)) {
      await setDoc(doc(db, 'users', uid), {
        displayName: uid,
        email: `${uid}@example.com`,
        ...profile,
      });
    }
    await setDoc(doc(db, 'settings/app'), { companyName: 'Klosers' });
    await setDoc(doc(db, 'teams/teamA'), { name: 'A', leadUid: 'leadA', memberCount: 2 });
    await setDoc(doc(db, 'teams/teamB'), { name: 'B', leadUid: null, memberCount: 1 });
    await setDoc(doc(db, 'invitations/i1'), { email: 'new@example.com', status: 'pending' });
    await setDoc(doc(db, 'services/sA'), { name: 'Web', teamId: 'teamA', active: true });
    await setDoc(doc(db, 'services/sAOff'), { name: 'Old', teamId: 'teamA', active: false });
    await setDoc(doc(db, 'services/sB'), { name: 'Ads', teamId: 'teamB', active: true });
    await setDoc(doc(db, 'clients/c1'), {
      companyName: 'Acme',
      ownerUid: 'memberA',
      teamId: 'teamA',
    });
  });
});

/** A signed-in user, with the role claim a Cloud Function would have set. */
const as = (uid) => env.authenticatedContext(uid, { role: profiles[uid].role }).firestore();
const signedOut = () => env.unauthenticatedContext().firestore();

describe('deny-all baseline', () => {
  it('blocks reads and writes for a signed-out visitor', async () => {
    const db = signedOut();
    await assertFails(getDoc(doc(db, 'clients/c1')));
    await assertFails(setDoc(doc(db, 'clients/c1'), { companyName: 'Acme' }));
  });

  it('blocks a path that no rule names, even for an admin', async () => {
    await assertFails(getDoc(doc(as('admin'), 'anything/else/nested/doc')));
    await assertFails(setDoc(doc(as('admin'), 'anything/else'), { a: 1 }));
  });

  it('keeps collections without rules denied for every role', async () => {
    for (const uid of ['admin', 'leadA', 'memberA']) {
      const db = as(uid);
      for (const path of [
        'clients/c1',
        'clients/c1/activities/a1',
        'bookings/b1',
        'availability/memberA',
        'clientTypes/t1',
        'scrapeJobs/j1',
        'scrapeJobs/j1/leads/l1',
        'stats/company_2026-11',
      ]) {
        await assertFails(getDoc(doc(db, path)));
        await assertFails(setDoc(doc(db, path), { a: 1 }));
      }
    }
  });
});

describe('helpers: signed in, active, role and team', () => {
  it('denies a signed-in user with no profile', async () => {
    const db = env.authenticatedContext('stranger', { role: 'admin' }).firestore();
    await assertFails(getDoc(doc(db, 'settings/app')));
  });

  it('denies a deactivated user at once, even with a valid token', async () => {
    await assertFails(getDoc(doc(as('gone'), 'settings/app')));
    await assertFails(getDoc(doc(as('gone'), 'users/gone')));
    await assertFails(getDoc(doc(as('gone'), 'teams/teamA')));
  });

  it('denies an admin claim on a deactivated profile', async () => {
    await env.withSecurityRulesDisabled((context) =>
      setDoc(doc(context.firestore(), 'users/admin'), { ...profiles.admin, status: 'deactivated' }),
    );
    await assertFails(getDoc(doc(as('admin'), 'invitations/i1')));
  });

  it('reads the role from the token, not from the profile', async () => {
    // The profile says admin, but the token claims a member: the token wins.
    const db = env.authenticatedContext('admin', { role: 'member' }).firestore();
    await assertFails(getDoc(doc(db, 'invitations/i1')));
  });

  it('denies a token with no role claim', async () => {
    const db = env.authenticatedContext('admin').firestore();
    await assertFails(getDoc(doc(db, 'invitations/i1')));
  });
});

describe('settings', () => {
  it('lets any active user read the settings', async () => {
    await assertSucceeds(getDoc(doc(as('memberA'), 'settings/app')));
    await assertSucceeds(getDoc(doc(as('admin'), 'settings/app')));
  });

  it('denies a signed-out visitor', async () => {
    await assertFails(getDoc(doc(signedOut(), 'settings/app')));
  });

  it('denies every write from the app, even for an admin', async () => {
    await assertFails(setDoc(doc(as('admin'), 'settings/app'), { companyName: 'Hacked' }));
    await assertFails(updateDoc(doc(as('memberA'), 'settings/app'), { companyName: 'Hacked' }));
  });
});

describe('users', () => {
  it('lets a user read their own profile', async () => {
    await assertSucceeds(getDoc(doc(as('memberA'), 'users/memberA')));
  });

  it("denies a member reading a teammate's or another team's profile", async () => {
    await assertFails(getDoc(doc(as('memberA'), 'users/leadA')));
    await assertFails(getDoc(doc(as('memberA'), 'users/memberB')));
  });

  it('lets an admin read and list every profile', async () => {
    await assertSucceeds(getDoc(doc(as('admin'), 'users/memberB')));
    await assertSucceeds(getDocs(collection(as('admin'), 'users')));
  });

  it('lets a team lead read a member of their team, but not another team', async () => {
    await assertSucceeds(getDoc(doc(as('leadA'), 'users/memberA')));
    await assertFails(getDoc(doc(as('leadA'), 'users/memberB')));
    await assertSucceeds(
      getDocs(query(collection(as('leadA'), 'users'), where('teamIds', 'array-contains', 'teamA'))),
    );
  });

  it('denies a member listing every profile', async () => {
    await assertFails(getDocs(collection(as('memberA'), 'users')));
  });

  it('denies a user granting themselves a role, a team or a status', async () => {
    const db = as('memberA');
    await assertFails(updateDoc(doc(db, 'users/memberA'), { role: 'admin' }));
    await assertFails(updateDoc(doc(db, 'users/memberA'), { teamIds: ['teamA', 'teamB'] }));
    await assertFails(updateDoc(doc(db, 'users/memberA'), { status: 'active' }));
    await assertFails(
      setDoc(doc(db, 'users/newbie'), { role: 'admin', status: 'active', teamIds: [] }),
    );
  });

  it('denies writes even for an admin, since a Cloud Function owns them', async () => {
    await assertFails(updateDoc(doc(as('admin'), 'users/memberA'), { role: 'admin' }));
  });
});

describe('teams', () => {
  it('lets a member and a team lead read their own team', async () => {
    await assertSucceeds(getDoc(doc(as('memberA'), 'teams/teamA')));
    await assertSucceeds(getDoc(doc(as('leadA'), 'teams/teamA')));
  });

  it('lets an admin read every team', async () => {
    await assertSucceeds(getDoc(doc(as('admin'), 'teams/teamA')));
    await assertSucceeds(getDoc(doc(as('admin'), 'teams/teamB')));
    await assertSucceeds(getDocs(collection(as('admin'), 'teams')));
  });

  it('denies reading another team', async () => {
    await assertFails(getDoc(doc(as('memberA'), 'teams/teamB')));
    await assertFails(getDoc(doc(as('leadA'), 'teams/teamB')));
  });

  it('denies every write, since only a Cloud Function sets a lead', async () => {
    await assertFails(updateDoc(doc(as('admin'), 'teams/teamA'), { leadUid: 'memberA' }));
    await assertFails(updateDoc(doc(as('leadA'), 'teams/teamA'), { name: 'Mine' }));
    await assertFails(setDoc(doc(as('admin'), 'teams/teamC'), { name: 'C' }));
  });
});

describe('invitations', () => {
  it('lets an admin read invitations', async () => {
    await assertSucceeds(getDoc(doc(as('admin'), 'invitations/i1')));
    await assertSucceeds(getDocs(collection(as('admin'), 'invitations')));
  });

  it('denies a team lead, a member and a signed-out visitor', async () => {
    await assertFails(getDoc(doc(as('leadA'), 'invitations/i1')));
    await assertFails(getDoc(doc(as('memberA'), 'invitations/i1')));
    await assertFails(getDoc(doc(signedOut(), 'invitations/i1')));
  });

  it('denies every write, even for an admin', async () => {
    await assertFails(
      setDoc(doc(as('admin'), 'invitations/i2'), { email: 'x@example.com', role: 'admin' }),
    );
    await assertFails(updateDoc(doc(as('admin'), 'invitations/i1'), { status: 'accepted' }));
  });
});

describe('services', () => {
  it('lets a member read an active service of their team', async () => {
    await assertSucceeds(getDoc(doc(as('memberA'), 'services/sA')));
    await assertSucceeds(getDoc(doc(as('leadA'), 'services/sA')));
  });

  it('lets a member list their team’s active services', async () => {
    const q = query(
      collection(as('memberA'), 'services'),
      where('teamId', '==', 'teamA'),
      where('active', '==', true),
    );
    await assertSucceeds(getDocs(q));
  });

  it('denies an inactive service, and a service of another team, for a member', async () => {
    await assertFails(getDoc(doc(as('memberA'), 'services/sAOff')));
    await assertFails(getDoc(doc(as('memberA'), 'services/sB')));
    await assertFails(getDoc(doc(as('leadA'), 'services/sB')));
  });

  it('lets an admin read every service, active or not', async () => {
    await assertSucceeds(getDoc(doc(as('admin'), 'services/sAOff')));
    await assertSucceeds(getDoc(doc(as('admin'), 'services/sB')));
  });

  it('denies a signed-out visitor and a deactivated user', async () => {
    await assertFails(getDoc(doc(signedOut(), 'services/sA')));
    await assertFails(getDoc(doc(as('gone'), 'services/sA')));
  });

  it('denies every write from the app, even for an admin', async () => {
    await assertFails(
      setDoc(doc(as('admin'), 'services/sNew'), { name: 'X', teamId: 'teamA', active: true }),
    );
    await assertFails(updateDoc(doc(as('leadA'), 'services/sA'), { active: false }));
  });
});
