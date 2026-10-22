// Builds preview/out/batch-<n>.html: each batch icon at 16/32/64px on the
// sidebar, selection and cream surfaces; a true-pixel 16px enlargement; and a
// mock Explorer tree. Per-batch content lives in `configs` below.
// Run: node scripts/preview-batch.mjs <batch number>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const n = process.argv[2] ?? "1";
const read = (rel) => readFileSync(join(root, rel), "utf8");
const theme = JSON.parse(read("themes/honeywood-picture-book.json")).colors;
// Icon references: "@name" = packaged sample (icons/svg), "b<k>:name" = batch k,
// plain "name" = the batch being previewed.
const icon = (ref) => {
  if (ref.startsWith("@")) return read(`icons/svg/${ref.slice(1)}.svg`);
  const m = /^b([\w-]+):(.*)$/.exec(ref);
  return read(m ? `icons/batches/batch-${m[1]}/${m[2]}.svg` : `icons/batches/batch-${n}/${ref}.svg`);
};
const label = (ref) =>
  ref.replace(/^@|^b[\w-]+:/, "") + ".svg" +
  (ref.startsWith("@") ? " (approved sample)" : /^b[\w-]+:/.test(ref) ? ` (batch ${ref.slice(1, ref.indexOf(":"))})` : "");

// A mock Explorer panel whose icons are rasterised to a true 16x16 bitmap
// (as at 100% display scaling) and shown at `scale` x with crisp pixels.
// `swap` maps a tree icon reference to an alternative.
const rasterTree = (title, rows, swap = {}, scale = 1) => {
  const sw = (r) => swap[r] ?? r;
  const body = rows.map(([depth, ic, text, state]) => {
    const svg = icon(sw(ic));
    return `<div class="tr${state ? " sel" : ""}" style="padding-left:${(10 + depth * 16) * scale}px;height:${22 * scale}px;font-size:${13 * scale}px;gap:${6 * scale}px"><canvas class="t16" data-svg="${encodeURIComponent(svg)}" width="16" height="16" style="width:${16 * scale}px;height:${16 * scale}px"></canvas>${text}</div>`;
  }).join("");
  return `<div class="explorer raster" style="width:${220 * scale}px"><div class="hdr" style="font-size:${11 * scale}px">${title}</div>${body}</div>`;
};
// Same tree at true 16px and enlarged 2x, for each option.
const treeRow = (rows, options) =>
  `<div class="trees">${options.map(([t, swap]) => `<div class="tcol">${rasterTree(t, rows, swap, 1)}${rasterTree(t + " — enlarged 2×", rows, swap, 2)}</div>`).join("")}</div>`;

const surfaces = [
  ["Sidebar", theme["sideBar.background"]],
  ["Selected row", theme["list.activeSelectionBackground"]],
  ["Cream", theme["editor.background"]],
];
const sized = (svg) => [16, 32, 64].map((px) => `<span class="ic" style="width:${px}px;height:${px}px">${svg}</span>`).join("");
const isFolder = (ref) => ref.replace(/^@|^b[\w-]+:/, "").startsWith("folder-");
const openOf = (ref) => (ref === "@folder" ? "@folder-open" : isFolder(ref) ? `${ref}-open` : ref);
const strip16 = (refs) =>
  `<div class="strip">${refs.map((r) => `<span class="cell"><span class="pair"><span class="ti">${icon(r)}</span><span class="ti">${icon(openOf(r))}</span></span><small>${r.replace(/^@|^b[\w-]+:|^folder-/g, "")}</small></span>`).join("")}</div>`;

