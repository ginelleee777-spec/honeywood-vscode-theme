// Single source of truth for every colour in Honeywood.
// `base` = the owner-approved palette. `companion` = approved deeper shades
// for text and the interface. `ui` = routine derived tints. All approved.

export const base = {
  cream: "#FFF9F0",
  powderBlue: "#DCEAF7",
  storybookBlue: "#547A9F",
  softSage: "#DCE8D6",
  leafGreen: "#4E7054",
  blushPink: "#F2DDE3",
  dustyRose: "#98566D",
  butterYellow: "#F5E8B5",
  warmInk: "#403A36",
};

// Companion text colours for the interface and terminal. Target: >= 4.5:1 on
// cream, the current-line highlight and the selection (WCAG AA normal text).
export const companion = {
  deepBlue: "#3E6489", // links, cursor, buttons, focus
  deepLeaf: "#42634A", // git "added", terminal green
  berry: "#88475F", // highlights in lists/suggestions, terminal magenta
  honey: "#875A14", // warnings, terminal yellow (was #83601E: 4.43 on selection)
  plum: "#6A5486", // bracket-pair colour 5
  pond: "#356B6C", // bracket-pair colour 6, terminal cyan
  bark: "#765639", // reserved
  brick: "#A33F37", // errors, invalid code, git "deleted", terminal red
  comment: "#6E6158", // placeholders, code lens (was #73685F: 4.18 on selection)
  mutedInk: "#655C55", // inactive tabs, breadcrumbs, secondary text
};

// Syntax colours, derived in OKLCH by scripts/derive-syntax.mjs: each
// keeps its hue/chroma and is as light (vivid) as possible while reaching
// >= 4.6:1 on cream, line highlight, both selections and the peek editor.
// Quiet Ink = dusty, lower chroma; Picture Book = vivid, higher chroma.
export const syntax = {
  quiet: {
    berry: "#974B65", // keywords (OKLCH H 0, C 0.105)
    forest: "#3D6E45", // strings (H 148, C 0.085)
    blue: "#35669A", // functions (H 252, C 0.100)
    honey: "#875A14", // numbers, constants (H 72, C 0.100)
  },
  picture: {
    berry: "#AC3A58", // control-flow keywords (H 8, C 0.150)
    acorn: "#A5471E", // declarations: def/class/const/function (H 42, C 0.135)
    forest: "#157237", // strings (H 150, C 0.125)
    blue: "#2564AF", // functions (H 255, C 0.135)
    honey: "#865B03", // numbers, constants (H 76, C 0.105, gamut-limited)
    heather: "#7B4FA7", // types, classes (H 305, C 0.140)
    pond: "#066E73", // parameters, CSS properties (H 200, C 0.082)
    thistle: "#974488", // decorators, escapes, regex (H 335, C 0.140)
  },
  shared: {
    comment: "#6E6158", // warm grey-brown, always italic (H 60, C 0.022)
    punctuation: "#524A44", // brackets, operators, separators
  },
};

// Routine UI tints derived from the base palette (not text colours).
export const ui = {
  lineHighlight: "#F8F1E5",
  selection: "#D4E4F4",
  selectionInactive: "#E3ECF5",
  sidebarSection: "#D0E2F3",
  activityBar: "#D0E1F2",
  listActive: "#C4D9EE",
  listHover: "#CFE1F2",
  chromeBorder: "#C5D8EB",
  paperBorder: "#E8DECF",
  widget: "#FFFDF8",
  lineNumber: "#918577",
  indentGuide: "#ECE3D5",
  indentGuideActive: "#C9BCA8",
  whitespace: "#E0D6C7",
  findMatch: "#EDD98C",
  findMatchOther: "#F5E8B5",
  inactiveIcon: "#5F758B",
};

// Terminal ANSI colours (terminal background = cream).
export const ansi = {
  black: base.warmInk,
  red: companion.brick,
  green: companion.deepLeaf,
  yellow: companion.honey,
  blue: companion.deepBlue,
  magenta: companion.berry,
  cyan: companion.pond,
  white: "#B8AEA3", // decorative / background use; exempt from text contrast
  brightBlack: companion.comment,
  brightRed: "#B0463D",
  brightGreen: "#47704F",
  brightYellow: "#8E6A1F",
  brightBlue: "#466E99",
  brightMagenta: "#965069",
  brightCyan: "#397476",
  brightWhite: "#E9E0D3", // decorative / background use; exempt
};

// Pastel icon fills (slightly deeper than the base surfaces so they read on
// the powder-blue sidebar). Proposed alongside the sample icons.
export const iconFill = {
  folder: "#F2E0A0",
  folderOpen: "#F7EBC0",
  sage: "#C9DEC1",
  leaf: "#8DB38A",
  acornCap: "#9C7A55",
  acornNut: "#E3C590",
  powder: "#C6DBEF",
  page: "#FFFDF8",
  butterPage: "#F5E8B5",
  bluePage: "#DCEAF7",
};
