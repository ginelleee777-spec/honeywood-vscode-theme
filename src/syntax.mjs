// Two candidate syntax styles for owner comparison. Both use the same
// roles; only the colour assignments differ.
import { base as b, companion as c, syntax as syn } from "./palette.mjs";

// Role -> TextMate scopes (shared by both variants).
const scopes = {
  comment: ["comment", "punctuation.definition.comment", "string.quoted.docstring"],
  keyword: [
    "keyword", "keyword.control", "keyword.operator.new", "keyword.operator.expression",
    "keyword.operator.logical.python", "keyword.operator.word",
  ],
  storage: ["storage", "storage.type", "storage.modifier", "keyword.declaration"],
  operator: ["keyword.operator", "punctuation.separator", "punctuation.terminator", "punctuation.accessor"],
  punctuation: ["punctuation", "meta.brace", "punctuation.definition.tag"],
  string: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
  escape: ["constant.character.escape", "string.regexp", "constant.other.placeholder"],
  number: ["constant.numeric", "keyword.other.unit"],
  constant: ["constant.language", "constant.other", "variable.other.constant", "support.constant"],
  function: ["entity.name.function", "support.function", "meta.function-call.generic", "variable.function"],
  type: [
    "entity.name.type", "entity.name.class", "support.type", "support.class",
    "entity.other.inherited-class", "storage.type.primitive",
  ],
  variable: ["variable", "variable.other.readwrite", "meta.definition.variable"],
  parameter: ["variable.parameter", "meta.parameter"],
  property: ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key"],
  self: ["variable.language", "variable.parameter.function.language.special.self.python"],
  decorator: ["entity.name.function.decorator", "meta.decorator", "punctuation.decorator"],
  tag: ["entity.name.tag"],
  attribute: ["entity.other.attribute-name"],
  cssSelector: ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css", "entity.other.attribute-name.pseudo-class.css"],
  cssProperty: ["support.type.property-name", "support.type.vendored.property-name"],
  cssValue: ["support.constant.property-value", "support.constant.color", "constant.other.color"],
  invalid: ["invalid", "invalid.illegal"],
  markupHeading: ["markup.heading", "entity.name.section"],
  markupLink: ["markup.underline.link", "string.other.link"],
};

// Role -> { foreground, fontStyle }.
const q = syn.quiet;
const p = syn.picture;
const sh = syn.shared;

export const variants = {
  // Calm and professional: four dusty accent hues; structure is carried by
  // weight and slant (bold types, italic parameters/comments) rather than
  // extra colours.
  "quiet-ink": {
    label: "Quiet Ink",
    roles: {
      comment: { foreground: sh.comment, fontStyle: "italic" },
      keyword: { foreground: q.berry },
      storage: { foreground: q.berry },
      operator: { foreground: sh.punctuation },
      punctuation: { foreground: sh.punctuation },
      string: { foreground: q.forest },
      escape: { foreground: q.forest, fontStyle: "bold" },
      number: { foreground: q.honey },
      constant: { foreground: q.honey },
      function: { foreground: q.blue },
      type: { foreground: b.warmInk, fontStyle: "bold" },
      variable: { foreground: b.warmInk },
      parameter: { foreground: b.warmInk, fontStyle: "italic" },
      property: { foreground: b.warmInk },
      self: { foreground: q.berry, fontStyle: "italic" },
      decorator: { foreground: q.blue, fontStyle: "italic" },
      tag: { foreground: q.berry },
      attribute: { foreground: q.honey },
      cssSelector: { foreground: q.blue },
      cssProperty: { foreground: b.warmInk },
      cssValue: { foreground: q.honey },
      invalid: { foreground: c.brick, fontStyle: "underline" },
      markupHeading: { foreground: q.blue, fontStyle: "bold" },
      markupLink: { foreground: q.blue, fontStyle: "underline" },
    },
    semantic: {
      function: q.blue, method: q.blue,
      class: { foreground: b.warmInk, bold: true },
      interface: { foreground: b.warmInk, bold: true },
      type: { foreground: b.warmInk, bold: true },
      enum: { foreground: b.warmInk, bold: true },
      typeParameter: { foreground: b.warmInk, bold: true },
      namespace: b.warmInk,
      parameter: { foreground: b.warmInk, italic: true },
      variable: b.warmInk, property: b.warmInk,
      "variable.readonly": b.warmInk,
      "variable.defaultLibrary": q.honey,
      enumMember: q.honey,
      decorator: { foreground: q.blue, italic: true },
      selfParameter: { foreground: q.berry, italic: true },
    },
  },

  // Colourful and playful: a separate vivid hue for each major category.
  "picture-book": {
    label: "Picture Book",
    roles: {
      comment: { foreground: sh.comment, fontStyle: "italic" },
      keyword: { foreground: p.berry },
      storage: { foreground: p.acorn },
      operator: { foreground: sh.punctuation },
      punctuation: { foreground: sh.punctuation },
      string: { foreground: p.forest },
      escape: { foreground: p.thistle },
      number: { foreground: p.honey },
      constant: { foreground: p.honey },
      function: { foreground: p.blue },
      type: { foreground: p.heather },
      variable: { foreground: b.warmInk },
      parameter: { foreground: p.pond, fontStyle: "italic" },
      property: { foreground: b.warmInk },
      self: { foreground: p.berry, fontStyle: "italic" },
      decorator: { foreground: p.thistle },
      tag: { foreground: p.berry },
      attribute: { foreground: p.honey },
      cssSelector: { foreground: p.heather },
      cssProperty: { foreground: p.pond },
      cssValue: { foreground: p.honey },
      invalid: { foreground: c.brick, fontStyle: "underline" },
      markupHeading: { foreground: p.blue, fontStyle: "bold" },
      markupLink: { foreground: p.blue, fontStyle: "underline" },
    },
    semantic: {
      function: p.blue, method: p.blue,
      class: p.heather, interface: p.heather, type: p.heather, enum: p.heather, typeParameter: p.heather,
      namespace: p.heather,
      parameter: { foreground: p.pond, italic: true },
      variable: b.warmInk, property: b.warmInk,
      "variable.readonly": b.warmInk,
      "variable.defaultLibrary": p.honey,
      enumMember: p.honey,
      decorator: p.thistle,
      selfParameter: { foreground: p.berry, italic: true },
    },
  },
};

// Order matters: later rules win ties in TextMate scope matching, so the
// more specific roles come last.
const order = [
  "variable", "punctuation", "operator", "keyword", "storage", "string", "escape",
  "number", "constant", "function", "type", "parameter", "property", "self",
  "decorator", "tag", "attribute", "cssSelector", "cssProperty", "cssValue",
  "comment", "invalid", "markupHeading", "markupLink",
];

export function tokenColors(variant) {
  return order.map((role) => ({
    name: role,
    scope: scopes[role],
    settings: { ...variant.roles[role] },
  }));
}
