import type { Environment } from './environment.model';

/**
 * Local development (`npm start`): the `demo-klosers` project that exists only inside the
 * emulators, so local work never touches live data. Replaces `environment.ts` through
 * `fileReplacements` in `angular.json`.
 */
export const environment: Environment = {
  firebase: {
    projectId: 'demo-klosers',
    appId: '1:000000000000:web:0000000000000000000000',
    apiKey: 'demo-api-key',
    authDomain: 'demo-klosers.firebaseapp.com',
    storageBucket: 'demo-klosers.firebasestorage.app',
  },
  functionsRegion: 'us-central1',
  emulators: {
    auth: 'http://127.0.0.1:9099',
    firestore: { host: '127.0.0.1', port: 8080 },
    functions: { host: '127.0.0.1', port: 5005 },
    storage: { host: '127.0.0.1', port: 9199 },
  },
};
