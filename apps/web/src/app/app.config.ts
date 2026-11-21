import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { provideRouter, TitleStrategy } from '@angular/router';
import { environment } from '../environments/environment';
import { PageTitleStrategy } from './core/page-title.strategy';
import { routes } from './app.routes';

// The interface is in Spanish, with es-BO dates and numbers (1.250,50).
registerLocaleData(localeEsBo, 'es-BO');

const { emulators } = environment;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-BO' },
    { provide: TitleStrategy, useExisting: PageTitleStrategy },

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (emulators) connectAuthEmulator(auth, emulators.auth, { disableWarnings: true });
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (emulators)
        connectFirestoreEmulator(firestore, emulators.firestore.host, emulators.firestore.port);
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions(getApp(), environment.functionsRegion);
      if (emulators)
        connectFunctionsEmulator(functions, emulators.functions.host, emulators.functions.port);
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (emulators)
        connectStorageEmulator(storage, emulators.storage.host, emulators.storage.port);
      return storage;
    }),
  ],
};
