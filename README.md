# Klosers CRM

A web app where a sales team keeps its clients in one place, finds leads, moves deals across a pipeline board, takes bookings and tracks results. Built with Angular and Firebase. The full plan is in [`docs/planning.md`](docs/planning.md), and the one-time production setup is in [`docs/firebase-setup.md`](docs/firebase-setup.md).

## Repository layout

| Folder                                                                              | What it holds                                                                                                                                      |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/web`](apps/web)                                                              | The Angular app (standalone components, signals)                                                                                                   |
| [`functions`](functions)                                                            | Cloud Functions for Firebase, 2nd gen, TypeScript. The region lives in `functions/src/config.ts` and the API secrets in `functions/src/secrets.ts` |
| [`firestore`](firestore)                                                            | `firestore.rules` and `firestore.indexes.json`                                                                                                     |
| [`storage`](storage)                                                                | `storage.rules`                                                                                                                                    |
| [`shared`](shared)                                                                  | Data-model TypeScript types used by the app, the functions and the seed script                                                                     |
| [`.github/workflows`](.github/workflows)                                            | CI: `ci.yml` checks every pull request, `deploy.yml` deploys to production on merge to `main`                                                      |
| [`scripts`](scripts)                                                                | Emulator launcher, seed, seed check and health check                                                                                               |
| `firebase.json`, `.firebaserc`, `eslint.config.mjs`, `.prettierrc`, `.editorconfig` | Firebase config and the lint and format settings shared by the whole repository                                                                    |

It is an npm workspace: `apps/web` and `functions` are workspaces, and one `npm install` at the root installs both.

## Prerequisites

- **Node.js 22.22.3 or newer** (see `.nvmrc`; the Angular CLI refuses older versions). Cloud Functions run on Node 22.
- **JDK 21 or newer**, only for the Firestore emulator. On macOS: `brew install openjdk@21`, then `export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"`.
- Access to the Firebase project, only when you deploy. Local work needs no project and no login.

## Install

```sh
nvm use          # optional, picks the Node version from .nvmrc
npm install
```

The Firebase CLI is installed with the repository (`firebase-tools`), so there is nothing to install globally. Run it through npm scripts or `npx firebase ...`.

## Run locally

Developers work against the Firebase Emulator Suite and the `demo-klosers` project, which exists only inside the emulators, so local work never touches live data.

```sh
npm run emulators   # builds the functions and starts every emulator
npm run seed        # in a second terminal: loads the sample data
npm start           # Angular dev server at http://localhost:4200
```

| Service     | Address                                                                          |
| ----------- | -------------------------------------------------------------------------------- |
| Emulator UI | http://127.0.0.1:4000                                                            |
| Auth        | 127.0.0.1:9099                                                                   |
| Firestore   | 127.0.0.1:8080                                                                   |
| Functions   | 127.0.0.1:5005, smoke test `ping` at `/demo-klosers/us-central1/ping`            |
| Hosting     | http://127.0.0.1:5002, serving `apps/web/dist/web/browser` after `npm run build` |
| Storage     | 127.0.0.1:9199                                                                   |

The Functions emulator uses port 5005 and Hosting 5002 instead of the usual 5001 and 5000, which Cisco AnyConnect and the macOS AirPlay receiver often hold. The Functions emulator runs the built code in `functions/lib`, so rebuild after changing a function (`npm run build --workspace functions`).

Data is saved to `.emulator-data/` when you stop the emulators with Ctrl+C, and loaded on the next start. `npm run emulators:fresh` starts empty. Seeding again is safe: it resets the sample records without duplicating them. If you created an account in the Auth emulator with one of the sample emails, the seed replaces it.

To give the Functions emulator secret values, copy `functions/.secret.local.example` to `functions/.secret.local`. Git ignores that file.

## Sample accounts

Every seeded account signs in with the password `klosers-local-123`, in the emulators only.

| Role                          | Email                       | Teams                                |
| ----------------------------- | --------------------------- | ------------------------------------ |
| Administrador (`admin`)       | admin@klosers.test          | None                                 |
| Líder de equipo (`team_lead`) | camila.flores@klosers.test  | Corporativo                          |
| Líder de equipo (`team_lead`) | valentina.cruz@klosers.test | Pymes                                |
| Vendedor (`member`)           | sofia.rojas@klosers.test    | Corporativo                          |
| Vendedor (`member`)           | mariana.vaca@klosers.test   | Corporativo and Pymes, primary Pymes |

