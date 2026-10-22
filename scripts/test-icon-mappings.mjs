// M3 automated tests for the packaged icon theme. Resolves icons the way VS Code
// does (most specific wins): file name > longest file extension > language ID >
// default; folders: folder name (closed/expanded) > default. Names are matched
// lower-cased, as VS Code does. Run: npm test
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const theme = JSON.parse(readFileSync(join(root, "icons/honeywood-icon-theme.json"), "utf8"));

// Language VS Code assigns by extension (built-in defaults for the cases tested).
const builtinLanguage = {
  py: "python", ts: "typescript", tsx: "typescriptreact", js: "javascript", jsx: "javascriptreact", json: "json",
  jsonc: "jsonc", md: "markdown", html: "html", css: "css", scss: "scss", yaml: "yaml", yml: "yaml", ini: "ini",
  xml: "xml", sh: "shellscript", cs: "csharp", java: "java", go: "go", rs: "rust", c: "c", h: "c", cpp: "cpp",
  ps1: "powershell", sql: "sql", log: "log", txt: "plaintext",
};

export function resolveFile(name, lang) {
  const n = name.toLowerCase();
  if (theme.fileNames[n]) return { icon: theme.fileNames[n], via: `fileName "${n}"` };
  const parts = n.split(".");
  for (let i = 1; i < parts.length; i++) {
    const ext = parts.slice(i).join(".");
    if (ext && theme.fileExtensions[ext]) return { icon: theme.fileExtensions[ext], via: `extension "${ext}"` };
  }
  const language = lang ?? builtinLanguage[parts.length > 1 ? parts.at(-1) : ""];
  if (language && theme.languageIds[language]) return { icon: theme.languageIds[language], via: `language "${language}"` };
  return { icon: theme.file, via: "default file" };
}
export function resolveFolder(name, expanded, isRoot = false) {
  const n = name.toLowerCase();
  const table = expanded ? theme.folderNamesExpanded : theme.folderNames;
  if (table[n]) return { icon: table[n], via: `folderName "${n}"` };
  if (isRoot) return { icon: expanded ? theme.rootFolderExpanded : theme.rootFolder, via: "default root folder" };
  return { icon: expanded ? theme.folderExpanded : theme.folder, via: "default folder" };
}

