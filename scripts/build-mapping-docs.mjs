// Generates docs/ICON-MAPPINGS.md from src/icon-map.mjs, so the documented
// mappings can never drift from the packaged icon theme.
//   node scripts/build-mapping-docs.mjs
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { folders, files } from "../src/icon-map.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const code = (xs) => (xs?.length ? xs.map((x) => "`" + x + "`").join(", ") : "—");
const label = (n) => n.replace(/^folder-/, "").replace(/-/g, " ");

let md = `# Honeywood icon mappings

Generated from \`src/icon-map.mjs\` by \`npm run docs:icons\` — do not edit by hand.

**How VS Code picks an icon** (most specific wins): exact file name → file extension (longest match first, e.g. \`tar.gz\` before \`gz\`) → language ID → default. Names are matched case-insensitively. Unknown files use the default file icon and unknown folders the default folder icon; the generic \`plaintext\` language is deliberately not mapped so unknown files keep the default.

## Folders (closed and open variants)

| Icon | Folder names |
|---|---|
| default folder | anything not listed below, and the workspace root |
`;
for (const [name, f] of Object.entries(folders)) md += `| ${label(name)} | ${code(f.names)} |\n`;

md += `
## Files

| Icon | File names (exact) | Extensions | Language IDs |
|---|---|---|---|
`;
for (const [name, f] of Object.entries(files)) {
  if (name === "file") {
    md += `| default file | — | anything not listed | — |\n`;
    continue;
  }
  md += `| ${name} | ${code(f.names)} | ${code(f.ext)} | ${code(f.lang)} |\n`;
}
md += `
## Known limitations

- Light theme only; there is no dark variant in v1.
- Tier 2 file types (for example Makefile, CSV, Ruby, PHP, Kotlin, Swift, Vue, Svelte, Jupyter notebooks) and folders such as \`i18n\` or \`data\` are not mapped yet and show the default icons.
- \`.tsx\` and \`.jsx\` deliberately reuse the TypeScript and JavaScript icons.
- A language ID only applies when no file name or extension matches; extension-less files are only recognised if VS Code itself detects their language.
`;
writeFileSync(join(root, "docs", "ICON-MAPPINGS.md"), md);
console.log("wrote docs/ICON-MAPPINGS.md");
