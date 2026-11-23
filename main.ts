// Starfall entry — main.ts (Node 22, standard library only).
//
// The entry itself is the X post: an AI agent built the Starfall game from
// one prompt, filmed it, and posted the video on X. This program does
// exactly one job: it copies POST.json (the post's address on X) from the
// repository root into the output directory, where the gate reads it.
// Nothing this program writes about the post is scored.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Inside the grader's sandbox the repository is mounted at /bot and the
// output directory is /output. Outside the sandbox, point both somewhere
// local with environment variables instead:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(botDir, "POST.json");
const target = join(outputDir, "POST.json");

mkdirSync(outputDir, { recursive: true });

let post: Buffer;
try {
  post = readFileSync(source);
} catch (err) {
  console.error(`could not read ${source}: ${(err as Error).message}`);
  process.exit(1);
}

// Fail loudly on a broken POST.json instead of copying an invalid entry:
// it must be a JSON object carrying a string url.
let parsed: unknown;
try {
  parsed = JSON.parse(post.toString("utf8"));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== "string"
) {
  console.error("POST.json must be a JSON object with a string url");
  process.exit(1);
}

writeFileSync(target, post);

// Read the copy back and check it matches byte for byte, so the two runs
// the grader makes always write the same bytes.
const written = readFileSync(target);
if (!written.equals(post)) {
  console.error(`wrote ${target} but the copy does not match ${source}`);
  process.exit(1);
}
console.log(`wrote ${target}`);
