// Checks the seeded emulator data against the rules in docs/planning.md.
// Exits with code 1 and lists every problem it finds.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { assertReachable, useEmulators } from "./lib/emulator-guard.mjs";
import { SEED_PASSWORD, availability, clients, services, teams, users } from "./lib/seed-data.mjs";

const problems = [];
const check = (ok, message) => { if (!ok) problems.push(message); };

async function signIn(authHost, email) {
  const url = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=local-demo-key`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: SEED_PASSWORD, returnSecureToken: true }),
  });
  const body = await response.json();
  if (!body.idToken) return null;
  return JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url").toString("utf8"));
}

async function main() {
  const env = useEmulators();
  await assertReachable(`http://${env.firestoreHost}/`, "Firestore");
  await assertReachable(`http://${env.authHost}/`, "Auth");
  const app = initializeApp({ projectId: env.projectId });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const all = async (name) => Object.fromEntries((await db.collection(name).get()).docs.map((d) => [d.id, d.data()]));

  // Accounts: each one signs in with the known password and carries its role.
  for (const u of users) {
    const claims = await signIn(env.authHost, u.email);
    check(claims, `${u.email} cannot sign in with the seed password`);
    check(claims?.role === u.role, `${u.email} has role claim "${claims?.role}", expected "${u.role}"`);
  }
  const authUsers = (await auth.listUsers(1000)).users;
  check(authUsers.length === users.length, `expected ${users.length} auth users, found ${authUsers.length}`);

  const [settingsSnap, teamDocs, userDocs, serviceDocs, clientDocs, availabilityDocs] = await Promise.all([
    db.doc("settings/app").get(), all("teams"), all("users"), all("services"), all("clients"), all("availability"),
  ]);

  // Settings.
  const settings = settingsSnap.data();
  check(settings, "settings/app is missing");
  if (settings) {
    check(settings.currency === "BOB" && settings.exchangeRate === 6.96, "settings: default currency must be BOB at 6.96 Bs per $us");
    const stages = [...settings.pipelineStages].sort((a, b) => a.order - b.order);
    check(stages.length === 7, `settings: expected 7 stages, found ${stages.length}`);
    check(stages.at(-2)?.closing === "won" && stages.at(-1)?.closing === "lost", "settings: Ganado and Perdido must be the last two stages");
    check(settings.lossReasons.length === 7, "settings: expected 7 loss reasons");
    check(settings.bookingRules?.minNoticeHours === 24 && settings.bookingRules?.maxDaysAhead === 30 && settings.bookingRules?.bufferMinutes === 10, "settings: booking rules must be 24 h, 30 days and 10 min");
  }
  const stageIds = new Set(settings?.pipelineStages.map((s) => s.id));

  // Counts: seeding twice must not create duplicates.
  for (const [name, docs, expected] of [["teams", teamDocs, teams.length], ["users", userDocs, users.length], ["services", serviceDocs, services.length], ["clients", clientDocs, clients.length], ["availability", availabilityDocs, availability.length]]) {
    check(Object.keys(docs).length === expected, `${name}: expected ${expected} documents, found ${Object.keys(docs).length}`);
  }

  // Users and teams.
  for (const [uid, u] of Object.entries(userDocs)) {
    if (u.role === "admin") {
      check(u.teamIds.length === 0 && u.primaryTeamId === null, `${uid}: an admin belongs to no team`);
    } else {
      check(u.teamIds.length >= 1 && u.teamIds.every((t) => teamDocs[t]), `${uid}: teams must exist`);
      check(u.teamIds.includes(u.primaryTeamId), `${uid}: primary team must be one of their teams`);
    }
  }
  check(Object.values(userDocs).some((u) => u.role === "member" && u.teamIds.length === 2), "no seller belongs to two teams");
  const leads = Object.values(teamDocs).map((t) => t.leadUid);
  check(new Set(leads).size === leads.length, "a user leads more than one team");
  for (const [id, t] of Object.entries(teamDocs)) {
    const lead = userDocs[t.leadUid];
    check(lead?.role === "lead" && lead.teamIds.includes(id), `team ${id}: lead must be a team lead in that team`);
    const members = Object.values(userDocs).filter((u) => u.teamIds.includes(id)).length;
    check(t.memberCount === members, `team ${id}: memberCount ${t.memberCount}, expected ${members}`);
  }

  // Services belong to exactly one team.
  for (const [id, s] of Object.entries(serviceDocs)) {
    check(typeof s.teamId === "string" && teamDocs[s.teamId], `service ${id}: must belong to exactly one existing team`);
    check(["BOB", "USD"].includes(s.currency), `service ${id}: currency must be BOB or USD`);
  }

  // Clients.
  for (const [id, c] of Object.entries(clientDocs)) {
    check(stageIds.has(c.stage), `client ${id}: unknown stage ${c.stage}`);
    check(userDocs[c.ownerUid]?.teamIds.includes(c.teamId), `client ${id}: owner must belong to the client's team`);
    check(c.serviceIds.every((s) => serviceDocs[s]?.teamId === c.teamId), `client ${id}: services must belong to the client's team`);
    check(["BOB", "USD"].includes(c.valueCurrency), `client ${id}: value currency must be BOB or USD`);
    if (c.stage === "won") check(c.closedValue > 0, `client ${id}: a won client needs a final value`);
    if (c.stage === "lost") check(Boolean(c.lossReason), `client ${id}: a lost client needs a loss reason`);
    check(Array.isArray(c.searchTokens) && c.searchTokens.length > 0, `client ${id}: search tokens missing`);
  }
  check(new Set(Object.values(clientDocs).map((c) => c.stage)).size >= 5, "clients should cover at least five stages");

  // Availability.
  const slugs = Object.values(availabilityDocs).map((a) => a.bookingSlug);
  check(new Set(slugs).size === slugs.length, "booking links must be unique");

  if (problems.length) {
    console.error(`Seed verification failed (${problems.length}):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`Seed verification passed: ${users.length} accounts sign in with their role, and teams, services, clients, settings and availability follow the data model.`);
}

main().catch((error) => {
  console.error(`Seed verification failed: ${error.message}`);
  process.exit(1);
});
