// Checks the seeded emulator data against the rules in docs/planning.md.
// By default it checks only the seeded records, so extra development data is fine.
// --strict also requires exact totals, which proves seeding twice creates no duplicates.
// Exits with code 1 and lists every problem it finds.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { assertReachable, useEmulators } from './lib/emulator-guard.mjs';
import { SEED_PASSWORD, availability, clients, services, teams, users } from './lib/seed-data.mjs';

const strict = process.argv.includes('--strict');
/** @typedef {import('@klosers/shared').AppSettings} AppSettings */
/** @typedef {import('@klosers/shared').Availability} Availability */
/** @typedef {import('@klosers/shared').Client} Client */
/** @typedef {import('@klosers/shared').Service} Service */
/** @typedef {import('@klosers/shared').Team} Team */
/** @typedef {import('@klosers/shared').UserProfile} UserProfile */

/** @type {string[]} */
const problems = [];
/**
 * @param {unknown} ok
 * @param {string} message
 */
const check = (ok, message) => {
  if (!ok) problems.push(message);
};

/**
 * Signs in through the Auth emulator and returns the ID token's claims, or null.
 * @param {string} authHost
 * @param {string} email
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function signIn(authHost, email) {
  const url = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=local-demo-key`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: SEED_PASSWORD, returnSecureToken: true }),
  });
  const body = /** @type {{ idToken?: string }} */ (await response.json());
  if (!body.idToken) return null;
  return JSON.parse(Buffer.from(body.idToken.split('.')[1], 'base64url').toString('utf8'));
}

