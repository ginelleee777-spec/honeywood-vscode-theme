// Creates fixtures/icon-gallery/: an empty folder per tested folder name (each
// with one file inside, so it can be expanded) and an empty file per tested file
// name. Used for the visual check in the Extension Development Host. Not packaged.
//   node scripts/make-icon-gallery.mjs
// (.git is skipped: a real .git folder would turn the fixture into a nested repo,
// and VS Code hides .git from the Explorer by default anyway.)
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fileCases, folderCases } from "./test-icon-mappings.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "fixtures", "icon-gallery");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const seen = new Set();
let folders = 0;
for (const [name, , , isRoot] of folderCases) {
  const key = name.toLowerCase();
  if (isRoot || name === ".git" || seen.has(key)) continue; // case-insensitive file system
  seen.add(key);
  mkdirSync(join(out, name), { recursive: true });
  writeFileSync(join(out, name, "placeholder.txt"), "");
  folders++;
}
let files = 0;
for (const [name] of fileCases) {
  if (seen.has(name.toLowerCase())) continue;
  seen.add(name.toLowerCase());
  writeFileSync(join(out, name), "");
  files++;
}
console.log(`fixtures/icon-gallery: ${folders} folders, ${files} files`);
