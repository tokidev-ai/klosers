// Builds the functions, then starts every Firebase emulator against the local demo project.
// Data is saved to .emulator-data when you stop with Ctrl+C, and loaded on the next start.
// --fresh starts empty (and replaces the saved data when you stop).
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { DEMO_PROJECT_ID, ROOT } from "./lib/emulator-guard.mjs";

const DATA_DIR = path.join(ROOT, ".emulator-data");
const fresh = process.argv.includes("--fresh");
const shell = process.platform === "win32";

const build = spawnSync("npm", ["--prefix", "functions", "run", "build"], { cwd: ROOT, stdio: "inherit", shell });
if (build.status !== 0) process.exit(build.status ?? 1);

// On Windows the command runs through a shell, so quote paths that contain spaces.
const arg = (value) => (shell && /\s/.test(value) ? `"${value}"` : value);
const args = ["--no-install", "firebase", "emulators:start", "--project", DEMO_PROJECT_ID, "--export-on-exit", arg(DATA_DIR)];
if (!fresh && existsSync(path.join(DATA_DIR, "firebase-export-metadata.json"))) args.push("--import", arg(DATA_DIR));

const emulators = spawn("npx", args, { cwd: ROOT, stdio: "inherit", shell });
// Ctrl+C reaches the emulators directly; wait for them to save data and exit.
process.on("SIGINT", () => {});
process.on("SIGTERM", () => emulators.kill("SIGTERM"));
emulators.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
