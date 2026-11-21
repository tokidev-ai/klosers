// Keeps local scripts away from production: they only run against the Firebase emulators
// and a demo project, which exists nowhere but on this machine.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DEMO_PROJECT_ID = "demo-klosers";
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export function emulatorConfig() {
  return JSON.parse(readFileSync(path.join(ROOT, "firebase.json"), "utf8")).emulators;
}

function hostOf(hostAndPort = "") {
  if (hostAndPort.startsWith("[")) return hostAndPort.slice(1, hostAndPort.indexOf("]"));
  return hostAndPort.split(":")[0];
}

/** Points the Admin SDK at the local emulators and refuses anything else. */
export function useEmulators() {
  const cfg = emulatorConfig();
  // Local scripts never need Google Cloud credentials; skip the metadata server lookup.
  process.env.METADATA_SERVER_DETECTION ??= "none";
  process.env.FIRESTORE_EMULATOR_HOST ??= `${cfg.firestore.host}:${cfg.firestore.port}`;
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= `${cfg.auth.host}:${cfg.auth.port}`;

  for (const name of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"]) {
    if (!LOCAL_HOSTS.has(hostOf(process.env[name]))) {
      throw new Error(`${name} is "${process.env[name]}". This script only runs against local emulators.`);
    }
  }

  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || DEMO_PROJECT_ID;
  if (!projectId.startsWith("demo-")) {
    throw new Error(`Project "${projectId}" is not a demo project. This script never touches a real project.`);
  }

  return {
    projectId,
    firestoreHost: process.env.FIRESTORE_EMULATOR_HOST,
    authHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
  };
}

export async function assertReachable(url, label) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(3000) });
  } catch {
    throw new Error(`Cannot reach the ${label} emulator at ${url}. Start the emulators first: npm run emulators`);
  }
}
