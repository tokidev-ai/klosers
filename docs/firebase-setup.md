# Firebase project setup

This guide covers the production steps of P0-03 (#3) that need a person with access to the company's Google account and billing account: sub-issues #55, #56 and #57. Local development needs none of this; see the [README](../README.md).

There is one Firebase project, used for production only.

## Before you start

Decide these three things and write them down in the issue:

| Decision | Notes |
| --- | --- |
| Project ID | Permanent and visible in URLs, for example `klosers-crm`. |
| Region | Permanent. Firestore and Cloud Functions must use the same region, because Firestore triggers run in the database's region. The code proposes São Paulo, `southamerica-east1`. Santiago, `southamerica-west1`, is the other option near Bolivia. |
| Billing account | The company account that pays for the Blaze plan. |

If you pick a region other than `southamerica-east1`, change `REGION` in `functions/src/config.ts` before the first deploy.

You need the Firebase CLI from this repository (`npx firebase`) and the Google Cloud CLI (`gcloud`), both signed in with an account that can create projects and manage billing.

## 1. Create the project on the Blaze plan (#55)

```bash
PROJECT_ID=klosers-crm            # your chosen ID
REGION=southamerica-east1         # your chosen region
BILLING_ACCOUNT=XXXXXX-XXXXXX-XXXXXX  # from: gcloud billing accounts list

npx firebase projects:create "$PROJECT_ID" --display-name "Klosers CRM"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT"
gcloud firestore databases create --project="$PROJECT_ID" --location="$REGION"
npx firebase apps:create WEB "Klosers web" --project "$PROJECT_ID"
```

Then, in the [Firebase console](https://console.firebase.google.com/):

1. **Storage:** open Storage, choose Get started, and pick the same region.
2. **Hosting:** open Hosting and choose Get started.

Finally, set the production alias in `.firebaserc`, replacing `REPLACE-WITH-PRODUCTION-PROJECT-ID` with the project ID, and commit it. Deploys always name it explicitly, for example `npx firebase deploy --project prod`. The default project stays `demo-klosers`, so a deploy without `--project` can never reach production.

## 2. Sign-in providers and App Check (#56)

In the Firebase console:

1. **Authentication → Sign-in method:** enable Email/Password and Google. Note the company's email domain in #56; P1-02 limits Google sign-in to it.
2. **App Check:** register the web app with reCAPTCHA Enterprise and let the console create the site key. Record the site key in #56. Leave enforcement off until the app sends App Check tokens.

If the console asks, enable the reCAPTCHA Enterprise API:

```bash
gcloud services enable recaptchaenterprise.googleapis.com --project="$PROJECT_ID"
```

## 3. Budget alert and secrets (#57)

The paid-API budget decided in P0-01 is about $10 a month at launch. Set an alert at 50%, 90% and 100%:

```bash
gcloud services enable billingbudgets.googleapis.com --project="$PROJECT_ID"
gcloud billing budgets create \
  --billing-account="$BILLING_ACCOUNT" \
  --display-name="Klosers CRM" \
  --budget-amount=10USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9 \
  --threshold-rule=percent=1.0 \
  --filter-projects="projects/$PROJECT_ID"
```

Create the four secrets the functions declare in `functions/src/secrets.ts`. Type `pending` as the value until each account exists:

```bash
for SECRET in BIRD_API_KEY GOOGLE_PLACES_API_KEY OPENAI_API_KEY INSTAGRAM_ACCESS_TOKEN; do
  npx firebase functions:secrets:set "$SECRET" --project prod
done
```

Never put a real key in the repository, in `functions/.secret.local.example` or in an issue.

## Check

- `npx firebase projects:list` shows the project, and `.firebaserc` names it under `prod`.
- The Firebase console shows the Blaze plan, Firestore and Storage in the chosen region, Hosting, the web app, both sign-in providers and App Check.
- `npx firebase functions:secrets:access BIRD_API_KEY --project prod` prints `pending`.
- The budget appears under Billing → Budgets & alerts.
