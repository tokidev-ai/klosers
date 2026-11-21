// Firestore rules tests. Run with `npm run test:rules`, which starts the Firestore emulator.
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

// The rules start from deny-all. Add a describe block here with each collection's rules.
describe('deny-all baseline', () => {
  it('blocks reads and writes for a signed-out visitor', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'clients/c1')));
    await assertFails(setDoc(doc(db, 'clients/c1'), { name: 'Acme' }));
  });

  it('blocks reads and writes for a signed-in user', async () => {
    const db = env.authenticatedContext('user1').firestore();
    await assertFails(getDoc(doc(db, 'clients/c1')));
    await assertFails(setDoc(doc(db, 'clients/c1'), { name: 'Acme' }));
  });

  it('blocks a path that no rule names', async () => {
    const db = env.authenticatedContext('user1').firestore();
    await assertFails(getDoc(doc(db, 'anything/else/nested/doc')));
  });
});
