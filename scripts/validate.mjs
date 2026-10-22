// Structural, asset and contrast checks. Run: npm run validate
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contrast } from "./lib/contrast.mjs";
import { deltaE } from "./lib/color.mjs";
import { base, syntax as syn } from "../src/palette.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];
const warnings = [];
let passed = 0;

function check(ok, message) {
  if (ok) passed++;
  else failures.push(message);
}
function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (err) {
    failures.push(`${rel}: invalid JSON (${err.message})`);
    return null;
  }
}
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

// --- Manifest
const pkg = readJson("package.json");
for (const f of ["name", "displayName", "description", "version", "publisher", "engines"]) {
  check(pkg?.[f], `package.json: missing "${f}"`);
}
check(pkg?.engines?.vscode, "package.json: missing engines.vscode");
check(pkg?.categories?.includes("Themes"), 'package.json: categories should include "Themes"');
if (pkg?.publisher === "placeholder-publisher") notes.push("publisher is still a placeholder (decision D6)");

// --- Colour themes
for (const t of pkg?.contributes?.themes ?? []) {
  const rel = t.path.replace(/^\.\//, "");
  check(existsSync(join(root, rel)), `theme path missing: ${rel}`);
  check(t.uiTheme === "vs", `${rel}: uiTheme should be "vs" (light)`);
  const theme = readJson(rel);
  if (!theme) continue;

  for (const [k, v] of Object.entries(theme.colors)) check(HEX.test(v), `${rel}: colors.${k} invalid "${v}"`);
  const C = theme.colors;

  // Syntax colours must reach 4.5:1 on every surface code text routinely sits on.
  const strict = [
    "editor.background", "editor.lineHighlightBackground", "editor.selectionBackground",
    "editor.inactiveSelectionBackground", "peekViewEditor.background",
  ];
  const syntaxFgs = new Map(); // hex -> role names
  for (const rule of theme.tokenColors) {
    const fg = rule.settings.foreground;
    if (!fg) continue;
    check(HEX.test(fg), `${rel}: token "${rule.name}" invalid colour`);
    syntaxFgs.set(fg, [...(syntaxFgs.get(fg) ?? []), rule.name]);
  }
  for (const v of Object.values(theme.semanticTokenColors)) {
    const fg = typeof v === "string" ? v : v.foreground;
    if (!syntaxFgs.has(fg)) syntaxFgs.set(fg, ["semantic"]);
  }
  for (const bg of strict) {
    for (const [fg, roles] of syntaxFgs) {
      const r = contrast(fg, C[bg]);
      check(r >= 4.5, `${rel}: syntax ${fg} (${roles[0]}) on ${bg} ${C[bg]} = ${r.toFixed(2)} (< 4.5)`);
    }
  }
  // Distinctness: different syntax colours in one theme must be clearly apart
  // (OKLab distance >= 0.055). Exempt: the deliberately close ink family, and
  // "invalid" (always underlined, and VS Code adds an error squiggle).
  const inkFamily = new Set([base.warmInk, syn.shared.punctuation]);
  const fgList = [...syntaxFgs.keys()].filter((fg) => syntaxFgs.get(fg).join() !== "invalid");
  let closest = [Infinity, ""];
  for (let i = 0; i < fgList.length; i++) {
    for (let j = i + 1; j < fgList.length; j++) {
      if (inkFamily.has(fgList[i]) && inkFamily.has(fgList[j])) continue;
      const d = deltaE(fgList[i], fgList[j]);
      if (d < closest[0]) closest = [d, `${syntaxFgs.get(fgList[i])[0]} ${fgList[i]} / ${syntaxFgs.get(fgList[j])[0]} ${fgList[j]}`];
      check(d >= 0.055, `${rel}: syntax colours too similar: ${fgList[i]} vs ${fgList[j]} (ΔE ${d.toFixed(3)})`);
    }
  }
  notes.push(`${rel}: ${fgList.length} syntax colours; closest pair ${closest[1]} ΔE ${closest[0].toFixed(3)}`);

  // Workbench text pairs: [foreground key, background key, minimum].
  const pairs = [
    ["editor.foreground", "editor.background", 4.5],
    ["sideBar.foreground", "sideBar.background", 4.5],
    ["sideBarSectionHeader.foreground", "sideBarSectionHeader.background", 4.5],
    ["list.activeSelectionForeground", "list.activeSelectionBackground", 4.5],
    ["tab.activeForeground", "tab.activeBackground", 4.5],
    ["tab.inactiveForeground", "tab.inactiveBackground", 4.5],
    ["statusBar.foreground", "statusBar.background", 4.5],
    ["statusBar.debuggingForeground", "statusBar.debuggingBackground", 4.5],
    ["titleBar.activeForeground", "titleBar.activeBackground", 4.5],
    ["button.foreground", "button.background", 4.5],
    ["button.secondaryForeground", "button.secondaryBackground", 4.5],
    ["badge.foreground", "badge.background", 4.5],
    ["activityBarBadge.foreground", "activityBarBadge.background", 4.5],
    ["statusBarItem.remoteForeground", "statusBarItem.remoteBackground", 4.5],
    ["menu.foreground", "menu.background", 4.5],
    ["input.foreground", "input.background", 4.5],
    ["input.placeholderForeground", "input.background", 4.5],
    ["breadcrumb.foreground", "breadcrumb.background", 4.5],
    ["panelTitle.inactiveForeground", "panel.background", 4.5],
    ["terminal.foreground", "terminal.background", 4.5],
    ["activityBar.foreground", "activityBar.background", 3],
    ["activityBar.inactiveForeground", "activityBar.background", 3],
    ["editorLineNumber.foreground", "editor.background", 3],
    ["editorLineNumber.activeForeground", "editor.background", 4.5],
    ...Object.keys(C)
      .filter((k) => k.startsWith("gitDecoration."))
      .map((k) => [k, "sideBar.background", k.includes("ignored") ? 3 : 4.5]),
    ...Object.keys(C)
      .filter((k) => k.startsWith("terminal.ansi") && !/White$/.test(k))
      .map((k) => [k, "terminal.background", 4.5]),
  ];
  for (const [fg, bg, min] of pairs) {
    if (!C[fg] || !C[bg]) {
      failures.push(`${rel}: missing ${C[fg] ? bg : fg}`);
      continue;
    }
    const r = contrast(C[fg], C[bg]);
    check(r >= min, `${rel}: ${fg} on ${bg} = ${r.toFixed(2)} (< ${min})`);
  }
  // Transient highlights (search matches, occurrence highlights, diff lines,
  // bracket match): reported as warnings, not failures. Translucent colours are
  // composited over cream first.
  const transient = [
    "editor.findMatchBackground", "editor.findMatchHighlightBackground", "editor.selectionHighlightBackground",
    "editor.wordHighlightBackground", "editor.wordHighlightStrongBackground", "editorBracketMatch.background",
    "diffEditor.insertedLineBackground", "diffEditor.removedLineBackground",
  ];
  for (const key of transient) {
    const bg = flatten(C[key], C["editor.background"]);
    let worst = [Infinity, ""];
    for (const fg of syntaxFgs.keys()) {
      const r = contrast(fg, bg);
      if (r < worst[0]) worst = [r, `${fg} (${syntaxFgs.get(fg)[0]})`];
    }
    if (worst[0] < 4.5) warnings.push(`${rel}: on ${key} (${bg}) lowest is ${worst[1]} = ${worst[0].toFixed(2)}`);
    else passed++;
  }
}

function flatten(hex, under) {
  if (hex.length !== 9) return hex.slice(0, 7);
  const a = parseInt(hex.slice(7, 9), 16) / 255;
  const ch = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(ch(hex, i) * a + ch(under, i) * (1 - a)).toString(16).padStart(2, "0")).join("").toUpperCase();
}

