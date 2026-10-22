# Developing Honeywood

Honeywood is almost entirely declarative. The only runtime code (`extension/`) is the small opt-in offer to switch to Honeywood Icons, two setup commands, and the optional Honeywood Storybook view. Everything else that ships is generated from a few small sources and is checked automatically before packaging.

## Project layout

| Path | Purpose |
|---|---|
| `src/palette.mjs` | Every colour, in one place: base palette, companion text shades, UI tints, terminal colours |
| `src/workbench.mjs` | Interface colours: cream editor, powder-blue sidebar, tabs and status bar |
| `src/syntax.mjs` | Syntax roles mapped to TextMate scopes, plus the two styles (Picture Book, Quiet Ink) |
| `src/icon-map.mjs` | Icon mappings: folder names, file names, extensions and language IDs |
| `extension/main.js` | Runtime code: the one-time Honeywood Icons offer and the setup commands |
| `extension/icon-prompt.js` | When to offer the icons (pure rules, tested by `scripts/test-icon-prompt.mjs`) |
| `extension/storybook.js` | The optional Honeywood Storybook Explorer view and its commands |
| `extension/storybook-image.js`, `extension/storybook-html.js` | Checks a chosen picture, and builds the view's HTML and security policy (pure, tested by `scripts/test-storybook.mjs`) |
| `images/storybook/honeywood-woodland.svg` | The default Storybook illustration (artwork; see `docs/STORYBOOK-ILLUSTRATION.md`) |
| `scripts/build-themes.mjs` | Generates `themes/honeywood-*.json` |
| `scripts/build-icon-theme.mjs` | Copies approved icon artwork into `icons/svg/` and writes `icons/honeywood-icon-theme.json` |
| `scripts/validate.mjs` | About 1,700 checks: JSON, manifest, contrast on every editor surface, colour distinctness, SVG safety, mapping integrity, byte-identity with approved art |
| `scripts/test-icon-mappings.mjs` | Resolves about 125 real-world file and folder names the way VS Code does and checks the icon chosen for each |
| `scripts/derive-syntax.mjs` | Design aid that derived the syntax colours in OKLCH (prints candidate colours; not part of the build) |
| `scripts/preview-batch.mjs` | Builds icon review sheets (`preview/out/batch-N.html`) |
| `scripts/design/` | The icon drawing scripts (artwork; see `ARTWORK-LICENSE.md`) |
| `fixtures/` | Sample code, an icon gallery and a demo project for visual testing |
| `preview/` | Marketplace icon drafts; generated preview pages and screenshots are written here locally and are git-ignored (not packaged) |

## Commands

```bash
npm install
```
```bash
npm run check
```
`npm run check` rebuilds the themes and the icon theme, runs the validator and the mapping tests, and rebuilds the preview page.

```bash
npm run package:local
```
`npm run package:local` builds `release/honeywood-theme-<version>.vsix` locally. Only the files allowlisted in `.vscodeignore` are packaged.

To try the extension without touching your normal VS Code settings, press **F5** in VS Code and use one of the configurations in `.vscode/launch.json`. Both start a temporary profile.

## Design rules enforced by the checks

- Every syntax colour reaches at least 4.5 : 1 WCAG contrast on the editor, the current-line highlight, focused and unfocused selections, and the peek editor.
- Syntax colours within one theme are at least 0.055 apart in OKLab, so categories stay distinguishable.
- Icons use a 32×32 grid, allowed stroke widths of 1.8, 2 and 2.3, and no text, scripts or external references.
- Every packaged icon is byte-identical to its approved source.
- The generic `plaintext` language is never mapped, so unknown files keep the default icon.
