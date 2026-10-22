// Builds preview/out/index.html: both syntax styles side by side (rendered
// with Shiki from the real theme JSON), the syntax palette tables, and the
// sample icons. Run: npm run preview
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codeToHtml } from "shiki";
import { base, companion, ansi, syntax } from "../src/palette.mjs";
import { contrast } from "./lib/contrast.mjs";
import { createHash } from "node:crypto";
import { makeTheme, serialise } from "./build-themes.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

// Integrity: refuse to build from theme files that differ from what src/
// would generate now (i.e. a stale `npm run build`).
const themes = [
  { id: "quiet-ink", label: "Quiet Ink" },
  { id: "picture-book", label: "Picture Book" },
].map((t) => {
  const text = read(`themes/honeywood-${t.id}.json`);
  if (text.replace(/\r\n/g, "\n") !== serialise(makeTheme(t.id))) {
    throw new Error(`themes/honeywood-${t.id}.json is stale — run npm run build first`);
  }
  const sha = createHash("sha256").update(text).digest("hex").slice(0, 12);
  return { ...t, json: JSON.parse(text), sha };
});
const plainText = (html) =>
  html.replace(/<[^>]+>/g, "").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

// Same code for both styles. `errors` = substrings drawn with an error squiggle
// (VS Code draws these from diagnostics; Shiki has no diagnostics).
const samples = [
  { file: "fixtures/src/reading_log.py", lang: "python", errors: ["undefined_total"] },
  { file: "fixtures/src/garden-map.ts", lang: "typescript", errors: ['"twelve"'] },
  { file: "fixtures/story-card.html", lang: "html", errors: [] },
];

function decorations(code, needles) {
  const lines = code.split("\n");
  const out = [];
  for (const needle of needles) {
    lines.forEach((text, line) => {
      const character = text.indexOf(needle);
      if (character >= 0) {
        out.push({ start: { line, character }, end: { line, character: character + needle.length }, properties: { class: "squiggle" } });
      }
    });
  }
  return out;
}

let sampleHtml = "";
for (const s of samples) {
  // Normalise Windows CRLF so the identical-code check compares text, not line endings.
  const code = read(s.file).replace(/\r\n/g, "\n").replace(/\n$/, "");
  const cols = [];
  for (const t of themes) {
    const html = await codeToHtml(code, { lang: s.lang, theme: t.json, decorations: decorations(code, s.errors) });
    cols.push(`<div class="col"><div class="col-label">${t.label}</div>${html}</div>`);
    // Integrity: the rendered text must equal the fixture exactly.
    if (plainText(html) !== code) throw new Error(`${s.file}: ${t.label} rendering does not match the sample code`);
  }
  console.log(`identical code verified: ${s.file}`);
  sampleHtml += `<section><h3>${esc(s.file.replace("fixtures/", ""))}</h3><div class="pair">${cols.join("")}</div></section>`;
}