const configs = {
  1: {
    title: "Icon batch 1 — final (APPROVED)",
    cards: [
      ["folder-src", "src, source — leaf (enlarged; new open variant)"],
      ["folder-tests", "test, tests, __tests__, spec — acorn (enlarged; new open variant)"],
      ["folder-docs", "docs, doc — open storybook"],
      ["folder-assets", "assets, images, img, media — hill and sun"],
      ["folder-config", "config, .vscode, .github, settings — gear, deeper powder blue (owner choice)"],
      ["javascript", ".js .mjs .cjs .jsx, languages javascript + javascriptreact — drawn “JS” (JSX: owner choice C)"],
      ["@typescript", "Approved sample, shown for reference: .ts .mts .cts .tsx, languages typescript + typescriptreact (TSX: owner choice C)"],
      ["json", ".json .jsonc, language json — braces"],
      ["markdown", ".md .markdown, language markdown — M with down arrow"],
      ["image", ".png .jpg .jpeg .gif .webp .svg .ico — hill and sun"],
    ],
    tree: [
      [0, "folder-src-open", "src"],
      [1, "@typescript", "garden-map.ts"],
      [1, "@typescript", "StoryCard.tsx"],
      [1, "javascript", "lanterns.js"],
      [1, "javascript", "Meadow.jsx", "selected"],
      [1, "@python", "reading_log.py"],
      [0, "folder-docs-open", "docs"],
      [1, "markdown", "getting-started.md"],
      [1, "image", "map-of-the-grove.png"],
      [0, "folder-config-open", ".vscode"],
      [1, "json", "settings.json"],
      [0, "folder-assets", "assets"],
      [0, "folder-tests", "tests"],
      [0, "@folder", "notes"],
      [0, "markdown", "README.md"],
      [0, "json", "package.json"],
      [0, "@file", "ideas.txt"],
    ],
    notes: "Folders show the category tints: <i>sage</i> = source, <i>blush</i> = content (docs, assets), <i>deeper powder</i> = tooling (config), <i>butter</i> = tests and plain folders. Files: “py” and “TS” are the approved samples; .tsx uses TS and .jsx uses JS (your choice C). Rows without a batch icon use the existing default file and folder icons.",
    extra: () => `<h2>Your choices, applied</h2><table class="applied"><tr><th>Decision</th><th>Applied as</th><th>16px</th></tr>
<tr><td>TSX: option C, plain TS letters</td><td>.tsx and typescriptreact map to <code>typescript.svg</code></td><td><span class="ti">${icon("@typescript")}</span></td></tr>
<tr><td>JSX: option C, plain JS letters</td><td>.jsx and javascriptreact map to <code>javascript.svg</code></td><td><span class="ti">${icon("javascript")}</span></td></tr>
<tr><td>Config folder: deeper powder blue</td><td><code>folder-config.svg</code> / <code>folder-config-open.svg</code> (#B8D0E9 / #D3E3F3)</td><td><span class="ti">${icon("folder-config")}</span> <span class="ti">${icon("folder-config-open")}</span></td></tr>
</table>`,
  },
  2: {
    title: "Icon batch 2 — final folder set (owner choices 1A, 2A, 3A applied), for approval",
    cards: [
      ["folder-public", "public, static, www — daisy · blush (content)"],
      ["folder-components", "components, ui, widgets — honeycomb cells · sage (source)"],
      ["folder-lib", "lib, libs, utils, util, helpers — garden trowel · sage (source)"],
      ["folder-scripts", "scripts, bin — upright feather (1A) · sage (source)"],
      ["folder-dist", "dist, build, out, release — woven basket · apricot (3A)"],
      ["folder-node-modules", "node_modules, vendor, bower_components — two side-on logs (2A) · dimmed parchment"],
      ["folder-git", ".git — branching twig · heather (3A)"],
    ],
    tree: [
      [0, "folder-git", ".git"],
      [0, "b1:folder-config", ".vscode"],
      [0, "folder-dist-open", "dist"],
      [1, "b1:javascript", "grove.bundle.js"],
      [0, "folder-node-modules", "node_modules"],
      [0, "folder-public-open", "public"],
      [1, "b1:image", "favicon.png"],
      [1, "@file", "index.html"],
      [0, "folder-scripts", "scripts"],
      [0, "b1:folder-src-open", "src"],
      [1, "folder-components-open", "components"],
      [2, "@typescript", "StoryCard.tsx", "selected"],
      [2, "@typescript", "MapPanel.tsx"],
      [1, "folder-lib", "lib"],
      [1, "@typescript", "garden-map.ts"],
      [0, "b1:folder-assets", "assets"],
      [0, "b1:folder-docs", "docs"],
      [0, "b1:folder-tests", "tests"],
      [0, "@folder", "notes"],
      [0, "b1:markdown", "README.md"],
      [0, "b1:json", "package.json"],
    ],
    notes: "All 13 Tier 1 folder icons appear here: the default folder, batch 1 (src, tests, docs, assets, config) and batch 2 (.git, dist, node_modules, public, scripts, components, lib). Files use approved icons; <code>index.html</code> still uses the default file icon (HTML comes in a later batch).",
    extra: () => {
      // Every folder appears both closed and open in this realistic tree.
      const t16 = [
        [0, "folder-git", ".git"],
        [0, "b1:folder-config", ".vscode"],
        [0, "b1:folder-config-open", ".github"],
        [1, "b1:json", "dependabot.json"],
        [0, "folder-dist", "build"],
        [0, "folder-dist-open", "dist"],
        [1, "b1:javascript", "grove.bundle.js"],
        [0, "folder-node-modules", "node_modules"],
        [0, "folder-node-modules-open", "vendor"],
        [1, "@file", "lantern.min.js"],
        [0, "folder-public-open", "public"],
        [1, "b1:image", "favicon.png"],
        [0, "folder-scripts", "bin"],
        [0, "folder-scripts-open", "scripts"],
        [1, "@file", "release.sh"],
        [0, "b1:folder-src-open", "src"],
        [1, "folder-components", "ui"],
        [1, "folder-components-open", "components"],
        [2, "@typescript", "StoryCard.tsx", "selected"],
        [1, "folder-lib", "utils"],
        [1, "folder-lib-open", "lib"],
        [2, "@typescript", "garden-map.ts"],
        [0, "b1:folder-assets-open", "assets"],
        [1, "b1:image", "map-of-the-grove.png"],
        [0, "b1:folder-docs-open", "docs"],
        [1, "b1:markdown", "getting-started.md"],
        [0, "b1:folder-tests-open", "tests"],
        [1, "@python", "test_totals.py"],
        [0, "@folder", "notes"],
        [0, "b1:markdown", "README.md"],
        [0, "b1:json", "package.json"],
      ];
      const all = ["@folder", "b1:folder-tests", "b1:folder-src", "folder-components", "folder-lib", "folder-scripts", "b1:folder-docs", "b1:folder-assets", "folder-public", "b1:folder-config", "folder-dist", "folder-git", "folder-node-modules"];
      return `<h2>Final folder set — realistic tree at true 16px</h2>
<p class="lede">Icons rasterised to true 16×16 bitmaps (as VS Code shows them at 100% display scaling), with a 2× enlarged copy. Every Tier 1 folder appears closed and open.</p>
${treeRow(t16, [["Final folder set", {}]])}
<h2>The whole Tier 1 folder set at 16px (closed · open)</h2>
<p class="lede">Grouped by tint: butter (default, tests), sage (src, components, lib, scripts), blush (docs, assets, public), powder (config), apricot (dist), heather (.git), parchment (node_modules).</p>${strip16(all)}`;
    },
  },
};