// --- Icon theme
for (const it of pkg?.contributes?.iconThemes ?? []) {
  const rel = it.path.replace(/^\.\//, "");
  const icons = readJson(rel);
  if (!icons) continue;
  const base = dirname(join(root, rel));
  const defs = icons.iconDefinitions;
  for (const [id, d] of Object.entries(defs)) {
    const p = join(base, d.iconPath);
    check(existsSync(p), `${rel}: ${id} -> missing ${d.iconPath}`);
    if (existsSync(p)) {
      const svg = readFileSync(p, "utf8");
      check(/^<svg[^>]+viewBox="0 0 32 32"/.test(svg), `${d.iconPath}: expected viewBox 0 0 32 32`);
      check(!/<(script|image|foreignObject)|href=/i.test(svg), `${d.iconPath}: contains script/external reference`);
      check((svg.match(/<svg/g) || []).length === 1 && svg.trim().endsWith("</svg>"), `${d.iconPath}: malformed SVG`);
    }
  }
  const refs = [
    icons.file, icons.folder, icons.folderExpanded, icons.rootFolder, icons.rootFolderExpanded,
    ...["folderNames", "folderNamesExpanded", "fileExtensions", "fileNames", "languageIds"].flatMap((k) => Object.values(icons[k] ?? {})),
  ].filter(Boolean);
  for (const r of refs) check(defs[r], `${rel}: reference to undefined icon "${r}"`);
  for (const id of Object.keys(defs)) check(refs.includes(id), `${rel}: icon "${id}" defined but never used`);
}

// --- Integration: packaged icons must be exact copies of approved batch art,
// mappings must be lower case and complete, and unknown files must fall back.
{
  const { folders, files } = await import("../src/icon-map.mjs");
  const theme = readJson("icons/honeywood-icon-theme.json");
  const svgDir = join(root, "icons", "svg");
  const same = (a, b) => existsSync(a) && existsSync(b) && readFileSync(a).equals(readFileSync(b));
  const sources = [
    ...Object.entries(folders).flatMap(([n, f]) => [[n, f.src], [`${n}-open`, f.src]]),
    ...Object.entries(files).map(([n, f]) => [n, f.src]),
  ];
  for (const [name, src] of sources) {
    if (src === "samples") continue;
    check(same(join(svgDir, `${name}.svg`), join(root, "icons", "batches", src, `${name}.svg`)),
      `icons/svg/${name}.svg is not byte-identical to approved icons/batches/${src}/${name}.svg`);
  }
  if (theme) {
    for (const table of ["folderNames", "folderNamesExpanded", "fileExtensions", "fileNames", "languageIds"]) {
      for (const key of Object.keys(theme[table])) check(key === key.toLowerCase(), `icon theme ${table} key not lower case: ${key}`);
    }
    const closed = Object.keys(theme.folderNames).sort().join();
    check(closed === Object.keys(theme.folderNamesExpanded).sort().join(), "folderNames and folderNamesExpanded cover different names");
    check(!("plaintext" in theme.languageIds), 'languageIds must not map "plaintext" (it would replace the default file icon)');
    check(theme.file === "_file" && theme.folder === "_folder" && theme.folderExpanded === "_folder_open", "default file/folder fallbacks changed");
  }
}

// --- Icon batches awaiting approval (icons/batches/*): same safety rules,
// plus the approved stroke widths and open/closed folder pairs.
const batchRoot = join(root, "icons", "batches");
if (existsSync(batchRoot)) {
  for (const batch of readdirSync(batchRoot)) {
    const dir = join(batchRoot, batch);
    const names = readdirSync(dir).filter((n) => n.endsWith(".svg"));
    for (const n of names) {
      const svg = readFileSync(join(dir, n), "utf8");
      const rel = `icons/batches/${batch}/${n}`;
      check(/^<svg[^>]+viewBox="0 0 32 32"/.test(svg), `${rel}: expected viewBox 0 0 32 32`);
      check(!/<(script|image|foreignObject|text)\b|href=/i.test(svg), `${rel}: contains text/script/external reference`);
      const widths = [...svg.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => m[1]);
      check(widths.every((w) => ["1.8", "2", "2.3"].includes(w)), `${rel}: stroke widths ${[...new Set(widths)].join(", ")} (allowed 1.8 / 2 / 2.3)`);
      if (n.startsWith("folder-") && !n.endsWith("-open.svg")) {
        check(names.includes(n.replace(".svg", "-open.svg")), `${rel}: missing open variant`);
      }
    }
  }
}

// --- Packaging boundary
const ignore = existsSync(join(root, ".vscodeignore")) ? readFileSync(join(root, ".vscodeignore"), "utf8") : "";
check(/^\*\*$/m.test(ignore), ".vscodeignore should start from an allowlist (exclude **)");
const privateLike = readdirSync(root).filter((n) => /private|experiment|sidebar-art/i.test(n));
check(privateLike.length === 0, `private-looking folders inside the public repo: ${privateLike.join(", ")}`);

// --- Report
for (const n of notes) console.log("note:", n);
for (const w of warnings) console.log("WARN:", w);
if (failures.length) {
  console.error(`\n${failures.length} check(s) FAILED:`);
  for (const f of failures) console.error("  ✗", f);
  process.exit(1);
}
console.log(`\nAll ${passed} checks passed.`);
