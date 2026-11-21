// Seeds the local emulators with sample data. Safe to run again: every ID is fixed.
// Usage: start the emulators (npm run emulators), then run npm run seed in another terminal.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { assertReachable, useEmulators } from "./lib/emulator-guard.mjs";
import { SEED_PASSWORD, availability, clients, searchTokens, services, settings, teams, users } from "./lib/seed-data.mjs";

const ts = (date) => (date ? Timestamp.fromDate(date) : null);

async function upsertAuthUser(auth, user) {
  const props = { email: user.email, password: SEED_PASSWORD, displayName: user.displayName, emailVerified: true, disabled: false };
  try {
    await auth.getUser(user.uid);
    await auth.updateUser(user.uid, props);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    await auth.createUser({ uid: user.uid, ...props });
  }
  await auth.setCustomUserClaims(user.uid, { role: user.role });
}

async function main() {
  const env = useEmulators();
  await assertReachable(`http://${env.firestoreHost}/`, "Firestore");
  await assertReachable(`http://${env.authHost}/`, "Auth");

  const app = initializeApp({ projectId: env.projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const user of users) await upsertAuthUser(auth, user);

  const batch = db.batch();
  batch.set(db.doc("settings/app"), settings);

  for (const { id, ...team } of teams) {
    const memberCount = users.filter((u) => u.teamIds.includes(id)).length;
    batch.set(db.doc(`teams/${id}`), { ...team, memberCount });
  }

  for (const { uid, ...user } of users) {
    batch.set(db.doc(`users/${uid}`), { ...user, permissions: {}, status: "active", lastLoginAt: null });
  }

  for (const { id, ...service } of services) {
    batch.set(db.doc(`services/${id}`), { ...service, materialUrls: [] });
  }

  for (const { id, nextFollowUpAt, createdAt, ...client } of clients) {
    batch.set(db.doc(`clients/${id}`), {
      ...client,
      country: "Bolivia",
      nextFollowUpAt: ts(nextFollowUpAt),
      createdAt: ts(createdAt),
      updatedAt: ts(createdAt),
      deletedAt: null,
      searchTokens: searchTokens(client.companyName, client.contactName, client.email, client.phone, client.website, client.instagram),
    });
  }

  for (const { uid, ...entry } of availability) batch.set(db.doc(`availability/${uid}`), entry);

  await batch.commit();

  console.log(`Seeded project ${env.projectId}: ${users.length} users, ${teams.length} teams, ${services.length} services, ${clients.length} clients, ${availability.length} availabilities.`);
  console.log(`Every account signs in with the password: ${SEED_PASSWORD}`);
  for (const u of users) console.log(`  ${u.role.padEnd(6)} ${u.email}`);
}

main().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exit(1);
});