configs[3] = {
  title: "Icon batch 3 — Tier 1 file icons, web + config group (APPROVED)",
  cards: [
    ["html", ".html .htm .xhtml — angle brackets &lt;&gt; · apricot"],
    ["css", ".css — hash mark · heather"],
    ["scss", ".scss .sass — plain S · blush (owner choice)"],
    ["yaml", ".yaml .yml — drawn “Y” · sage"],
    ["config", ".toml .ini .cfg .conf .properties — chunky gear · deeper powder #B8D0E9 (owner choice A)"],
    ["xml", ".xml .xsd .xsl — &lt;/&gt; · sage"],
    ["shell", ".sh .bash .zsh .fish, .bashrc .zshrc .profile — &gt;_ · parchment"],
    ["env", ".env, .env.local/.development/.production/.example — horizontal key · butter #F5E8B5 (owner choice A)"],
  ],
  tree: [
    [0, "b2:folder-git", ".git"],
    [0, "b1:folder-config-open", ".github"],
    [1, "yaml", "ci.yml"],
    [0, "b2:folder-public-open", "public"],
    [1, "html", "index.html"],
    [1, "b1:image", "favicon.png"],
    [0, "b2:folder-scripts-open", "scripts"],
    [1, "shell", "deploy.sh"],
    [0, "b1:folder-src-open", "src"],
    [1, "b2:folder-components", "components"],
    [1, "b1:folder-assets-open", "styles"],
    [2, "css", "reset.css"],
    [2, "scss", "theme.scss", "selected"],
    [1, "@typescript", "main.ts"],
    [1, "@python", "seed_data.py"],
    [1, "xml", "sitemap.xml"],
    [0, "env", ".env"],
    [0, "env", ".env.example"],
    [0, "config", "setup.cfg"],
    [0, "config", "netlify.toml"],
    [0, "yaml", "docker-compose.yml"],
    [0, "b1:json", "package.json"],
    [0, "b1:markdown", "README.md"],
  ],
  notes: "Final approved batch 3. (<code>styles</code> borrows the assets folder icon here for realism.)",
  extra: () => {
    const files = ["@python", "@typescript", "b1:javascript", "b1:json", "b1:markdown", "b1:image", "html", "css", "scss", "yaml", "config", "xml", "shell", "env", "@file"];
    const strip = `<div class="strip">${files.map((r) => `<span class="cell"><span class="ti">${icon(r)}</span><small>${r.replace(/^@|^b[\w-]+:/, "")}</small></span>`).join("")}</div>`;
    return `<h2>Realistic tree at true 16px</h2>
<p class="lede">Icons rasterised to true 16×16 bitmaps (as VS Code shows them at 100% display scaling), with a 2× enlarged copy.</p>
${treeRow(configs[3].tree, [["Final batch 3", {}]])}
<h2>All file icons so far at 16px</h2>${strip}`;
  },
};

