// DRAFT Marketplace icon options (128x128), composed only from approved
// Honeywood icon artwork on a cream rounded tile with a soft powder-blue edge.
// Writes preview/marketplace-icon/option-*.svg and render-*.html for PNG export
// (scripts/render-marketplace-icon.ps1). Not packaged; not adopted until the
// owner approves one.   node scripts/design/marketplace-icon.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const out = join(root, "preview", "marketplace-icon");
mkdirSync(out, { recursive: true });

// Inner shapes of an approved 32x32 icon (everything inside the <svg> element).
const inner = (file) => readFileSync(join(root, "icons", "svg", file), "utf8").replace(/^<svg[^>]*>\n?/, "").replace(/<\/svg>\s*$/, "");

const tile = (art) => `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect x="4" y="4" width="120" height="120" rx="26" fill="#FFF9F0" stroke="#B8D0E9" stroke-width="4"/>
  <g transform="translate(16 15) scale(3)" fill="none" stroke="#403A36" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
${art}
  </g>
</svg>
`;

const options = {
  "a-leaf-folder": { file: "folder-src.svg", note: "Approved sage src folder with its leaf (recommended)" },
  "b-storybook-folder": { file: "folder-docs.svg", note: "Approved blush docs folder with its open storybook" },
};
for (const [id, o] of Object.entries(options)) {
  const svg = tile(inner(o.file));
  writeFileSync(join(out, `option-${id}.svg`), svg);
  writeFileSync(join(out, `render-${id}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`);
  console.log(`option ${id}: ${o.note}`);
}