// Approximate Layout A mock-up built from the theme's own workbench colours.
// (Real VS Code screenshots: see docs/DEVELOPMENT.md for the isolated preview window.)
const iconSvg = (id) => read(join("icons", JSON.parse(read("icons/honeywood-icon-theme.json")).iconDefinitions[id].iconPath));
async function mock(t) {
  const C = t.json.colors;
  const code = read("fixtures/src/garden-map.ts").split("\n").slice(0, 26).join("\n");
  const html = await codeToHtml(code, { lang: "typescript", theme: t.json });
  const row = (depth, icon, name, extra = "") =>
    `<div class="tree-row" style="padding-left:${8 + depth * 14}px;${extra}"><span class="ti">${iconSvg(icon)}</span>${name}</div>`;
  const tree = [
    row(0, "_folder_open", "<b>FIXTURES</b>"),
    row(1, "_folder", "notes"),
    row(1, "_folder_src", "src"),
    row(2, "_typescript", "garden-map.ts", `background:${C["list.activeSelectionBackground"]};outline:1px solid ${C["list.focusOutline"]};outline-offset:-1px`),
    row(2, "_python", `<span style="color:${C["gitDecoration.modifiedResourceForeground"]}">reading_log.py</span>`),
    row(1, "_folder_tests", "tests"),
    row(1, "_file", "story-card.html"),
    row(1, "_file", `<span style="color:${C["gitDecoration.untrackedResourceForeground"]}">ideas.txt</span>`),
  ].join("");
  const A = (k) => C["terminal.ansi" + k];
  return `<div class="mock" style="background:${C["editor.background"]};color:${C.foreground};border-color:${C["titleBar.border"]}">
  <div class="m-title" style="background:${C["titleBar.activeBackground"]};color:${C["titleBar.activeForeground"]};border-color:${C["titleBar.border"]}">garden-map.ts — fixtures</div>
  <div class="m-body">
    <div class="m-act" style="background:${C["activityBar.background"]};border-color:${C["activityBar.border"]}">
      <span style="border-left:2px solid ${C["activityBar.activeBorder"]};color:${C["activityBar.foreground"]}">▤</span>
      <span style="color:${C["activityBar.inactiveForeground"]}">⌕</span><span style="color:${C["activityBar.inactiveForeground"]}">⑂</span>
    </div>
    <div class="m-side" style="background:${C["sideBar.background"]};border-color:${C["sideBar.border"]}">
      <div class="m-side-title">EXPLORER</div>${tree}
    </div>
    <div class="m-main">
      <div class="m-tabs" style="background:${C["editorGroupHeader.tabsBackground"]};border-color:${C["editorGroupHeader.tabsBorder"]}">
        <span class="m-tab" style="background:${C["tab.activeBackground"]};color:${C["tab.activeForeground"]};border-top:2px solid ${C["tab.activeBorderTop"]};border-right:1px solid ${C["tab.border"]}"><span class="ti">${iconSvg("_typescript")}</span>garden-map.ts</span>
        <span class="m-tab" style="background:${C["tab.inactiveBackground"]};color:${C["tab.inactiveForeground"]};border-top:2px solid transparent;border-right:1px solid ${C["tab.border"]}"><span class="ti">${iconSvg("_python")}</span>reading_log.py</span>
      </div>
      <div class="m-crumb" style="background:${C["breadcrumb.background"]};color:${C["breadcrumb.foreground"]}">src › garden-map.ts › GroveMap</div>
      <div class="m-code" style="--ln:${C["editorLineNumber.foreground"]};--lnA:${C["editorLineNumber.activeForeground"]};--hl:${C["editor.lineHighlightBackground"]};--sel:${C["editor.selectionBackground"]}">${html}</div>
      <div class="m-panel" style="background:${C["panel.background"]};border-color:${C["panel.border"]}">
        <div class="m-ptabs"><span style="border-bottom:1px solid ${C["panelTitle.activeBorder"]}">TERMINAL</span><span style="color:${C["panelTitle.inactiveForeground"]}">PROBLEMS</span></div>
        <pre style="color:${C["terminal.foreground"]}"><span style="color:${A("Blue")}">~/grove</span> <span style="color:${A("Magenta")}">(main)</span> $ npm test
<span style="color:${A("Green")}">✓ 12 passed</span>  <span style="color:${A("Yellow")}">! 1 warning</span>  <span style="color:${A("Red")}">✗ 1 failed</span>  <span style="color:${A("Cyan")}">src/garden-map.ts:62</span> <span style="color:${A("BrightBlack")}">(0.8s)</span></pre>
      </div>
    </div>
  </div>
  <div class="m-status" style="background:${C["statusBar.background"]};color:${C["statusBar.foreground"]};border-color:${C["statusBar.border"]}">
    <span style="background:${C["statusBarItem.remoteBackground"]};color:${C["statusBarItem.remoteForeground"]};padding:0 8px">⌁</span>
    <span>⑂ main</span><span>⊗ 1  ⚠ 0</span><span style="margin-left:auto">Ln 32, Col 5</span><span>TypeScript</span>
  </div>
</div>`;
}
let mockHtml = "";
for (const t of themes) mockHtml += `<h3>${t.label}</h3>${await mock(t)}`;

