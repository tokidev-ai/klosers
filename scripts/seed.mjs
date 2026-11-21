// Seeds the local emulators with sample data. Safe to run again: every ID is fixed.
// Usage: start the emulators (npm run emulators), then run npm run seed in another terminal.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { assertReachable, errorCode, useEmulators } from './lib/emulator-guard.mjs';
import {
  SEED_PASSWORD,
  availability,
  clients,
  searchTokens,
  services,
  settings,
  teams,
  users,
} from './lib/seed-data.mjs';

/** @typedef {import('@klosers/shared').Client} Client */
/** @typedef {import('@klosers/shared').Service} Service */
/** @typedef {import('@klosers/shared').Team} Team */
/** @typedef {import('@klosers/shared').UserProfile} UserProfile */

/**
 * @param {import('firebase-admin/auth').Auth} auth
 * @param {(typeof users)[number]} user
 */
async function upsertAuthUser(auth, user) {
  // An account created by hand in the Auth emulator may already use this email with another uid.
  try {
    const byEmail = await auth.getUserByEmail(user.email);
    if (byEmail.uid !== user.uid) await auth.deleteUser(byEmail.uid);
  } catch (error) {
    if (errorCode(error) !== 'auth/user-not-found') throw error;
  }
  const props = {
    email: user.email,
    password: SEED_PASSWORD,
    displayName: user.displayName,
    emailVerified: true,
    disabled: false,
  };
  try {
    await auth.getUser(user.uid);
    await auth.updateUser(user.uid, props);
  } catch (error) {
    if (errorCode(error) !== 'auth/user-not-found') throw error;
    await auth.createUser({ uid: user.uid, ...props });
  }
  await auth.setCustomUserClaims(user.uid, { role: user.role });
}

async function main() {
  const env = useEmulators();
  await assertReachable(`http://${env.firestoreHost}/`, 'Firestore');
  await assertReachable(`http://${env.authHost}/`, 'Auth');

  const app = initializeApp({ projectId: env.projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const user of users) await upsertAuthUser(auth, user);

  const batch = db.batch();
  batch.set(db.doc('settings/app'), settings);

  for (const { id, ...team } of teams) {
    /** @type {Team} */
    const doc = { ...team, memberCount: users.filter((u) => u.teamIds.includes(id)).length };
    batch.set(db.doc(`teams/${id}`), doc);
  }

  for (const { uid, ...user } of users) {
    /** @type {UserProfile} */
    const doc = { ...user, permissions: {}, status: 'active', lastLoginAt: null };
    batch.set(db.doc(`users/${uid}`), doc);
  }

  for (const { id, ...service } of services) {
    /** @type {Service} */
    const doc = { ...service, materialUrls: [] };
    batch.set(db.doc(`services/${id}`), doc);
  }

  for (const { id, nextFollowUpAt, createdAt, ...client } of clients) {
    /** @type {Client} */
    const doc = {
      ...client,
      country: 'Bolivia',
      nextFollowUpAt: nextFollowUpAt ? Timestamp.fromDate(nextFollowUpAt) : null,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(createdAt),
      deletedAt: null,
      searchTokens: searchTokens(
        client.companyName,
        client.contactName,
        client.email,
        client.phone,
        client.website,
        client.instagram,
      ),
    };
    batch.set(db.doc(`clients/${id}`), doc);
  }

  for (const { uid, ...entry } of availability) batch.set(db.doc(`availability/${uid}`), entry);

  await batch.commit();

  console.log(
    `Seeded project ${env.projectId}: ${users.length} users, ${teams.length} teams, ${services.length} services, ${clients.length} clients, ${availability.length} availabilities.`,
  );
  console.log(`Every account signs in with the password: ${SEED_PASSWORD}`);
  for (const u of users) console.log(`  ${u.role.padEnd(9)} ${u.email}`);
}

main().catch((error) => {
  console.error(`Seed failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
