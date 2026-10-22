// Design aid (not part of the build): for each syntax role, keep its hue and
// chroma and find the LIGHTEST OKLCH lightness that still reaches the target
// contrast on every editor surface text can sit on. Lighter = more vivid.
//   node scripts/derive-syntax.mjs
import { contrast } from "./lib/contrast.mjs";
import { oklchToRgb, inGamut, rgbToHex, hexToOklch } from "./lib/color.mjs";

const surfaces = {
  cream: "#FFF9F0",
  lineHighlight: "#F8F1E5",
  selection: "#D4E4F4",
  selectionInactive: "#E3ECF5",
  peekEditor: "#FBF4E8",
};
const TARGET = 4.6; // 4.5 AA + a small margin for rounding/antialiasing

function derive(H, C) {
  for (let L = 0.7; L > 0.2; L -= 0.0025) {
    let c = C;
    let rgb = oklchToRgb(L, c, H);
    while (!inGamut(rgb) && c > 0) rgb = oklchToRgb(L, (c -= 0.002), H);
    const hex = rgbToHex(rgb);
    if (Object.values(surfaces).every((s) => contrast(hex, s) >= TARGET)) return { hex, L, C: c };
  }
}

// [name, hue, chroma]. Quiet Ink = dusty (lower chroma); Picture Book = vivid.
const starts = { berry: "#88475F", forest: "#42634A", blue: "#315F91", honey: "#80520D", heather: "#705091" };
console.log("owner starting points (L, C, H):");
for (const [k, v] of Object.entries(starts)) console.log(" ", k, v, hexToOklch(v).map((n) => n.toFixed(3)).join(", "));

const roles = [
  ["QI berry", 0, 0.105], ["QI forest", 148, 0.085], ["QI blue", 252, 0.1], ["QI honey", 72, 0.1],
  ["QI comment", 60, 0.022],
  ["PB berry", 8, 0.15], ["PB acorn", 42, 0.135], ["PB forest", 150, 0.125], ["PB blue", 255, 0.135],
  ["PB honey", 76, 0.125], ["PB heather", 305, 0.14], ["PB pond", 200, 0.09], ["PB thistle", 335, 0.14],
  ["PB comment", 60, 0.022],
];
for (const [name, H, C] of roles) {
  const r = derive(H, C);
  const cs = Object.entries(surfaces).map(([k, s]) => `${k} ${contrast(r.hex, s).toFixed(2)}`).join("  ");
  console.log(name.padEnd(11), r.hex, `L=${r.L.toFixed(3)} C=${r.C.toFixed(3)} H=${H}`, "|", cs);
}
