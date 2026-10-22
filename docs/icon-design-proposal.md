# Honeywood icons: design proposal

*Written during development, when the project used the working title "Storybook Grove".*

Status: **Direction APPROVED 2026-10-21** (decisions in section 5). The icons are being drawn in batches, each approved before the next. Batch 1 approved; batch 2 (folder set) has the owner's choices 1A/2A/3A applied and awaits final review.
Approved style: pastel fills, soft hand-drawn ink outlines, gentle woodland motifs on selected folders. Original artwork only.

## 1. Review of the current seven samples

| Icon | Works well | Issue at 16px | Proposed fix |
|---|---|---|---|
| `file.svg` | Clean page shape; folded corner reads well | Grey lines are faint | Keep as is (a quiet fallback is intended) |
| `folder.svg` / `folder-open.svg` | Clear silhouette; the butter fill stands out on powder blue | None | Keep as the template for every folder |
| `folder-src.svg` (leaf) | Leaf reads as a leaf at 32px | At 16px the leaf is about 5px wide and its 1.5-unit vein disappears | Enlarge emblems about 15%; drop interior details below 1.8 units |
| `folder-tests.svg` (acorn) | Recognisable cap-and-nut shape | Same size issue; also no open variant | Enlarge; add an open variant |
| `python.svg` (option A "py") | **Applied.** Legible at 16px | None | Keep |
| `typescript.svg` ("TS") | Legible at 16px | None | Keep |

Consistency audit (measured):
- All icons use the 32×32 grid and a 2-unit warm-ink outline (`#403A36`).
- Emblem strokes vary (1.5, 1.8, 2.3). Proposed rule:
  - outline **2.0**
  - emblem outline **1.8**
  - letters **2.3**
  - nothing thinner than **1.8**, so no detail renders thinner than about 0.9px at 16px
- `src` and `tests` currently have no open-folder variant, so they look the same expanded and collapsed.

## 2. Design rules (proposed)

1. **Grid:** 32×32 viewBox, round caps and joins, slight hand-drawn wobble via gentle curves (no random jitter).
2. **Files:** one shared page shape with a folded corner. The *fill colour* gives the family; the *emblem* gives the type.
3. **Emblems:**
   - Code languages: hand-drawn letters, **maximum 2 letters** (3 letters are not legible at 16px).
   - Documents, data, media and config: one simple pictogram.
