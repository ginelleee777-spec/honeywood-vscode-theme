# Honeywood icon mappings

Generated from `src/icon-map.mjs` by `npm run docs:icons` — do not edit by hand.

**How VS Code picks an icon** (most specific wins): exact file name → file extension (longest match first, e.g. `tar.gz` before `gz`) → language ID → default. Names are matched case-insensitively. Unknown files use the default file icon and unknown folders the default folder icon; the generic `plaintext` language is deliberately not mapped so unknown files keep the default.

## Folders (closed and open variants)

| Icon | Folder names |
|---|---|
| default folder | anything not listed below, and the workspace root |
| src | `src`, `source` |
| tests | `test`, `tests`, `__tests__`, `spec` |
| docs | `docs`, `doc` |
| assets | `assets`, `images`, `img`, `media` |
| config | `config`, `.vscode`, `.github`, `settings` |
| public | `public`, `static`, `www` |
| components | `components`, `ui`, `widgets` |
| lib | `lib`, `libs`, `utils`, `util`, `helpers` |
| scripts | `scripts`, `bin` |
| dist | `dist`, `build`, `out`, `release` |
| node modules | `node_modules`, `vendor`, `bower_components` |
| git | `.git` |

## Files

| Icon | File names (exact) | Extensions | Language IDs |
|---|---|---|---|
| default file | — | anything not listed | — |
| python | — | `py`, `pyi`, `pyw` | `python` |
| typescript | — | `ts`, `mts`, `cts`, `tsx` | `typescript`, `typescriptreact` |
| javascript | — | `js`, `mjs`, `cjs`, `jsx` | `javascript`, `javascriptreact` |
| json | — | `json`, `jsonc` | `json`, `jsonc` |
| markdown | — | `md`, `markdown` | `markdown` |
| image | — | `png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`, `ico`, `bmp` | — |
| html | — | `html`, `htm`, `xhtml` | `html` |
| css | — | `css` | `css` |
| scss | — | `scss`, `sass` | `scss`, `sass` |
| yaml | — | `yaml`, `yml` | `yaml` |
| config | — | `toml`, `ini`, `cfg`, `conf`, `properties` | `toml`, `ini`, `properties` |
| xml | — | `xml`, `xsd`, `xsl` | `xml` |
| shell | `.bashrc`, `.zshrc`, `.profile`, `.bash_profile` | `sh`, `bash`, `zsh`, `fish` | `shellscript` |
| env | `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`, `.env.example` | `env` | — |
| csharp | — | `cs`, `csx` | `csharp` |
| java | — | `java`, `jar`, `class` | `java` |
| go | — | `go` | `go` |
| rust | — | `rs` | `rust` |
| c | — | `c`, `h`, `cpp`, `cc`, `cxx`, `hpp`, `hh` | `c`, `cpp` |
| powershell | — | `ps1`, `psm1`, `psd1` | `powershell` |
| sql | — | `sql` | `sql` |
| text | — | `txt`, `log`, `text` | `log` |
| pdf | — | `pdf` | — |
| readme | `readme`, `readme.md`, `readme.txt`, `readme.rst` | — | — |
| license | `license`, `license.md`, `license.txt`, `licence`, `licence.md`, `copying` | — | — |
| font | — | `ttf`, `otf`, `woff`, `woff2`, `eot` | — |
| archive | — | `zip`, `tar`, `gz`, `tgz`, `7z`, `rar`, `bz2`, `xz` | — |
| gitignore | `.gitignore`, `.gitattributes`, `.gitmodules`, `.gitkeep` | — | — |
| lock | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, `cargo.lock`, `gemfile.lock`, `composer.lock`, `go.sum` | `lock` | — |
| package | `package.json`, `pyproject.toml`, `requirements.txt`, `cargo.toml`, `go.mod`, `composer.json`, `gemfile`, `pom.xml`, `build.gradle` | — | — |
| docker | `dockerfile`, `docker-compose.yml`, `docker-compose.yaml`, `compose.yml`, `compose.yaml`, `.dockerignore` | `dockerfile` | `dockerfile` |

## Known limitations

- Light theme only; there is no dark variant in v1.
- Tier 2 file types (for example Makefile, CSV, Ruby, PHP, Kotlin, Swift, Vue, Svelte, Jupyter notebooks) and folders such as `i18n` or `data` are not mapped yet and show the default icons.
- `.tsx` and `.jsx` deliberately reuse the TypeScript and JavaScript icons.
- A language ID only applies when no file name or extension matches; extension-less files are only recognised if VS Code itself detects their language.