// Syntax palette tables (contrast on every surface code text sits on).
const W = themes[0].json.colors;
const bgs = {
  Cream: W["editor.background"],
  "Line highlight": W["editor.lineHighlightBackground"],
  "Selection (focused)": W["editor.selectionBackground"],
  "Selection (unfocused)": W["editor.inactiveSelectionBackground"],
  "Peek editor": W["peekViewEditor.background"],
};
const cell = (fg, bg) => {
  const r = contrast(fg, bg);
  return `<td class="${r >= 4.5 ? "ok" : "low"}">${r.toFixed(2)}</td>`;
};
const swatch = (hex) => `<span class="sw" style="background:${hex}"></span><code>${hex}</code>`;
const contrastRows = (entries) =>
  entries.map(([name, hex, use]) => `<tr><td><b>${name}</b></td><td>${swatch(hex)}</td><td>${use}</td>${Object.values(bgs).map((bg) => cell(hex, bg)).join("")}</tr>`).join("");
const head = `<tr><th>Name</th><th>Hex</th><th>Used for</th>${Object.keys(bgs).map((b) => `<th>${b}</th>`).join("")}</tr>`;
const quietRows = contrastRows([
  ["Berry", syntax.quiet.berry, "keywords incl. def/class/const; self/this; HTML tags"],
  ["Forest", syntax.quiet.forest, "strings"],
  ["Storybook blue", syntax.quiet.blue, "functions, decorators, CSS selectors"],
  ["Honey", syntax.quiet.honey, "numbers, constants, attributes, CSS values"],
  ["Warm ink", base.warmInk, "variables; types in bold; parameters in italic"],
  ["Comment", syntax.shared.comment, "comments (italic)"],
  ["Punctuation", syntax.shared.punctuation, "brackets, operators"],
]);
const pictureRows = contrastRows([
  ["Berry", syntax.picture.berry, "control flow: if/for/return/import; self/this; HTML tags"],
  ["Acorn", syntax.picture.acorn, "declarations: def/class/const/function/async"],
  ["Forest", syntax.picture.forest, "strings"],
  ["Storybook blue", syntax.picture.blue, "functions"],
  ["Honey", syntax.picture.honey, "numbers, constants, attributes, CSS values"],
  ["Heather", syntax.picture.heather, "types, classes, interfaces, CSS selectors"],
  ["Pond", syntax.picture.pond, "parameters (italic), CSS properties"],
  ["Thistle", syntax.picture.thistle, "decorators, escapes, regex"],
  ["Warm ink", base.warmInk, "variables, properties"],
  ["Comment", syntax.shared.comment, "comments (italic)"],
  ["Punctuation", syntax.shared.punctuation, "brackets, operators"],
]);
const pyCards = [
  ["Applied: option A, drawn “py” letters", "icons/svg/python.svg"],
  ["Previous: snake (kept for reference)", "icons/proposals/python-previous-snake.svg"],
  ["Proposal B — snake with a clear head", "icons/proposals/python-b-snake-head.svg"],
].map(([label, file]) => {
  const svg = read(file);
  const sizes = [16, 32, 64].map((px) => `<span style="width:${px}px;height:${px}px">${svg}</span>`).join("");
  const tree = `<div class="tree-row" style="padding-left:8px"><span class="ti">${svg}</span>reading_log.py</div><div class="tree-row" style="padding-left:8px"><span class="ti">${read("icons/svg/typescript.svg")}</span>garden-map.ts</div>`;
  return `<div class="icon-card"><div class="icon-row blue">${sizes}</div><div class="mini-tree">${tree}</div><b>${label}</b><p>${file}</p></div>`;
}).join("");
const ansiRows = Object.entries(ansi)
  .map(([k, hex]) => `<span class="ansi"><span class="sw" style="background:${hex}"></span>${k} <code>${hex}</code> ${/white$/i.test(k) ? "<i>bg use</i>" : contrast(hex, base.cream).toFixed(2)}</span>`)
  .join("");