configs[4] = {
  title: "Icon batch 4 — remaining 17 Tier 1 file icons (APPROVED)",
  cards: [
    ["csharp", ".cs .csx, language csharp — single “C” · deeper blush (owner choice; C/C++ keeps “C” on heather)"],
    ["java", ".java .jar .class, language java — “J” · blush"],
    ["go", ".go, language go — “Go” · powder"],
    ["rust", ".rs, language rust — “Rs” · parchment"],
    ["c", ".c .h .cpp .cc .cxx .hpp .hh, languages c + cpp — “C” · heather"],
    ["powershell", ".ps1 .psm1 .psd1, language powershell — “PS” · deeper powder"],
    ["sql", ".sql, language sql — database cylinder · sage"],
    ["text", ".txt .log .text, language plaintext + log — ruled lines · cream"],
    ["pdf", ".pdf — red lower band · cream"],
    ["readme", "README, README.md, README.txt (file names) — “i” in a circle · cream"],
    ["license", "LICENSE, LICENSE.md, LICENCE, COPYING (file names) — wax seal · cream"],
    ["font", ".ttf .otf .woff .woff2 .eot — drawn “A” · butter"],
    ["archive", ".zip .tar .gz .tgz .7z .rar .bz2 .xz — parcel and string · apricot"],
    ["gitignore", ".gitignore .gitattributes .gitmodules .gitkeep — .git twig · heather"],
    ["lock", "package-lock.json, yarn.lock, pnpm-lock.yaml, poetry.lock, Cargo.lock, Gemfile.lock, composer.lock, go.sum, *.lock — padlock · parchment"],
    ["package", "package.json, pyproject.toml, requirements.txt, Cargo.toml, go.mod, composer.json, Gemfile, pom.xml, build.gradle — crate · cream"],
    ["docker", "Dockerfile, *.dockerfile, docker-compose.yml/yaml, compose.yml/yaml, .dockerignore — light ribbed container · deeper powder"],
  ],
  tree: [
    [0, "b2:folder-git", ".git"],
    [0, "b2:folder-dist", "dist"],
    [0, "b2:folder-node-modules", "node_modules"],
    [0, "b2:folder-scripts-open", "scripts"],
    [1, "b3:shell", "build.sh"],
    [1, "powershell", "setup.ps1"],
    [0, "b1:folder-src-open", "src"],
    [1, "csharp", "Lantern.cs"],
    [1, "java", "Meadow.java"],
    [1, "go", "trail.go"],
    [1, "rust", "burrow.rs"],
    [1, "c", "acorn.c"],
    [1, "c", "acorn.h"],
    [1, "sql", "schema.sql", "selected"],
    [1, "@python", "app.py"],
    [0, "b1:folder-assets-open", "assets"],
    [1, "font", "Storybook-Serif.woff2"],
    [1, "archive", "sprites.zip"],
    [1, "b1:image", "cover.png"],
    [0, "b1:folder-docs-open", "docs"],
    [1, "pdf", "field-guide.pdf"],
    [1, "text", "changes.log"],
    [0, "b2:folder-public", "public"],
    [0, "b1:folder-tests", "tests"],
    [0, "b3:env", ".env"],
    [0, "gitignore", ".gitignore"],
    [0, "docker", "Dockerfile"],
    [0, "docker", "docker-compose.yml"],
    [0, "package", "package.json"],
    [0, "lock", "package-lock.json"],
    [0, "package", "pyproject.toml"],
    [0, "readme", "README.md"],
    [0, "license", "LICENSE"],
    [0, "text", "notes.txt"],
  ],
  notes: "Batch 4 icons are shown with approved batch 1–3 folders and files. Mapping note for integration (M2): file-name mappings (README, LICENSE, package.json, lock files, Dockerfile, compose files) take priority over extension mappings in VS Code, so <code>package.json</code> shows the crate and <code>docker-compose.yml</code> the container instead of the JSON/YAML icons.",
  extra: () => {
    const files = ["@python", "@typescript", "b1:javascript", "b3:html", "b3:css", "b3:scss", "csharp", "java", "go", "rust", "c", "powershell", "b3:shell",
      "b1:json", "b3:yaml", "b3:xml", "b3:config", "b3:env", "sql", "b1:markdown", "text", "pdf", "readme", "license", "b1:image", "font", "archive", "gitignore", "lock", "package", "docker", "@file"];
    const strip = `<div class="strip">${files.map((r) => `<span class="cell"><span class="ti">${icon(r)}</span><small>${r.replace(/^@|^b[\w-]+:/, "")}</small></span>`).join("")}</div>`;
    return `<h2>Realistic tree at true 16px</h2>
<p class="lede">Icons rasterised to true 16×16 bitmaps (as VS Code shows them at 100% display scaling), with a 2× enlarged copy.</p>
${treeRow(configs[4].tree, [["Polyglot project", {}]])}
<h2>The complete Tier 1 file set at 16px</h2>
<p class="lede">Samples, batches 1 and 3, and batch 4, grouped roughly as code · data · documents · media · tooling, ending with the default file.</p>${strip}`;
  },
};