4. **Folders:** shared folder shape plus a motif in the lower-right quadrant. Every special folder gets a matching open variant.
5. **No logos:** no official or logo-like marks (for example the Python snakes, the Git logo, the Docker whale, the npm wordmark or the React atom). Plain letters and generic pictograms only. All artwork drawn from scratch.
6. **Legibility gate:** every icon is checked at 16px on the powder-blue sidebar, on the list selection colour and on cream, before it is accepted.
7. **Safe SVG only:** no `<text>` (letters are drawn as paths, so they don't depend on fonts), no images, no scripts and no external links. The validator already enforces most of this.

### File colour families (pastel page fills from the approved palette)
| Family | Page fill | Emblem colour | Examples |
|---|---|---|---|
| Code | varies per language (powder / butter / sage / blush) | approved syntax colours | py, ts, js, html, css, go, rs |
| Data & config | soft sage `#DCE8D6` | leaf green | json, yaml, toml, ini, xml, .env |
| Documents | cream `#FFFDF8` | storybook blue | md, txt, pdf, README, LICENSE |
| Media | blush `#F2DDE3` | dusty rose | images, fonts, audio, video |
| Tooling | powder blue `#DCEAF7` | ink | lock files, Dockerfile, Makefile, .gitignore |

## 3. Folder motifs (woodland where it stays clear; plain symbol where nature would be ambiguous)

| Folder names | Motif | Why |
|---|---|---|
| `src`, `source` | leaf (existing) | growing things |
| `test`, `tests`, `__tests__`, `spec` | acorn (existing) | small seeds, checked |
| `docs`, `doc` | open storybook | documentation |
| `assets`, `images`, `img`, `media` | little hill and sun | "picture" at a glance |
| `public`, `static` | daisy | open to visitors |
| `components`, `ui` | three honeycomb cells | modular pieces (no bees) |
| `lib`, `utils`, `helpers` | garden trowel | handy tools |
| `scripts`, `bin` | **upright** feather (owner choice 1A; the diagonal quill looked like lib's trowel at 16px) | written instructions |
| `config`, `.vscode`, `.github`, `settings` | hand-drawn gear | **clarity over theme**: a pinecone would be ambiguous here |
| `dist`, `build`, `out`, `release` | woven basket, **apricot** tint (owner choice 3A) | the harvest |
| `node_modules`, `vendor` | **two side-on logs** with a gap, dimmed parchment (owner choice 2A; the woodpile echoed the honeycomb) | bulky and rarely opened |
| `.git` | branching twig, **heather** tint (owner choice 3A) | branches |

### Folder body colour: decision needed
- **A (approved): tint by category.** Sage for source/code (src, lib, components, scripts); blush for content (docs, assets, public); deeper powder for config; **apricot `#F3D2B0` for dist/build; heather `#D6CBE8` for .git** (both added after the batch 2 review, choice 3A); dimmed parchment `#E3DCCD` for node_modules; butter for tests and plain folders.
- **B: every folder stays butter**, and only the motif differs. Calmer, but harder to scan.

## 4. Coverage

### Tier 1: proposed for v1 (about 54 SVGs)
- **Defaults (3):** file, folder, folder-open
- **Special folders (12 × closed/open = 24):** the folder table above
- **Code (13 icons; TSX/JSX reuse TS/JS):** Python ✓, TypeScript ✓, JavaScript (JS), TSX/JSX (reuse TS/JS icons), HTML (`<>`), CSS (#), SCSS/Sass (S#), C# (C#), Java (J), Go (Go), Rust (Rs), C/C++ (C / C+), Shell sh/bash/zsh (`>_`), PowerShell (PS)
- **Data & config (6):** JSON (`{ }`), YAML/YML (Y), TOML/INI/.cfg (gear page), XML (`</>`), SQL (cylinder), .env (key)
- **Documents (5):** Markdown (M with arrow), plain text and logs (lines), PDF (folded paper with a stamp), README (book with "i"), LICENSE (wax seal)
- **Media (3):** image incl. svg/png/jpg/gif/webp (hill and sun), font (Aa drawn), archive zip/tar/gz (bundle tied with string)
- **Tooling (4):** .gitignore/.gitattributes (twig with a cross), lock files (padlock), package.json/pyproject.toml/requirements.txt (crate), Dockerfile/compose (shipping crate with a slat)

### Tier 2: later (about 20 more)
CSV, audio, video, Makefile, CHANGELOG, Ruby, PHP, Kotlin, Swift, Lua, R, Dart, Vue/Svelte (letters only), GraphQL, Jupyter notebooks, test files (`*.test.ts` page with an acorn badge), `.editorconfig`/linters (tidy brush), plus `i18n`/`locales` and `data`/`db` folders.

Mappings use `fileExtensions`, `fileNames`, `folderNames`/`folderNamesExpanded` and `languageIds`. A language ID covers files whose extension isn't listed.

## 5. Owner decisions (approved 2026-10-21)
1. Coverage: **Tier 1 for v1**; Tier 2 later.
2. Folder body colour: **A, tint by category**.
3. Folder motifs: **section 3 table approved for now**; individual motifs may be revised after the preview sheets.
4. TSX/JSX: ~~TS/JS letters with a small `<>` badge~~. After the batch 1 preview (the badge was not legible at 16px), **plain TS/JS letters**: `.tsx` and `.jsx` map to the TypeScript and JavaScript icons.
5. Config motif: **hand-drawn gear**, folder tint **deeper powder blue** (`#B8D0E9`), chosen over heather after the batch 1 preview.
6. Python keeps the applied **"py"** letters.

## 6. Working method
- Draw in batches of about 8. Each batch gets a preview sheet: 16/32/64px on sidebar, selection and cream, plus a mock explorer tree with real file names.
- Validator additions: allowed stroke widths only (1.8 / 2 / 2.3), no `<text>` elements, every special folder has an open variant, and every mapped name resolves to an icon.
- The owner reviews each batch before the next one starts.
