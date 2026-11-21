# Klosers CRM

Internal sales CRM for a Bolivian sales company, built with Angular, Tailwind and Firebase. The interface is in Spanish.

- [Planning document](docs/planning.md): scope, data model, permissions and roadmap.
- [Firebase project setup](docs/firebase-setup.md): one-time production steps.

## Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 22 | See `.nvmrc`. |
| npm | 10 or newer | Comes with Node.js. |
| Java | 21 or newer | Needed by the Firestore emulator. On macOS: `brew install openjdk@21`, then `export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"`. |

Local work needs no Firebase account or login: everything runs against the `demo-klosers` project, which exists only inside the emulators.

## Run locally

```bash
npm install          # installs the root tools and the functions package
npm run emulators    # builds the functions and starts every emulator
npm run seed         # in a second terminal: loads sample data
```

| Service | Address |
| --- | --- |
| Emulator UI | http://127.0.0.1:4000 |
| Auth | 127.0.0.1:9099 |
| Firestore | 127.0.0.1:8080 |
| Functions | 127.0.0.1:5005, health check at `/demo-klosers/us-central1/health` |
| Hosting | http://127.0.0.1:5002 (a placeholder page until the app exists) |
| Storage | 127.0.0.1:9199 |

The Functions emulator uses port 5005 instead of the usual 5001, which Cisco AnyConnect and other tools often hold.

Data is saved to `.emulator-data/` when you stop the emulators with Ctrl+C, and loaded on the next start. `npm run emulators:fresh` starts empty. Seeding again is safe: it resets the sample records without duplicating them. If you created an account in the Auth emulator with one of the sample emails, the seed replaces it.

## Sample accounts

Every seeded account signs in with the password `klosers-local-123`, in the emulators only.

| Role | Email | Teams |
| --- | --- | --- |
| Administrador | admin@klosers.test | None |
| Líder de equipo | camila.flores@klosers.test | Corporativo |
| Líder de equipo | valentina.cruz@klosers.test | Pymes |
| Vendedor | sofia.rojas@klosers.test | Corporativo |
| Vendedor | mariana.vaca@klosers.test | Corporativo and Pymes, primary Pymes |

The seed also creates the company settings (Bs by default, 6.96 Bs per $us, the seven pipeline stages), five services that each belong to one team, eight clients across the stages, and booking availability for three sellers.

## Test

```bash
npm run test:emulators
```

This starts the emulators, seeds twice, checks the data against the data model in strict mode (exact totals, so no duplicates), checks that every account signs in with its role, and calls the health function.

`npm run seed:verify` runs the same checks against emulators you are already using; it checks only the seeded records, so your own test data is fine.

The seed and check scripts refuse to run against anything but local emulators and a `demo-` project.

## Project layout

| Path | What it holds |
| --- | --- |
| `firebase.json`, `.firebaserc` | Firebase configuration and emulator ports; `prod` names the production project. |
| `firestore.rules`, `storage.rules` | Security rules. Both deny everything until P1-01. |
| `firestore.indexes.json` | Firestore indexes. |
| `functions/` | Cloud Functions in TypeScript. The region lives in `functions/src/config.ts`, and the API secrets in `functions/src/secrets.ts`. |
| `scripts/` | Emulator launcher, seed, seed check and health check. |
| `web/placeholder/` | The page Hosting serves until the Angular app exists (P0-06). |

To give the Functions emulator secret values, copy `functions/.secret.local.example` to `functions/.secret.local`. Git ignores that file.
