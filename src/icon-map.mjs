// Single source of truth for the Honeywood file icon theme (Tier 1).
// Each entry: id -> { src, ... mappings }. `src` is the approved SVG:
//   "samples"   = approved sample kept in place in icons/svg/
//   "batch-N"   = approved batch in icons/batches/batch-N/ (copied into icons/svg/)
// Keys are lower case: VS Code lower-cases names before matching. File-name
// mappings win over extension mappings, which win over language IDs.
// "plaintext" is deliberately NOT mapped, so unknown files keep the default icon.

export const defaults = { file: "file", folder: "folder", folderExpanded: "folder-open" };

// Folder icons: each has a closed `<name>.svg` and an open `<name>-open.svg`.
export const folders = {
  "folder-src": { src: "batch-1", names: ["src", "source"] },
  "folder-tests": { src: "batch-1", names: ["test", "tests", "__tests__", "spec"] },
  "folder-docs": { src: "batch-1", names: ["docs", "doc"] },
  "folder-assets": { src: "batch-1", names: ["assets", "images", "img", "media"] },
  "folder-config": { src: "batch-1", names: ["config", ".vscode", ".github", "settings"] },
  "folder-public": { src: "batch-2", names: ["public", "static", "www"] },
  "folder-components": { src: "batch-2", names: ["components", "ui", "widgets"] },
  "folder-lib": { src: "batch-2", names: ["lib", "libs", "utils", "util", "helpers"] },
  "folder-scripts": { src: "batch-2", names: ["scripts", "bin"] },
  "folder-dist": { src: "batch-2", names: ["dist", "build", "out", "release"] },
  "folder-node-modules": { src: "batch-2", names: ["node_modules", "vendor", "bower_components"] },
  "folder-git": { src: "batch-2", names: [".git"] },
};

export const files = {
  file: { src: "samples" },
  python: { src: "samples", ext: ["py", "pyi", "pyw"], lang: ["python"] },
  typescript: { src: "samples", ext: ["ts", "mts", "cts", "tsx"], lang: ["typescript", "typescriptreact"] },
  javascript: { src: "batch-1", ext: ["js", "mjs", "cjs", "jsx"], lang: ["javascript", "javascriptreact"] },
  json: { src: "batch-1", ext: ["json", "jsonc"], lang: ["json", "jsonc"] },
  markdown: { src: "batch-1", ext: ["md", "markdown"], lang: ["markdown"] },
  image: { src: "batch-1", ext: ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp"] },
  html: { src: "batch-3", ext: ["html", "htm", "xhtml"], lang: ["html"] },
  css: { src: "batch-3", ext: ["css"], lang: ["css"] },
  scss: { src: "batch-3", ext: ["scss", "sass"], lang: ["scss", "sass"] },
  yaml: { src: "batch-3", ext: ["yaml", "yml"], lang: ["yaml"] },
  config: { src: "batch-3", ext: ["toml", "ini", "cfg", "conf", "properties"], lang: ["toml", "ini", "properties"] },
  xml: { src: "batch-3", ext: ["xml", "xsd", "xsl"], lang: ["xml"] },
  shell: { src: "batch-3", ext: ["sh", "bash", "zsh", "fish"], names: [".bashrc", ".zshrc", ".profile", ".bash_profile"], lang: ["shellscript"] },
  env: { src: "batch-3", ext: ["env"], names: [".env", ".env.local", ".env.development", ".env.production", ".env.test", ".env.example"] },
  csharp: { src: "batch-4", ext: ["cs", "csx"], lang: ["csharp"] },
  java: { src: "batch-4", ext: ["java", "jar", "class"], lang: ["java"] },
  go: { src: "batch-4", ext: ["go"], lang: ["go"] },
  rust: { src: "batch-4", ext: ["rs"], lang: ["rust"] },
  c: { src: "batch-4", ext: ["c", "h", "cpp", "cc", "cxx", "hpp", "hh"], lang: ["c", "cpp"] },
  powershell: { src: "batch-4", ext: ["ps1", "psm1", "psd1"], lang: ["powershell"] },
  sql: { src: "batch-4", ext: ["sql"], lang: ["sql"] },
  text: { src: "batch-4", ext: ["txt", "log", "text"], lang: ["log"] },
  pdf: { src: "batch-4", ext: ["pdf"] },
  readme: { src: "batch-4", names: ["readme", "readme.md", "readme.txt", "readme.rst"] },
  license: { src: "batch-4", names: ["license", "license.md", "license.txt", "licence", "licence.md", "copying"] },
  font: { src: "batch-4", ext: ["ttf", "otf", "woff", "woff2", "eot"] },
  archive: { src: "batch-4", ext: ["zip", "tar", "gz", "tgz", "7z", "rar", "bz2", "xz"] },
  gitignore: { src: "batch-4", names: [".gitignore", ".gitattributes", ".gitmodules", ".gitkeep"] },
  lock: {
    src: "batch-4",
    ext: ["lock"],
    names: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock", "cargo.lock", "gemfile.lock", "composer.lock", "go.sum"],
  },
  package: {
    src: "batch-4",
    names: ["package.json", "pyproject.toml", "requirements.txt", "cargo.toml", "go.mod", "composer.json", "gemfile", "pom.xml", "build.gradle"],
  },
  docker: {
    src: "batch-4",
    ext: ["dockerfile"],
    names: ["dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml", ".dockerignore"],
    lang: ["dockerfile"],
  },
};

// The two default folder icons are approved samples kept in place.
export const sampleFolders = ["folder", "folder-open"];
