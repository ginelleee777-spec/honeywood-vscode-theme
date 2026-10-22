# Changelog

All notable changes to Honeywood are documented here.

## [1.1.0] — Unreleased

### Added

- After you choose a Honeywood colour theme, Honeywood asks once whether you'd like to use Honeywood Icons too. Your choices are **Use Honeywood Icons**, **Not now** (asks again after a week) or **Don't ask again**. Your file icon theme is never changed without your click, and switching between Picture Book and Quiet Ink doesn't ask again.
- Commands **Honeywood: Set Up Colours and Icons** and **Honeywood: Use Honeywood Icons**.

### Changed

- Honeywood now includes a small amount of code for the offer above. It starts after VS Code has finished loading, does nothing unless a Honeywood colour theme is in use, and collects no data.

## [1.0.0]

First stable release.

### Added

- **Honeywood — Picture Book** colour theme. Cream editor and powder-blue interface, with a separate colour for each kind of code: keywords, declarations, strings, functions, numbers, types, parameters and decorators.
- **Honeywood — Quiet Ink** colour theme. The same interface, with a calmer syntax style: four dusty accents, plus bold types and italic parameters and comments.
- Semantic highlighting colours that match each style, for languages with semantic tokens (for example TypeScript).
- Terminal (ANSI) colours, bracket-pair colours, Git decoration colours and diff colours matched to the palette.
- **Honeywood Icons** file icon theme with 58 original icons:
  - 12 woodland-motif folder types, each with an open variant: src, tests, docs, assets, config, public, components, lib, scripts, dist, node_modules and .git.
  - 31 file icons covering common languages, data and config formats, documents, media and tooling files, plus default file and folder icons.
- Every syntax colour meets a contrast ratio of at least 4.5 : 1 on the editor, the current-line highlight, both selection states and the peek editor.

### Known issues

- Light theme only.
- Tier 2 file types (for example Makefile, CSV, Ruby, PHP) use the default icons.
- On the yellow current-search-match highlight, function names measure about 4.2 : 1.
