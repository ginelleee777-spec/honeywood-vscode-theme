// M3: renders the INTEGRATED icon theme (icons/honeywood-icon-theme.json +
// icons/svg/) as Explorer panels on both colour themes' sidebar colours, with
// icons resolved by the same rules as the mapping tests and rasterised to true
// 16x16 bitmaps. Output: preview/out/integration.html. Not a VS Code screenshot.
//   node scripts/build-integration-preview.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fileCases, folderCases, resolveFile, resolveFolder } from "./test-icon-mappings.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const iconTheme = JSON.parse(read("icons/honeywood-icon-theme.json"));
const svgOf = (id) => read(join("icons", iconTheme.iconDefinitions[id].iconPath));
const themes = ["picture-book", "quiet-ink"].map((t) => ({ id: t, colors: JSON.parse(read(`themes/honeywood-${t}.json`)).colors }));

const rows = [];
for (const [name, , , isRoot] of folderCases) {
  if (isRoot) continue;
  rows.push({ depth: 0, ...resolveFolder(name, false), label: name });
}
for (const [name, , , isRoot] of folderCases.filter(([n]) => ["src", "docs", "node_modules", ".git"].includes(n))) {
  rows.push({ depth: 0, ...resolveFolder(name, true, isRoot), label: `${name} (expanded)` });
}
for (const [name, , lang] of fileCases) rows.push({ depth: 0, ...resolveFile(name, lang), label: name + (lang ? ` [${lang}]` : "") });

const panel = (t, scale) => {
  const C = t.colors;
  const body = rows.map((r) =>
    `<div class="tr" style="height:${22 * scale}px;font-size:${13 * scale}px;gap:${6 * scale}px;padding-left:${10 * scale}px"><canvas class="t16" data-svg="${encodeURIComponent(svgOf(r.icon))}" width="16" height="16" style="width:${16 * scale}px;height:${16 * scale}px"></canvas><span>${r.label}</span><small style="color:${C["descriptionForeground"]};font-size:${11 * scale}px">${r.via}</small></div>`).join("");
  return `<div class="ex" style="background:${C["sideBar.background"]};color:${C["sideBar.foreground"]};border-color:${C["sideBar.border"]}"><div class="hdr">${t.id === "picture-book" ? "Picture Book" : "Quiet Ink"} sidebar · ${scale === 1 ? "true 16px" : "2×"}</div>${body}</div>`;
};

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Integration Preview</title>
<style>
  body { margin: 0; background: #DCEAF7; color: #403A36; font: 15px/1.5 Georgia, serif; }
  main { max-width: 1500px; margin: 0 auto; padding: 20px 16px 40px; }
  h1 { font-size: 24px; margin: 0 0 4px; } .lede { color: #655C55; margin: 0 0 12px; }
  .cols { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
  .ex { border: 1px solid; border-radius: 8px; padding: 6px 0; font-family: "Segoe UI", system-ui, sans-serif; min-width: 330px; }
  .hdr { font: 11px "Segoe UI", sans-serif; letter-spacing: .05em; padding: 2px 12px 6px; }
  .tr { display: flex; align-items: center; white-space: nowrap; } .tr small { margin-left: auto; padding-right: 10px; }
  canvas.t16 { image-rendering: pixelated; flex: none; }
</style></head><body><main>
<h1>Integrated icon theme — resolved mappings</h1>
<p class="lede">Every row's icon comes from the packaged icon theme JSON (not the batch folders), resolved by VS Code's precedence: file name &gt; extension &gt; language &gt; default. The grey note shows which rule matched. Rendered from true 16×16 bitmaps. This is a simulation, not a VS Code screenshot.</p>
<div class="cols">${panel(themes[0], 1)}${panel(themes[1], 1)}${panel(themes[0], 2)}</div>
<script>
document.querySelectorAll("canvas.t16").forEach((c) => { const i = new Image(); i.onload = () => c.getContext("2d").drawImage(i, 0, 0, 16, 16); i.src = "data:image/svg+xml;charset=utf-8," + c.dataset.svg; });
</script></main></body></html>`;
writeFileSync(join(root, "preview/out/integration.html"), page);
console.log(`wrote preview/out/integration.html (${rows.length} rows)`);
