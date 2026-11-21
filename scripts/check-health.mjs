// Calls the `ping` smoke-test function in the Functions emulator.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, emulatorConfig, useEmulators } from './lib/emulator-guard.mjs';

const { projectId } = useEmulators();
const config = readFileSync(path.join(ROOT, 'functions/src/config.ts'), 'utf8');
const region = config.match(/export const REGION\s*=\s*['"]([a-z0-9-]+)['"]/)?.[1];
if (!region) {
  console.error(
    'Health check failed: functions/src/config.ts must export REGION as a string literal.',
  );
  process.exit(1);
}
const { host, port } = emulatorConfig().functions;
const url = `http://${host}:${port}/${projectId}/${region}/ping`;

try {
  // Callable functions take a POST with a JSON body of the form { data }.
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: {} }),
    signal: AbortSignal.timeout(10000),
  });
  const body = /** @type {{ result?: { ok?: boolean } }} */ (await response.json());
  if (response.status !== 200 || body.result?.ok !== true) {
    throw new Error(`unexpected answer ${response.status} ${JSON.stringify(body)}`);
  }
  console.log(`Health check passed: ${url} answered ${JSON.stringify(body.result)}`);
} catch (error) {
  console.error(`Health check failed at ${url}: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
