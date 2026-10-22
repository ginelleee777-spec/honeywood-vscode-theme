# Honeywood: A Pastel Woodland Theme

A calm, pastel **light** theme for Visual Studio Code, with cream "paper" editors, powder-blue chrome and a set of hand-drawn woodland file icons. It's inspired by the warm, gentle atmosphere of classic storybook illustration, while keeping code clear and easy to read.

![Honeywood — Picture Book](images/screenshots/picture-book.png)

## What's included

| Contribution | Name | What it is |
|---|---|---|
| Colour theme | **Honeywood — Picture Book** | The livelier style: a distinct colour for each kind of code, such as keywords, declarations, strings, functions, numbers, types, parameters and decorators. |
| Colour theme | **Honeywood — Quiet Ink** | The calmer style: four dusty accent colours, with structure shown through **bold** types and *italic* parameters and comments. |
| File icon theme | **Honeywood Icons** | 58 original icons: 12 woodland-motif folder types (closed and open), 31 file types, and default file and folder icons. |

Both colour themes share the same interface (cream editor; powder-blue sidebar, tabs and status bar) and differ only in syntax colouring.

![Honeywood — Quiet Ink](images/screenshots/quiet-ink.png)

## Design philosophy

- **Warm and gentle, never harsh.** The interface uses a soft palette (cream `#FFF9F0`, powder blue `#DCEAF7`, sage, blush, butter yellow), with warm ink `#403A36` for text instead of black.
- **Readable first.** Every syntax colour meets a WCAG contrast ratio of at least **4.5 : 1**. That holds on the editor background, the current-line highlight, focused and unfocused selections, and the peek editor, and it's checked automatically.
- **Clear at 16 pixels.** Icons are drawn on a 32×32 grid with consistent soft ink outlines, and each one was reviewed at true 16 px. Folders are tinted by category so they're easy to scan, for example sage for source, blush for content, powder blue for configuration and apricot for build output.
- **Woodland motifs** on special folders: a leaf (`src`), an acorn (`tests`), an open storybook (`docs`), a hill and sun (`assets`), a daisy (`public`), honeycomb cells (`components`), a garden trowel (`lib`), an upright feather (`scripts`), a woven basket (`dist`), stacked logs (`node_modules`) and a branching twig (`.git`).

![Folder icons in the Explorer](images/screenshots/explorer-folders.png)

## Installation

**From a `.vsix` file:**

1. In VS Code, open the Extensions view (`Ctrl+Shift+X`).
2. Open the `…` menu and choose **Install from VSIX…**.
3. Select `honeywood-theme-1.0.0.vsix`.

**Selecting the themes:**

- Colour theme: **File → Preferences → Theme → Color Theme** (`Ctrl+K Ctrl+T`), then choose **Honeywood — Picture Book** or **Honeywood — Quiet Ink**.
- File icons: **File → Preferences → Theme → File Icon Theme**, then choose **Honeywood Icons**.

The colour themes and the icon theme are independent, so you can use either one on its own.

## Icon coverage

| Group | Covered |
|---|---|
| Code | Python, TypeScript (incl. `.tsx`), JavaScript (incl. `.jsx`), HTML, CSS, SCSS/Sass, C#, Java, Go, Rust, C/C++, shell scripts, PowerShell |
| Data & config | JSON, YAML, XML, TOML/INI/CFG/CONF/properties, SQL, `.env` files |
| Documents | Markdown, plain text and logs, PDF, README, LICENSE |
| Media | Images (incl. SVG), fonts, archives |
| Tooling | `.gitignore` and other `.git*` files, lock files, package manifests (e.g. `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`), Dockerfile and Compose files |
| Folders | `src`, `tests`, `docs`, `assets`, `config` (incl. `.vscode`, `.github`), `public`, `components`, `lib`/`utils`, `scripts`/`bin`, `dist`/`build`/`out`, `node_modules`/`vendor`, `.git` |

Exact file names take priority over extensions, so `package.json` shows the package icon rather than the JSON icon. Files and folders that aren't recognised use neutral default icons. The full list of names, extensions and language IDs is in `docs/ICON-MAPPINGS.md` in the source repository.

![File icons in the Explorer](images/screenshots/explorer-files.png)

## Limitations and known issues

- **Light theme only.** There's no dark variant in this release.
- **Some file types aren't covered yet.** For example Makefile, CSV, Ruby, PHP, Kotlin, Swift, Vue, Svelte and notebooks show the default icons.
- **TSX and JSX reuse the TS and JS icons.** A separate marker wasn't legible at 16 px.
- **Two minor contrast cases** were reviewed and accepted:
  - On the yellow *current search match* highlight, function names measure about 4.2 : 1.
  - In Picture Book, the colour for invalid code is close to the declaration colour. Invalid code is always underlined, and VS Code adds an error squiggle.
- **Some icons are small at 16 px**, such as the `.gitignore` twig and the "Rs" on Rust files. They're clearer at larger sizes or with display scaling.

## Originality

All colours, theme definitions and icon artwork in Honeywood were created for this project. The icons are original drawings of generic objects, letters and woodland motifs. No artwork, illustrations, characters or logos from other products or publishers are included, and no third-party assets are bundled. Honeywood is not affiliated with or endorsed by any company, publisher or open-source project mentioned here. Language and tool names are used only to describe which files an icon applies to.

## Licence

Honeywood is licensed in two parts:

- **Code: MIT License.** The colour theme definitions and colour palette, the icon mapping file, the build, test and preview scripts, the test fixtures and the documentation text. You may reuse, modify and redistribute this code under the terms in `LICENSE`.
- **Artwork: all rights reserved, with some permissions.** The original icon artwork, the Marketplace icon, the screenshots and the drawing scripts that generate the icons. `ARTWORK-LICENSE.md` lists the exact folders.
  - **Allowed:** using the extension for any purpose (including commercial), sharing the unmodified official package, showing it in screenshots and reviews, and building and testing it locally from source.
  - **On GitHub:** viewing and forking the repository is allowed, as GitHub's Terms of Service provide.
  - **Needs permission:** distributing your own build or a modified package that contains the artwork (even a rebuild of unchanged source), or reusing the artwork in other projects. To publish your own theme based on this code, replace the artwork with your own.

Copyright © 2026 Honeywood.

## Changelog

See `CHANGELOG.md`.

## How Honeywood was built

Honeywood is built from a small set of sources rather than hand-edited JSON:

- **One palette, two styles.** Every colour lives in a single palette file. The syntax colours were derived in the OKLCH colour space, keeping each hue and making it as vivid as possible while still reaching 4.5 : 1 contrast on every editor surface.
- **Automated checks.** A validator runs about 1,700 checks before every build: contrast, colour distinctness, SVG safety and icon-mapping integrity. A separate test suite resolves about 125 real-world file and folder names the way VS Code does, and checks the icon chosen for each.
- **Icons reviewed at true size.** The icons were designed in small batches and judged at a true 16 px on preview sheets and in realistic file trees, then checked in a real VS Code window.
- **Clean packaging.** The extension package is built from an allowlist, so only the themes, icons, manifest and docs are shipped.

See `docs/DEVELOPMENT.md` for the project layout and commands.
