# Firebase project setup

This guide covers the production steps of P0-03 (#3) that need the owner of the Google and billing accounts: sub-issues #55, #56 and #57. Local development needs none of this; see the [README](../README.md).

There is one Firebase project: `leadport-dev`, display name **klosers**. The CLI reaches it as `--project prod` (see `.firebaserc`). The default project stays `demo-klosers`, so a command without `--project` can never reach it.

## State on 21 November 2026

| Item | State |
| --- | --- |
| Project | Created |
| Blaze plan | On |
| Firestore | Created in `nam5` (United States), Native mode |
| Functions region | `us-central1`, set in `functions/src/config.ts` to match `nam5` |
| Storage | No bucket yet |
| Hosting | Default site `leadport-dev` |
| Web app | Registered as "LeadPort Web" |
| Authentication | Not started |
| App Check | Not started |
| Secrets | All four created, with the value `pending` |
| Budget alert | $10 a month, alerts at 50%, 90% and 100% |

## Region

Firestore already exists in `nam5`, and a database location can never change. Firestore triggers must run in the database's region, so every function runs in `us-central1`. Calls from Bolivia take a little longer than they would to São Paulo, which is fine for about 5 users. A region in South America would need a new project.

## 1. Blaze plan, Storage and Hosting (#55)

Done: the Blaze plan and Hosting. Still to do: the Storage bucket.

Cloud Functions, Secret Manager and the Storage bucket all need the Blaze plan.

```bash
PROJECT_ID=leadport-dev
BILLING_ACCOUNT=XXXXXX-XXXXXX-XXXXXX   # from: gcloud billing accounts list

gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT"
```

Then, in the [Firebase console](https://console.firebase.google.com/project/leadport-dev):

1. **Storage:** choose Get started and pick `us-central1`, the same region as the functions.
2. **Hosting:** choose Get started.

## 2. Sign-in providers and App Check (#56)

In the Firebase console:

1. **Authentication:** choose Get started. Under Sign-in method, enable Email/Password and Google. Note the company's email domain in #56; P1-02 limits Google sign-in to it.
2. **App Check:** register the web app with reCAPTCHA Enterprise and let the console create the site key. Record the site key in #56. Leave enforcement off until the app sends App Check tokens.

If the console asks, enable the reCAPTCHA Enterprise API:

```bash
gcloud services enable recaptchaenterprise.googleapis.com --project="$PROJECT_ID"
```

## 3. Budget alert and secrets (#57)

Done: the budget alert and all four secrets. The commands stay here for reference.

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

Create the four secrets the functions declare in `functions/src/secrets.ts`. The CLI offers to enable Secret Manager the first time. Type `pending` as each value until its account exists:

```bash
for SECRET in BIRD_API_KEY GOOGLE_PLACES_API_KEY OPENAI_API_KEY INSTAGRAM_ACCESS_TOKEN; do
  npx firebase functions:secrets:set "$SECRET" --project prod
done
```

Never put a real key in the repository, in `functions/.secret.local.example` or in an issue.

## Check

- `gcloud billing projects describe leadport-dev --format="value(billingEnabled)"` prints `True`.
- The Firebase console shows Storage and Hosting, both sign-in providers and App Check.
- `npx firebase functions:secrets:access BIRD_API_KEY --project prod` prints `pending`.
- The budget appears under Billing → Budgets & alerts.
