// Calls the health function in the Functions emulator.
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { ROOT, emulatorConfig, useEmulators } from "./lib/emulator-guard.mjs";

const { projectId } = useEmulators();
const builtConfig = path.join(ROOT, "functions/lib/config.js");
if (!existsSync(builtConfig)) {
  console.error("Health check failed: build the functions first with npm run build:functions.");
  process.exit(1);
}
const region = createRequire(import.meta.url)(builtConfig).REGION;
const { host, port } = emulatorConfig().functions;
const url = `http://${host}:${port}/${projectId}/${region}/health`;

try {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const body = await response.json();
  if (response.status !== 200 || body.status !== "ok") throw new Error(`unexpected answer ${response.status} ${JSON.stringify(body)}`);
  console.log(`Health check passed: ${url} answered ${JSON.stringify(body)}`);
} catch (error) {
  console.error(`Health check failed at ${url}: ${error.message}`);
  process.exit(1);
}
