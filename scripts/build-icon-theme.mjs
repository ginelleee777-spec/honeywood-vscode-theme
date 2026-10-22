// Assembles the packaged icon theme from approved artwork:
//  1. copies approved batch SVGs into icons/svg/ (byte-for-byte)
//  2. removes any icons/svg/*.svg that is no longer mapped
//  3. writes icons/honeywood-icon-theme.json from src/icon-map.mjs
// Run: npm run build:icons
import { copyFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaults, folders, files, sampleFolders } from "../src/icon-map.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svgDir = join(root, "icons", "svg");
const id = (name) => "_" + name.replace(/-/g, "_");

// 1. Which SVGs the theme needs, and where each comes from.
const wanted = new Map(); // file name -> source dir (null = sample kept in place)
const want = (name, src) => wanted.set(`${name}.svg`, src === "samples" ? null : join(root, "icons", "batches", src));
for (const n of sampleFolders) want(n, "samples");
for (const [name, f] of Object.entries(folders)) {
  want(name, f.src);
  want(`${name}-open`, f.src);
}
for (const [name, f] of Object.entries(files)) want(name, f.src);

let copied = 0;
for (const [file, srcDir] of wanted) {
  if (!srcDir) continue;
  copyFileSync(join(srcDir, file), join(svgDir, file));
  copied++;
}
// 2. Remove anything no longer mapped (e.g. superseded samples).
const removed = [];
for (const f of readdirSync(svgDir)) {
  if (f.endsWith(".svg") && !wanted.has(f)) {
    rmSync(join(svgDir, f));
    removed.push(f);
  }
}

// 3. Theme JSON.
const theme = {
  hidesExplorerArrows: false,
  iconDefinitions: Object.fromEntries([...wanted.keys()].sort().map((f) => [id(f.replace(".svg", "")), { iconPath: `./svg/${f}` }])),
  file: id(defaults.file),
  folder: id(defaults.folder),
  folderExpanded: id(defaults.folderExpanded),
  rootFolder: id(defaults.folder),
  rootFolderExpanded: id(defaults.folderExpanded),
  folderNames: {},
  folderNamesExpanded: {},
  fileExtensions: {},
  fileNames: {},
  languageIds: {},
};
const put = (table, key, value, what) => {
  if (key !== key.toLowerCase()) throw new Error(`${what} key must be lower case: ${key}`);
  if (table[key] && table[key] !== value) throw new Error(`${what} "${key}" mapped twice (${table[key]} / ${value})`);
  table[key] = value;
};
for (const [name, f] of Object.entries(folders)) {
  for (const n of f.names) {
    put(theme.folderNames, n, id(name), "folderNames");
    put(theme.folderNamesExpanded, n, id(`${name}-open`), "folderNamesExpanded");
  }
}
for (const [name, f] of Object.entries(files)) {
  for (const e of f.ext ?? []) put(theme.fileExtensions, e, id(name), "fileExtensions");
  for (const n of f.names ?? []) put(theme.fileNames, n, id(name), "fileNames");
  for (const l of f.lang ?? []) put(theme.languageIds, l, id(name), "languageIds");
}
writeFileSync(join(root, "icons", "honeywood-icon-theme.json"), JSON.stringify(theme, null, 2) + "\n");

const count = (o) => Object.keys(o).length;
console.log(`icon theme: ${count(theme.iconDefinitions)} icons (${copied} copied from approved batches${removed.length ? `; removed ${removed.join(", ")}` : ""})`);
console.log(`mappings: ${count(theme.folderNames)} folder names, ${count(theme.fileExtensions)} extensions, ${count(theme.fileNames)} file names, ${count(theme.languageIds)} language IDs`);