// [file name, expected icon id, optional language override]
export const fileCases = [
  // exact file names (must beat extensions)
  ["README", "_readme"], ["README.md", "_readme"], ["readme.txt", "_readme"], ["Readme.rst", "_readme"],
  ["LICENSE", "_license"], ["LICENSE.md", "_license"], ["LICENCE", "_license"], ["COPYING", "_license"],
  ["package.json", "_package"], ["pyproject.toml", "_package"], ["requirements.txt", "_package"], ["Cargo.toml", "_package"],
  ["go.mod", "_package"], ["composer.json", "_package"], ["Gemfile", "_package"], ["pom.xml", "_package"], ["build.gradle", "_package"],
  ["package-lock.json", "_lock"], ["yarn.lock", "_lock"], ["pnpm-lock.yaml", "_lock"], ["poetry.lock", "_lock"],
  ["Cargo.lock", "_lock"], ["Gemfile.lock", "_lock"], ["composer.lock", "_lock"], ["go.sum", "_lock"], ["deps.lock", "_lock"],
  ["Dockerfile", "_docker"], ["api.dockerfile", "_docker"], ["docker-compose.yml", "_docker"], ["docker-compose.yaml", "_docker"],
  ["compose.yml", "_docker"], ["compose.yaml", "_docker"], [".dockerignore", "_docker"],
  [".env", "_env"], [".env.local", "_env"], [".env.development", "_env"], [".env.production", "_env"], [".env.test", "_env"],
  [".env.example", "_env"], ["settings.env", "_env"],
  [".gitignore", "_gitignore"], [".gitattributes", "_gitignore"], [".gitmodules", "_gitignore"], [".gitkeep", "_gitignore"],
  [".bashrc", "_shell"], [".zshrc", "_shell"], [".profile", "_shell"], [".bash_profile", "_shell"],
  // extensions, including TSX/JSX
  ["app.py", "_python"], ["types.pyi", "_python"], ["main.ts", "_typescript"], ["StoryCard.tsx", "_typescript"],
  ["vite.config.mts", "_typescript"], ["lanterns.js", "_javascript"], ["Meadow.jsx", "_javascript"], ["server.mjs", "_javascript"],
  ["tsconfig.json", "_json"], ["settings.jsonc", "_json"], ["guide.md", "_markdown"], ["cover.PNG", "_image"], ["logo.svg", "_image"],
  ["index.html", "_html"], ["reset.css", "_css"], ["theme.scss", "_scss"], ["mixins.sass", "_scss"], ["ci.yml", "_yaml"],
  ["netlify.toml", "_config"], ["setup.cfg", "_config"], ["php.ini", "_config"], ["app.properties", "_config"], ["sitemap.xml", "_xml"],
  ["deploy.sh", "_shell"], ["Lantern.cs", "_csharp"], ["Meadow.java", "_java"], ["trail.go", "_go"], ["burrow.rs", "_rust"],
  ["acorn.c", "_c"], ["acorn.h", "_c"], ["acorn.cpp", "_c"], ["acorn.hpp", "_c"], ["setup.ps1", "_powershell"], ["schema.sql", "_sql"],
  ["notes.txt", "_text"], ["changes.log", "_text"], ["field-guide.pdf", "_pdf"], ["Serif.woff2", "_font"], ["sprites.zip", "_archive"],
  ["backup.tar.gz", "_archive"], ["component.test.ts", "_typescript"],
  // language-ID only (no mapped extension)
  ["configure", "_shell", "shellscript"], ["Jenkinsfile.groovyish", "_file", "groovy"],
  // unknown types fall back to the default file icon
  ["Makefile", "_file"], ["mystery.xyz", "_file"], ["data.bin", "_file"], ["noext", "_file", "plaintext"], [".hiddenrc", "_file"],
];
// [folder name, expected closed, expected open, isRoot]
export const folderCases = [
  ["src", "_folder_src", "_folder_src_open"], ["source", "_folder_src", "_folder_src_open"],
  ["tests", "_folder_tests", "_folder_tests_open"], ["__tests__", "_folder_tests", "_folder_tests_open"], ["spec", "_folder_tests", "_folder_tests_open"],
  ["docs", "_folder_docs", "_folder_docs_open"], ["assets", "_folder_assets", "_folder_assets_open"], ["images", "_folder_assets", "_folder_assets_open"],
  ["config", "_folder_config", "_folder_config_open"], [".vscode", "_folder_config", "_folder_config_open"], [".github", "_folder_config", "_folder_config_open"],
  ["public", "_folder_public", "_folder_public_open"], ["static", "_folder_public", "_folder_public_open"],
  ["components", "_folder_components", "_folder_components_open"], ["ui", "_folder_components", "_folder_components_open"],
  ["lib", "_folder_lib", "_folder_lib_open"], ["utils", "_folder_lib", "_folder_lib_open"], ["helpers", "_folder_lib", "_folder_lib_open"],
  ["scripts", "_folder_scripts", "_folder_scripts_open"], ["bin", "_folder_scripts", "_folder_scripts_open"],
  ["dist", "_folder_dist", "_folder_dist_open"], ["build", "_folder_dist", "_folder_dist_open"], ["out", "_folder_dist", "_folder_dist_open"],
  ["node_modules", "_folder_node_modules", "_folder_node_modules_open"], ["vendor", "_folder_node_modules", "_folder_node_modules_open"],
  [".git", "_folder_git", "_folder_git_open"], ["SRC", "_folder_src", "_folder_src_open"],
  // unmapped folders and the workspace root fall back to the defaults
  ["notes", "_folder", "_folder_open"], ["styles", "_folder", "_folder_open"], ["grove-app", "_folder", "_folder_open", true],
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = [];
  let passed = 0;
  const ok = (cond, msg) => (cond ? passed++ : failures.push(msg));
  const used = new Set();

  for (const [name, expected, lang] of fileCases) {
    const r = resolveFile(name, lang);
    used.add(r.icon);
    ok(r.icon === expected, `file "${name}": got ${r.icon} via ${r.via}, expected ${expected}`);
  }
  for (const [name, closed, open, isRoot] of folderCases) {
    const c = resolveFolder(name, false, isRoot), o = resolveFolder(name, true, isRoot);
    used.add(c.icon); used.add(o.icon);
    ok(c.icon === closed, `folder "${name}" closed: got ${c.icon}, expected ${closed}`);
    ok(o.icon === open, `folder "${name}" open: got ${o.icon}, expected ${open}`);
  }
  // Every icon is reachable by at least one test, and every reference resolves to an existing SVG.
  for (const id of Object.keys(theme.iconDefinitions)) ok(used.has(id), `icon ${id} is not exercised by any test case`);
  for (const [id, d] of Object.entries(theme.iconDefinitions)) ok(existsSync(join(root, "icons", d.iconPath)), `${id}: missing ${d.iconPath}`);
  // Language mappings agree with extension mappings (no icon flips when VS Code detects the language).
  for (const [ext, lang] of Object.entries(builtinLanguage)) {
    if (theme.fileExtensions[ext] && theme.languageIds[lang]) {
      ok(theme.fileExtensions[ext] === theme.languageIds[lang], `.${ext} → ${theme.fileExtensions[ext]} but language ${lang} → ${theme.languageIds[lang]}`);
    }
  }
  if (failures.length) {
    console.error(`${failures.length} icon mapping test(s) FAILED:`);
    for (const f of failures) console.error("  ✗", f);
    process.exit(1);
  }
  console.log(`icon mapping tests: ${passed} passed (${fileCases.length} files, ${folderCases.length} folders × open/closed, ${Object.keys(theme.iconDefinitions).length} icons all exercised)`);
}
