// Generates icon batch 1 (APPROVED 2026-10-21) into icons/batches/batch-1/
// (NOT packaged, NOT wired into the icon theme yet). Owner choices applied:
// TSX/JSX = plain TS/JS icons; config folder = deeper powder blue.
//   node scripts/design/icons-batch-1.mjs
import { page, letters, writeBatch } from "./icon-kit.mjs";

// --- Folder emblems, centred on (0,0), about 13 x 13 units (15% larger than samples)
function gearPath(teeth = 6, rOut = 6.2, rIn = 4.5) {
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * 2 * Math.PI;
    const w = Math.PI / teeth / 1.7;
    for (const [r, da] of [[rIn, -w * 1.25], [rOut, -w * 0.62], [rOut, w * 0.62], [rIn, w * 1.25]]) {
      pts.push([r * Math.cos(a + da), r * Math.sin(a + da)]);
    }
  }
  return "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
}
const emblems = {
  leaf: `    <path d="M-5.6 5.6Q-6 -3.2 5 -5.8Q6.2 4.8 -5.6 5.6Z" fill="#8DB38A"/>\n    <path d="M-5.2 5.2Q-1.2 0.6 2.4 -2.6"/>`,
  acorn: `    <path d="M-4.9 -0.6Q-4.6 5.8 0 6.8Q4.6 5.8 4.9 -0.6Z" fill="#E3C590"/>\n    <path d="M-6.1 -0.4Q-6.3 -5.3 0 -5.6Q6.3 -5.3 6.1 -0.4Q0 0.4 -6.1 -0.4Z" fill="#9C7A55"/>\n    <path d="M0 -5.6Q0.3 -7.4 2 -8.1"/>`,
  book: `    <path d="M0 -2.6Q-3.3 -5 -6.8 -4.1L-6.8 4.6Q-3.3 3.8 0 5.8Z" fill="#FFFDF8"/>\n    <path d="M0 -2.6Q3.3 -5 6.8 -4.1L6.8 4.6Q3.3 3.8 0 5.8Z" fill="#FFFDF8"/>`,
  gear: `    <path d="${gearPath()}" fill="#FFFDF8"/>\n    <circle r="1.9" fill="#B8D0E9"/>`,
  picture: `    <circle cx="2.6" cy="-2.8" r="2.4" fill="#F2D27C"/>\n    <path d="M-6.6 5.2Q-2.6 -2.6 1.4 2Q3.9 -0.6 6.6 5.2Z" fill="#8DB38A"/>`,
};

const folders = [
  // [file name, tint, emblem]
  ["folder-src", "code", "leaf"],
  ["folder-tests", "plain", "acorn"],
  ["folder-docs", "content", "book"],
  ["folder-assets", "content", "picture"],
  ["folder-config", "tooling", "gear"],
];

const S = "M22 15.4Q20.8 14.4 19.4 14.6Q17.4 14.9 17.6 16.9Q17.8 18.6 19.8 19.2Q22.2 19.8 22 22.1Q21.7 24.3 19.4 24.2Q18 24.1 17.2 23.2";
const J = "M11.4 14.6Q13.6 14.4 15.6 14.6M14 14.6Q14.2 19.6 14 22Q13.8 24.6 11.4 24.3Q10.2 24.1 9.6 23.2";

// TSX/JSX reuse the TypeScript/JavaScript icons (owner decision: option C).
const files = {
  javascript: page("#F2D27C", "#E2BE5E") + "\n" + letters("#5E400B", J) + "\n" + letters("#5E400B", S),
  json: page("#DCE8D6", "#C9DEC1") + "\n" + letters("#42634A", "M14.2 13.8Q12 13.8 12.2 16L12.2 17.6Q12.2 19.2 10.6 19.4Q12.2 19.6 12.2 21.2L12.2 22.8Q12 25 14.2 25M18.2 13.8Q20.4 13.8 20.2 16L20.2 17.6Q20.2 19.2 21.8 19.4Q20.2 19.6 20.2 21.2L20.2 22.8Q20.4 25 18.2 25"),
  markdown: page("#FFFDF8", "#E8DECF") + "\n" + letters("#3E6489", "M9.8 23.6L9.8 15L13 19.4L16.2 15L16.2 23.6M20.4 15L20.4 23.2M17.8 20.6L20.4 23.4L23 20.6"),
  image: page("#F2DDE3", "#E8C9D3") + `\n  <g stroke-width="1.8">\n    <circle cx="18.6" cy="15.8" r="2.3" fill="#F2D27C"/>\n    <path d="M9.8 24.6Q13 17.4 16.4 21.6Q18.9 19 22.6 24.6Z" fill="#8DB38A"/>\n  </g>`,
};

writeBatch("batch-1", folders, emblems, files);
