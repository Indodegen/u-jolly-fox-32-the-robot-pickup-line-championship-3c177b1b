import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const text = readFileSync(join(here, "entry.txt"), "utf8");

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

if (text.length < 1 || text.length > 200) {
  fail(`entry must be 1-200 characters, got ${text.length}`);
}
if (text !== text.trim()) {
  fail("entry must not start or end with whitespace");
}
if (/[\n\r\u2028\u2029]/.test(text)) {
  fail("entry must be a single line");
}
if (/[\u0000-\u001F\u007F]/.test(text)) {
  fail("entry must not contain control characters");
}
if (/[\u200B\u200C\u200D\uFEFF]/.test(text)) {
  fail("entry must not contain invisible characters (U+200B/U+200C/U+200D/U+FEFF)");
}
// An entry with no letters at all is not a pickup line — reject digits-only,
// punctuation-only, and whitespace-only entries instead of passing them on.
if (!/[A-Za-z]/.test(text)) {
  fail("entry must contain at least one letter");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), text, "utf8");

// Verify the write landed intact: a truncated or partial write must fail loudly.
const written = readFileSync(join(outDir, "entry.txt"), "utf8");
if (written !== text) {
  fail("output verification failed: written entry.txt differs from entry.txt");
}
