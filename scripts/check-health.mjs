// Calls the health function in the Functions emulator.
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT, emulatorConfig, useEmulators } from "./lib/emulator-guard.mjs";

const { projectId } = useEmulators();
const config = readFileSync(path.join(ROOT, "functions/src/config.ts"), "utf8");
const region = config.match(/REGION\s*=\s*"([^"]+)"/)?.[1];
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
