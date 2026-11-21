import type { FirebaseOptions } from 'firebase/app';

/** Addresses of the local Firebase Emulator Suite. Ports match `firebase.json`. */
export interface EmulatorConfig {
  auth: string;
  firestore: { host: string; port: number };
  functions: { host: string; port: number };
  storage: { host: string; port: number };
}

export interface Environment {
  firebase: FirebaseOptions;
  /** Region of every Cloud Function. Keep in sync with `functions/src/config.ts`. */
  functionsRegion: string;
  /** Set only in development: connects every Firebase service to the local emulators. */
  emulators: EmulatorConfig | null;
}
