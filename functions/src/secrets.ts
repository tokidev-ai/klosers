import { defineSecret } from "firebase-functions/params";

/**
 * API keys the functions will need, stored in Cloud Functions secrets (Secret Manager).
 * Values never live in the code or the app. Each one starts as a placeholder in
 * production (see docs/firebase-setup.md) and gets its real value when the account exists.
 * A function lists the secrets it uses in its options: `onRequest({ secrets: [birdApiKey] }, ...)`.
 */
export const birdApiKey = defineSecret("BIRD_API_KEY");
export const googlePlacesApiKey = defineSecret("GOOGLE_PLACES_API_KEY");
export const openAiApiKey = defineSecret("OPENAI_API_KEY");
export const instagramAccessToken = defineSecret("INSTAGRAM_ACCESS_TOKEN");

export const ALL_SECRETS = [birdApiKey, googlePlacesApiKey, openAiApiKey, instagramAccessToken];