const cfg = configs[n];
if (!cfg) throw new Error(`no preview config for batch ${n}`);

const cardHtml = cfg.cards.map(([ref, mapping]) => {
  const variants = isFolder(ref) && !ref.startsWith("@") ? [ref, `${ref}-open`] : [ref];
  const rows = variants.map((v) =>
    surfaces.map(([lbl, bg]) => `<div class="row" style="background:${bg}"><span class="lbl">${lbl}${v.endsWith("-open") ? " · open" : ""}</span>${sized(icon(v))}</div>`).join(""),
  ).join("");
  const px = variants.map((v) => `<canvas class="px" data-svg="${encodeURIComponent(icon(v))}" width="16" height="16"></canvas>`).join("");
  return `<div class="card"><div class="name">${label(ref)}</div>${rows}<div class="pxrow"><span class="lbl">True 16px pixels, enlarged ×5</span>${px}</div><p>${mapping}</p></div>`;
}).join("");

const treeHtml = (cfg.tree ?? []).map(([depth, ic, text, state]) =>
  `<div class="tr${state ? " sel" : ""}" style="padding-left:${10 + depth * 16}px"><span class="ti">${icon(ic)}</span>${text}</div>`).join("");

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Icon Batch ${n}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #DCEAF7; color: #403A36; font: 15px/1.5 Georgia, serif; }
  main { max-width: 1500px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 26px; margin: 0 0 4px; } h2 { font-size: 20px; margin: 32px 0 10px; }
  .lede { color: #655C55; margin: 0 0 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 12px; }
  .card { background: #FFF9F0; border: 1px solid #C5D8EB; border-radius: 10px; padding: 10px; }
  .name { font: 600 13px Consolas, monospace; margin-bottom: 6px; }
  .row, .pxrow { display: flex; align-items: center; gap: 14px; padding: 4px 8px; border-radius: 6px; margin-bottom: 4px; min-height: 40px; }
  .pxrow { background: #FFF9F0; border: 1px dashed #E8DECF; }
  .lbl { width: 108px; font: 12px "Segoe UI", sans-serif; color: #655C55; flex: none; }
  .ic { display: inline-block; flex: none; } .ic svg { width: 100%; height: 100%; display: block; }
  canvas.px { width: 80px; height: 80px; image-rendering: pixelated; background: ${theme["sideBar.background"]}; border-radius: 4px; }
  .card p { margin: 6px 2px 0; font-size: 13px; color: #655C55; }
  .explorer-wrap { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
  .explorer { width: 300px; background: ${theme["sideBar.background"]}; color: ${theme["sideBar.foreground"]}; border: 1px solid ${theme["sideBar.border"]}; border-radius: 8px; padding: 6px 0 10px; font: 13px "Segoe UI", system-ui, sans-serif; }
  .explorer .hdr { padding: 4px 12px 6px; font-size: 11px; letter-spacing: .05em; }
  .tr { display: flex; align-items: center; gap: 6px; height: 22px; }
  .tr.sel { background: ${theme["list.activeSelectionBackground"]}; outline: 1px solid ${theme["list.focusOutline"]}; outline-offset: -1px; }
  .ti { width: 16px; height: 16px; flex: none; } .ti svg { width: 16px; height: 16px; display: block; }
  h3 { font-size: 16px; margin: 22px 0 8px; }
  .cmp { display: grid; gap: 12px; overflow-x: auto; }
  @media (max-width: 1000px) { .cmp { grid-template-columns: 1fr !important; } }
  .applied { border-collapse: collapse; background: #FFF9F0; border-radius: 10px; overflow: hidden; font-size: 14px; }
  .applied th, .applied td { padding: 6px 12px; border-bottom: 1px solid #E8DECF; text-align: left; vertical-align: middle; }
  .applied th { background: #D0E2F3; } .applied .ti { display: inline-block; vertical-align: middle; }
  .explorer.mini { width: auto; margin-top: 6px; padding: 4px 0; }
  .strip { display: flex; flex-wrap: wrap; gap: 6px; background: ${theme["sideBar.background"]}; border: 1px solid ${theme["sideBar.border"]}; border-radius: 8px; padding: 10px; }
  .strip .cell { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100px; padding: 6px 0; }
  .strip .pair { display: flex; gap: 6px; } .strip small { font: 11px "Segoe UI", sans-serif; color: #403A36; }
  .trees { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; }
  .tcol { display: flex; flex-direction: column; gap: 10px; }
  .explorer.raster .tr { display: flex; align-items: center; }
  canvas.t16 { image-rendering: pixelated; flex: none; }
  .notes { max-width: 640px; background: #FFF9F0; border: 1px solid #C5D8EB; border-radius: 10px; padding: 10px 16px; font-size: 14px; }
</style></head><body><main>
<h1>${cfg.title}</h1>
<p class="lede">Original SVGs on the approved style: 2.0 outline, 1.8 emblem outline, 2.3 letters, warm ink. Not packaged and not yet wired into the icon theme.</p>
${cfg.noTree ? "" : `<h2>Mock Explorer (16px, Picture Book sidebar)</h2>
<div class="explorer-wrap"><div class="explorer"><div class="hdr">EXPLORER — GROVE-APP</div>${treeHtml}</div>
<div class="notes"><b>Reading the tree</b><br>${cfg.notes}</div></div>`}
${cfg.extra()}
<h2>Icons at 16 / 32 / 64 px</h2>
<div class="grid">${cardHtml}</div>
<script>
  document.querySelectorAll("canvas.px, canvas.t16").forEach((c) => {
    const img = new Image();
    img.onload = () => { const g = c.getContext("2d"); g.drawImage(img, 0, 0, 16, 16); };
    img.src = "data:image/svg+xml;charset=utf-8," + c.dataset.svg;
  });
</script>
</main></body></html>`;

mkdirSync(join(root, "preview/out"), { recursive: true });
writeFileSync(join(root, `preview/out/batch-${n}.html`), page);
console.log(`wrote preview/out/batch-${n}.html`);