The seed also creates the company settings (Bs by default, 6.96 Bs per $us, the seven pipeline stages and loss reasons), five services that each belong to one team, eight clients across the stages, and booking availability for three sellers. The data in `scripts/lib/seed-data.mjs` is type-checked against `shared/src`.

## Lint, format and checks

One command covers the whole repository (app, functions, shared types, scripts and config files):

```sh
npm run check    # ESLint + Prettier check + type check; run this before pushing
npm run fix      # ESLint --fix + Prettier --write
```

The pieces are also available on their own: `npm run lint`, `npm run format`, `npm run format:check`, `npm run typecheck`. ESLint uses one flat config at the root (`eslint.config.mjs`) with Angular rules scoped to `apps/web`, and Prettier settings live in `.prettierrc`.

## Build and test

```sh
npm run build            # Angular production build and Cloud Functions bundle
npm test                 # Angular unit tests
npm run test:emulators   # seed twice, check the data and sign-in, call ping
```

`npm run test:emulators` starts the emulators, seeds twice, checks the data against the data model in strict mode (exact totals, so no duplicates), checks that every account signs in with its role, and calls the `ping` function. `npm run seed:verify` runs the same checks against emulators you are already using; it checks only the seeded records, so your own test data is fine. The seed and check scripts refuse to run against anything but local emulators and a `demo-` project.

## Shared types

The data model from the planning document lives in [`shared/src`](shared/src) as types only, with no runtime code. Import it in the app or the functions with:

```ts
import type { Client, Role } from '@klosers/shared';
```

The `@klosers/shared` alias is set in `apps/web/tsconfig.json`, `functions/tsconfig.json` and `scripts/tsconfig.json`. Functions are bundled with esbuild before deploy, and `import type` is erased, so the functions package needs no extra dependency on `shared`. ESLint enforces `import type` in `functions` and `shared`.

## Tests and checks

| Command                  | What it does                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `npm run check`          | Lint, format check and typecheck                                                            |
| `npm test`               | Unit tests (Vitest)                                                                         |
| `npm run test:rules`     | Firestore rules tests (`firestore/tests`) against the Firestore emulator, which needs a JDK |
| `npm run test:emulators` | Starts every emulator, seeds twice, verifies the seed and calls the `ping` function         |
| `npm run build`          | Builds the app and the functions                                                            |

## CI/CD

GitHub Actions runs two workflows:

- **CI** (`.github/workflows/ci.yml`) runs on every pull request. The **Check** job runs lint, format check, typecheck, unit tests and the build. The **Emulator tests** job runs the rules tests and the emulator smoke test.
- **Deploy** (`.github/workflows/deploy.yml`) runs when a change merges to `main`. It repeats CI on the merged code, then deploys Hosting, Functions and the Firestore rules and indexes to `leadport-dev`.

Branch protection on `main` requires both CI jobs to pass before a merge. The deploy signs in with Workload Identity Federation and two GitHub secrets, `GCP_SERVICE_ACCOUNT` and `GCP_WORKLOAD_IDENTITY_PROVIDER`; no key is stored anywhere. The one-time setup is in [`docs/firebase-setup.md`](docs/firebase-setup.md).

## Deploy

Production deploys come from CI. Deploys go to the single Firebase project, `leadport-dev`, named `prod` in `.firebaserc`. The default project stays `demo-klosers`, so a command without `--project prod` can never reach it. If CI is down, an owner can deploy by hand:

```sh
npx firebase login
npm run deploy                # Hosting, Functions, Firestore and Storage rules and indexes
```

The predeploy hooks in `firebase.json` build the app and the functions first. CI leaves Storage out until the bucket exists (see [`docs/firebase-setup.md`](docs/firebase-setup.md)), so deploy the same way by hand:

```sh
npx firebase deploy --project prod --only hosting,functions,firestore
```

Rules and indexes in `firestore/` are deployed with the `firestore` target. The rules start from deny-all, so the app cannot read or write data until the rules for each collection are added. Add the rules tests for each collection to `firestore/tests/rules.test.mjs` in the same change.
