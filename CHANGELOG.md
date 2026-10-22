# Changelog

All notable changes to Honeywood are documented here.

## [1.2.0] — Unreleased

### Added

- **Honeywood Storybook**, an optional illustration panel in the Explorer. It starts collapsed below your files, and you can open, resize or hide it like any Explorer section.
  - It shows an original, gently animated Honeywood woodland scene. Four woodland friends (Bramble the bear cub, Willow the hare, Pip the dormouse and Tansy the wildcat kitten) sit beside a river under a big oak, with a beehive, a little bridge and daisies. Bees drift, the water flows, leaves sway, and the friends breathe and blink. Everything moves slowly and quietly.
  - **Honeywood: Pause Storybook Animation** and **Resume Storybook Animation**, plus a setting to turn the animation off. The scene is always still when your system or VS Code asks for reduced motion.
  - **Honeywood: Choose Sidebar Illustration** shows a picture of your own instead (PNG, JPEG, WebP, GIF, AVIF or BMP). **Honeywood: Use Default Illustration** switches back, and **Honeywood: Show Storybook** opens the panel.
  - Settings for an optional caption, and for showing the whole picture or filling the panel.
  - If a chosen picture is missing, unreadable or not a valid image, the panel shows the woodland scene with a short explanation.
- Privacy: only the picture's path is stored, in your user settings, and it isn't synced. The picture is never copied, uploaded or sent anywhere, and the panel loads nothing from the internet.

### Changed

- Honeywood now prefers to run on your local machine in remote windows, so a chosen picture refers to a file on your own computer.

## [1.1.0]

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
