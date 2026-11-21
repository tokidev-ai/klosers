import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { REGION } from "./config";

setGlobalOptions({ region: REGION, maxInstances: 10 });

/** Health check used by the emulator test and, later, by uptime checks. */
export const health = onRequest((_request, response) => {
  response.json({ status: "ok", service: "klosers-functions", region: REGION });
});
