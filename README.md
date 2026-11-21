# Klosers CRM

A web app where a sales team keeps its clients in one place, finds leads, moves deals across a pipeline board, takes bookings and tracks results. Built with Angular and Firebase. The full plan is in [`docs/planning.md`](docs/planning.md).

## Repository layout

| Folder                                                               | What it holds                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`apps/web`](apps/web)                                               | The Angular app (standalone components, signals)                                |
| [`functions`](functions)                                             | Cloud Functions for Firebase, 2nd gen, TypeScript                               |
| [`firestore`](firestore)                                             | `firestore.rules` and `firestore.indexes.json`                                  |
| [`shared`](shared)                                                   | Data-model TypeScript types used by both the app and the functions              |
| `firebase.json`, `eslint.config.mjs`, `.prettierrc`, `.editorconfig` | Firebase config and the lint and format settings shared by the whole repository |

It is an npm workspace: `apps/web` and `functions` are workspaces, and one `npm install` at the root installs both.

## Prerequisites

- **Node.js 22.22.3 or newer** (see `.nvmrc`; the Angular CLI refuses older versions). Cloud Functions run on Node 22.
- **JDK 21 or newer**, only for the Firestore emulator.
- A **Firebase project on the Blaze plan** (Cloud Functions need it), only when you deploy. Local work needs no project.

## Install

```sh
nvm use          # optional, picks the Node version from .nvmrc
npm install
```

The Firebase CLI is installed with the repository (`firebase-tools`), so there is nothing to install globally. Run it through npm scripts or `npx firebase ...`.

## Run locally

Developers work against the Firebase Emulator Suite, never against live data.

```sh
npm run emulators   # Auth, Firestore, Functions and Hosting emulators, UI at http://localhost:4000
npm start           # Angular dev server at http://localhost:4200
```

Build first (`npm run build`) if you want the Hosting emulator to serve the app, because it serves `apps/web/dist/web/browser`. The Functions emulator runs the built code in `functions/lib`, so rebuild after changing a function (`npm run build --workspace functions`).

## Lint, format and checks

One command covers the whole repository (app, functions, shared types and config files):

```sh
npm run check    # ESLint + Prettier check + type check; run this before pushing
npm run fix      # ESLint --fix + Prettier --write
```

The pieces are also available on their own: `npm run lint`, `npm run format`, `npm run format:check`, `npm run typecheck`. ESLint uses one flat config at the root (`eslint.config.mjs`) with Angular rules scoped to `apps/web`, and Prettier settings live in `.prettierrc`.

## Build and test

```sh
npm run build    # Angular production build and Cloud Functions bundle
npm test         # Angular unit tests
```

## Shared types

The data model from the planning document lives in [`shared/src`](shared/src) as types only, with no runtime code. Import it in the app or the functions with:

```ts
import type { Client, Role } from '@klosers/shared';
```

The `@klosers/shared` alias is set in `apps/web/tsconfig.json` and `functions/tsconfig.json`. Functions are bundled with esbuild before deploy, and `import type` is erased, so the functions package needs no extra dependency on `shared`. ESLint enforces `import type` in `functions` and `shared`.

## Deploy

Deploys go to the single production Firebase project. The plan is to deploy from CI when a change merges to `main`; until that exists, deploy by hand:

```sh
npx firebase login
npx firebase use --add        # pick the project once; this creates .firebaserc
npm run deploy                # Hosting, Functions, and Firestore rules and indexes
```

The predeploy hooks in `firebase.json` build the app and the functions first. To deploy one part only:

```sh
npx firebase deploy --only hosting
npx firebase deploy --only functions
npx firebase deploy --only firestore
```

Rules and indexes in `firestore/` are deployed with the `firestore` target. The rules start from deny-all, so the app cannot read or write data until the rules for each collection are added.