async function main() {
  const env = useEmulators();
  await assertReachable(`http://${env.firestoreHost}/`, 'Firestore');
  await assertReachable(`http://${env.authHost}/`, 'Auth');
  const app = initializeApp({ projectId: env.projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);

  /** Reads the seeded documents of one collection by ID; a missing one is a problem. */
  /**
   * @param {string} collection
   * @param {string[]} ids
   */
  const seeded = async (collection, ids) => {
    const snaps = await db.getAll(...ids.map((id) => db.doc(`${collection}/${id}`)));
    /** @type {Record<string, import('firebase-admin/firestore').DocumentData>} */
    const docs = {};
    for (const snap of snaps) {
      const data = snap.data();
      check(data, `${collection}/${snap.id} is missing`);
      if (data) docs[snap.id] = data;
    }
    return docs;
  };

  // Accounts: each one signs in with the known password and carries its role.
  for (const u of users) {
    const claims = await signIn(env.authHost, u.email);
    check(claims, `${u.email} cannot sign in with the seed password`);
    check(
      claims?.role === u.role,
      `${u.email} has role claim "${claims?.role}", expected "${u.role}"`,
    );
    check(
      claims?.user_id === u.uid,
      `${u.email} belongs to uid "${claims?.user_id}", expected "${u.uid}"`,
    );
  }

  const settingsSnap = await db.doc('settings/app').get();
  const teamDocs = /** @type {Record<string, Team>} */ (
    await seeded(
      'teams',
      teams.map((t) => t.id),
    )
  );
  const userDocs = /** @type {Record<string, UserProfile>} */ (
    await seeded(
      'users',
      users.map((u) => u.uid),
    )
  );
  const serviceDocs = /** @type {Record<string, Service>} */ (
    await seeded(
      'services',
      services.map((s) => s.id),
    )
  );
  const clientDocs = /** @type {Record<string, Client>} */ (
    await seeded(
      'clients',
      clients.map((c) => c.id),
    )
  );
  const availabilityDocs = /** @type {Record<string, Availability>} */ (
    await seeded(
      'availability',
      availability.map((a) => a.uid),
    )
  );

  // Settings.
  const settings = /** @type {AppSettings | undefined} */ (settingsSnap.data());
  check(settings, 'settings/app is missing');
  if (settings) {
    check(
      settings.currency === 'Bs' && settings.exchangeRate === 6.96,
      'settings: default currency must be Bs at 6.96 Bs per $us',
    );
    const stages = [...settings.pipelineStages].sort((a, b) => a.order - b.order);
    check(stages.length === 7, `settings: expected 7 stages, found ${stages.length}`);
    check(
      stages.at(-2)?.kind === 'won' && stages.at(-1)?.kind === 'lost',
      'settings: Ganado and Perdido must be the last two stages',
    );
    check(
      stages.slice(0, -2).every((s) => s.kind === 'open'),
      'settings: every other stage must be open',
    );
    check(settings.lossReasons.length === 7, 'settings: expected 7 loss reasons');
    check(
      settings.bookingRules?.minNoticeHours === 24 &&
        settings.bookingRules?.maxDaysAhead === 30 &&
        settings.bookingRules?.bufferMinutes === 10,
      'settings: booking rules must be 24 h, 30 days and 10 min',
    );
  }
  const stageIds = new Set(settings?.pipelineStages.map((s) => s.id));

  // Users and teams.
  for (const [uid, u] of Object.entries(userDocs)) {
    if (u.role === 'admin') {
      check(
        u.teamIds.length === 0 && u.primaryTeamId === null,
        `${uid}: an admin belongs to no team`,
      );
    } else {
      check(
        u.teamIds.length >= 1 && u.teamIds.every((t) => teamDocs[t]),
        `${uid}: teams must exist`,
      );
      check(
        u.primaryTeamId !== null && u.teamIds.includes(u.primaryTeamId),
        `${uid}: primary team must be one of their teams`,
      );
    }
  }
  check(
    Object.values(userDocs).some((u) => u.role === 'member' && u.teamIds.length === 2),
    'no seller belongs to two teams',
  );
  const leads = Object.values(teamDocs).map((t) => t.leadUid);
  check(new Set(leads).size === leads.length, 'a user leads more than one team');
  for (const [id, t] of Object.entries(teamDocs)) {
    const lead = t.leadUid ? userDocs[t.leadUid] : undefined;
    check(
      lead?.role === 'team_lead' && lead.teamIds.includes(id),
      `team ${id}: lead must be a team lead in that team`,
    );
    const members = Object.values(userDocs).filter((u) => u.teamIds.includes(id)).length;
    check(
      t.memberCount === members,
      `team ${id}: memberCount ${t.memberCount}, expected ${members}`,
    );
  }

  // Services belong to exactly one team.
  for (const [id, s] of Object.entries(serviceDocs)) {
    check(
      typeof s.teamId === 'string' && teamDocs[s.teamId],
      `service ${id}: must belong to exactly one existing team`,
    );
    check(['Bs', '$us'].includes(s.currency), `service ${id}: currency must be Bs or $us`);
  }

  // Clients.
  for (const [id, c] of Object.entries(clientDocs)) {
    check(stageIds.has(c.stage), `client ${id}: unknown stage ${c.stage}`);
    check(
      userDocs[c.ownerUid]?.teamIds.includes(c.teamId),
      `client ${id}: owner must belong to the client's team`,
    );
    check(
      c.serviceIds.every((s) => serviceDocs[s]?.teamId === c.teamId),
      `client ${id}: services must belong to the client's team`,
    );
    check(
      ['Bs', '$us'].includes(c.valueCurrency),
      `client ${id}: value currency must be Bs or $us`,
    );
    if (c.lossReason)
      check(
        settings?.lossReasons.includes(c.lossReason),
        `client ${id}: unknown loss reason ${c.lossReason}`,
      );
    if (c.stage === 'won')
      check((c.closedValue ?? 0) > 0, `client ${id}: a won client needs a final value`);
    if (c.stage === 'lost')
      check(Boolean(c.lossReason), `client ${id}: a lost client needs a loss reason`);
    check(
      Array.isArray(c.searchTokens) && c.searchTokens.length > 0,
      `client ${id}: search tokens missing`,
    );
  }
  check(
    new Set(Object.values(clientDocs).map((c) => c.stage)).size >= 5,
    'clients should cover at least five stages',
  );

  // Availability.
  const slugs = Object.values(availabilityDocs).map((a) => a.bookingSlug);
  check(new Set(slugs).size === slugs.length, 'booking links must be unique');

  // Strict mode: the emulators hold exactly the seed, so a second seed created no duplicates.
  if (strict) {
    const authCount = (await auth.listUsers(1000)).users.length;
    check(
      authCount === users.length,
      `strict: expected ${users.length} auth users, found ${authCount}`,
    );
    /** @type {Array<[string, number]>} */
    const totals = [
      ['teams', teams.length],
      ['users', users.length],
      ['services', services.length],
      ['clients', clients.length],
      ['availability', availability.length],
    ];
    for (const [name, expected] of totals) {
      const count = (await db.collection(name).count().get()).data().count;
      check(count === expected, `strict: ${name} has ${count} documents, expected ${expected}`);
    }
  }

  if (problems.length) {
    console.error(`Seed verification failed (${problems.length}):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(
    `Seed verification passed${strict ? ' (strict)' : ''}: ${users.length} accounts sign in with their role, and teams, services, clients, settings and availability follow the data model.`,
  );
}

main().catch((error) => {
  console.error(`Seed verification failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
