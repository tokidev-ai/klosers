# Firebase project setup

This guide covers the production steps of P0-03 (#3) that need the owner of the Google and billing accounts: sub-issues #55, #56 and #57, and the deploy credentials for CI from P0-05 (#5). Local development needs none of this; see the [README](../README.md).

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

1. **Storage:** choose Get started and pick `us-central1`, the same region as the functions. Until the bucket exists, a plain `npx firebase deploy --project prod` fails on the Storage rules; deploy with `--only functions,firestore,hosting` instead. Storage rules live in `storage/storage.rules`.
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

## 4. Deploy credentials for GitHub Actions (#5)

`.github/workflows/deploy.yml` deploys to production when a change merges to `main`. It signs in to Google with Workload Identity Federation, so no service account key exists anywhere: GitHub proves to Google which repository and branch is running, and Google hands back a token that lasts a few minutes. Run these steps once, as the project owner.

```bash
PROJECT_ID=leadport-dev
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
REPO=tokidev-ai/klosers
SA=github-deployer

gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project="$PROJECT_ID"

# The account CI deploys as
gcloud iam service-accounts create "$SA" --display-name="GitHub Actions deployer" --project="$PROJECT_ID"
SA_EMAIL="$SA@$PROJECT_ID.iam.gserviceaccount.com"

# What a Hosting, Functions and Firestore deploy needs
for ROLE in roles/firebasehosting.admin roles/firebaserules.admin roles/datastore.indexAdmin \
            roles/cloudfunctions.admin roles/run.admin roles/artifactregistry.writer \
            roles/cloudbuild.builds.editor roles/secretmanager.viewer \
            roles/serviceusage.serviceUsageConsumer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" --role="$ROLE" --condition=None
done

# Let GitHub Actions runs from this repository, and only this one, act as that account
gcloud iam workload-identity-pools create github --location=global --project="$PROJECT_ID" \
  --display-name="GitHub Actions"
gcloud iam workload-identity-pools providers create-oidc github-oidc --location=global \
  --workload-identity-pool=github --project="$PROJECT_ID" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == '$REPO'"
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --project="$PROJECT_ID" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"
```

Then store the two values as GitHub secrets (Settings → Secrets and variables → Actions), or with `gh`:

```bash
gh secret set GCP_SERVICE_ACCOUNT --repo "$REPO" --body "$SA_EMAIL"
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --repo "$REPO" \
  --body "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github-oidc"
```

Neither value is a password, and neither can be used outside a run of this repository. Never add a service account key file to the repository or to a secret.

The role list is the usual set for these three deploy targets. If the first deploy fails with a permission error, the log names the missing role; add it to the loop above and run it again.

Also in GitHub, protect `main` so a failing check blocks the merge: Settings → Rules → New branch ruleset, target `main`, turn on "Require a pull request before merging" and "Require status checks to pass" with the checks **Check** and **Emulator tests**.

## Check

- `gcloud billing projects describe leadport-dev --format="value(billingEnabled)"` prints `True`.
- The Firebase console shows Storage and Hosting, both sign-in providers and App Check.
- `npx firebase functions:secrets:access BIRD_API_KEY --project prod` prints `pending`.
- The budget appears under Billing → Budgets & alerts.
- Merging a pull request starts the **Deploy** workflow, and it ends green.