// Icons.
const iconTheme = JSON.parse(read("icons/honeywood-icon-theme.json"));
const mapping = {
  _folder: "Any folder (closed); also workspace root",
  _folder_open: "Any folder (expanded)",
  _folder_src: "src, source — leaf (growing things)",
  _folder_tests: "test, tests, __tests__, spec — acorn",
  _python: ".py .pyi .pyw, language python — drawn “py” letters",
  _typescript: ".ts .mts .cts, language typescript — drawn “TS” letters",
  _file: "Fallback for any unmapped file",
};
const iconCards = Object.entries(iconTheme.iconDefinitions)
  .map(([id, d]) => {
    const svg = read(join("icons", d.iconPath));
    const sizes = [16, 32, 64].map((px) => `<span style="width:${px}px;height:${px}px">${svg}</span>`).join("");
    return `<div class="icon-card"><div class="icon-row blue">${sizes}</div><div class="icon-row cream">${sizes}</div><b>${d.iconPath.replace("./svg/", "")}</b><p>${mapping[id]}</p></div>`;
  })
  .join("");

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Honeywood Preview</title>
<style>
  :root { color-scheme: light; --cream:${base.cream}; --powder:${base.powderBlue}; --ink:${base.warmInk}; --muted:${companion.mutedInk}; --line:#E8DECF; --brick:${companion.brick}; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--powder); color: var(--ink); font: 15px/1.5 Georgia, "Iowan Old Style", serif; }
  main { max-width: 1500px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 28px; margin: 0 0 4px; } h2 { font-size: 21px; margin: 40px 0 8px; } h3 { font: 600 14px/1.4 ui-monospace, Consolas, monospace; margin: 24px 0 8px; }
  .lede { color: var(--muted); margin: 0 0 8px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 900px) { .pair { grid-template-columns: 1fr; } }
  .col { min-width: 0; border: 1px solid #C5D8EB; border-radius: 10px; overflow: hidden; background: var(--cream); }
  .col-label { padding: 6px 12px; background: #D0E2F3; font-weight: 600; border-bottom: 1px solid #C5D8EB; }
  pre.shiki { margin: 0; padding: 12px 14px; overflow-x: auto; font: 13px/1.55 "Cascadia Code", Consolas, ui-monospace, monospace; }
  .squiggle { text-decoration: underline wavy var(--brick); text-decoration-skip-ink: none; text-underline-offset: 3px; }
  table { border-collapse: collapse; width: 100%; background: var(--cream); border-radius: 10px; overflow: hidden; font-size: 14px; }
  .table-wrap { overflow-x: auto; }
  th, td { padding: 6px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
  th { background: #D0E2F3; } td.ok, td.low { font-variant-numeric: tabular-nums; text-align: right; } td.low { color: var(--brick); font-weight: 700; }
  .sw { display: inline-block; width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(64,58,54,.25); vertical-align: -3px; margin-right: 8px; }
  .ansi { display: inline-block; margin: 4px 16px 4px 0; font-size: 13px; }
  .icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .icon-card { background: var(--cream); border: 1px solid #C5D8EB; border-radius: 10px; padding: 12px; }
  .icon-card p { margin: 4px 0 0; color: var(--muted); font-size: 14px; }
  .icon-row { display: flex; align-items: center; gap: 14px; padding: 8px; border-radius: 6px; margin-bottom: 6px; }
  .icon-row.blue { background: var(--powder); } .icon-row.cream { background: #FFF9F0; border: 1px solid var(--line); }
  .icon-row span { display: inline-block; } .icon-row svg { width: 100%; height: 100%; display: block; }
  .mini-tree { background: var(--powder); border-radius: 6px; padding: 4px 0; margin-bottom: 6px; font: 13px "Segoe UI", system-ui, sans-serif; }
  .selbox { background: var(--cream); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; margin-top: 10px; font: 14px/1.9 "Cascadia Code", Consolas, monospace; }
  .footer { margin-top: 40px; color: var(--muted); font-size: 13px; }
  .mock { border: 1px solid; border-radius: 8px; overflow: hidden; font: 13px/1.4 "Segoe UI", system-ui, sans-serif; box-shadow: 0 6px 20px rgba(64,58,54,.15); }
  .m-title { text-align: center; padding: 6px; border-bottom: 1px solid; font-size: 12px; }
  .m-body { display: grid; grid-template-columns: 44px 230px 1fr; min-height: 560px; }
  @media (max-width: 760px) { .m-body { grid-template-columns: 0 0 1fr; } .m-act, .m-side { display: none; } }
  .m-act { display: flex; flex-direction: column; align-items: center; gap: 18px; padding-top: 12px; border-right: 1px solid; font-size: 20px; }
  .m-act span { width: 100%; text-align: center; }
  .m-side { border-right: 1px solid; } .m-side-title { padding: 8px 12px; font-size: 11px; letter-spacing: .05em; }
  .tree-row { display: flex; align-items: center; gap: 6px; height: 22px; }
  .ti { width: 16px; height: 16px; display: inline-block; flex: none; } .ti svg { width: 16px; height: 16px; display: block; }
  .m-main { display: flex; flex-direction: column; min-width: 0; }
  .m-tabs { display: flex; border-bottom: 1px solid; } .m-tab { display: flex; gap: 6px; align-items: center; padding: 7px 14px; }
  .m-crumb { padding: 3px 14px; font-size: 12px; }
  .m-code { flex: 1; overflow: auto; } .m-code pre.shiki { padding: 4px 0; counter-reset: ln; }
  .m-code .line { counter-increment: ln; display: inline-block; width: 100%; }
  .m-code .line::before { content: counter(ln); display: inline-block; width: 3.2em; padding-right: 1.4em; text-align: right; color: var(--ln); }
  .m-code .line:nth-child(14) { background: var(--hl); } .m-code .line:nth-child(14)::before { color: var(--lnA); }
  .m-panel { border-top: 1px solid; } .m-ptabs { display: flex; gap: 18px; padding: 6px 14px; font-size: 11px; }
  .m-panel pre { margin: 0; padding: 4px 14px 10px; font: 13px/1.5 "Cascadia Code", Consolas, monospace; white-space: pre-wrap; }
  .m-status { display: flex; gap: 14px; align-items: center; height: 24px; border-top: 1px solid; font-size: 12px; padding-right: 12px; }
</style></head><body><main>
<h1>Honeywood — syntax redesign preview</h1>
<p class="lede">The code samples are rendered with Shiki from the generated theme JSON. Both styles use identical code. Error squiggles stand in for VS Code diagnostics. TypeScript semantic colouring is configured to match, but it only appears in real VS Code.</p>
<h2>Syntax styles</h2>${sampleHtml}
<h2>Syntax palettes and contrast</h2>
<p class="lede">WCAG contrast ratio on each surface code text can sit on. 4.5 is the minimum for normal text; red would mean below it.</p>
<h3>Quiet Ink: four dusty accents; structure shown with bold and italic</h3>
<div class="table-wrap"><table>${head}${quietRows}</table></div>
<h3>Picture Book: a separate vivid colour for each category</h3>
<div class="table-wrap"><table>${head}${pictureRows}</table></div>
<h3>Terminal ANSI (contrast on cream)</h3><div>${ansiRows}</div>
<h2>Layout A (approximate mock-up)</h2>
<p class="lede">An approximation drawn in HTML from the theme's real colour values. It isn't a VS Code screenshot.</p>
${mockHtml}
<h2>Sample icons (unchanged)</h2>
<div class="icons">${iconCards}</div>
<h3>Python icon: option A applied</h3>
<div class="icons">${pyCards}</div>
<p class="footer">Built ${new Date().toISOString()} from ${themes.map((t) => `honeywood-${t.id}.json (sha256 ${t.sha}…)`).join(" and ")}. Both theme files were verified as up to date with src/, and every code sample's rendered text was verified to match the fixture exactly.</p>
</main></body></html>`;

mkdirSync(join(root, "preview/out"), { recursive: true });
writeFileSync(join(root, "preview/out/index.html"), page);
console.log("wrote preview/out/index.html");
