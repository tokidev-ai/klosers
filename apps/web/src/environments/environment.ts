import type { Environment } from './environment.model';

/**
 * Production. These are the public web-app settings of the `leadport-dev` Firebase project,
 * not secrets: access is controlled by security rules and Authentication.
 */
export const environment: Environment = {
  firebase: {
    projectId: 'leadport-dev',
    appId: '1:559047621353:web:1e2b39c6830cde57580e78',
    apiKey: 'AIzaSyBy_Eo-fkowZ7NvcbDYAm-vBpEXG0YrMpE',
    authDomain: 'leadport-dev.firebaseapp.com',
    storageBucket: 'leadport-dev.firebasestorage.app',
    messagingSenderId: '559047621353',
  },
  functionsRegion: 'us-central1',
  emulators: null,
};
