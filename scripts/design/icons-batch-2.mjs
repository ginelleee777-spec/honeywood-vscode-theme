// Generates icon batch 2 (the remaining Tier 1 folders) into
// icons/batches/batch-2/ — NOT packaged, NOT wired into the icon theme.
// Owner choices applied (2026-10-21): 1A upright feather for scripts,
// 2A two side-on logs for node_modules, 3A apricot dist + heather .git.
//   node scripts/design/icons-batch-2.mjs
// Emblems are centred on (0,0) within about 13 x 13 units, like batch 1.
import { writeBatch } from "./icon-kit.mjs";

const f = (n) => n.toFixed(2);

// Five rounded petals: r(θ) = base + amp·cos(5θ), sampled as a closed polyline.
function daisyPath(base = 4.6, amp = 1.9, steps = 60) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * 2 * Math.PI - Math.PI / 2;
    const r = base + amp * Math.cos(5 * (a + Math.PI / 2));
    pts.push(`${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`);
  }
  return "M" + pts.join("L") + "Z";
}

// Flat-topped hexagon of radius r centred on (cx, cy).
function hex(cx, cy, r = 3.1) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push(`${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`);
  }
  return "M" + pts.join("L") + "Z";
}

// A side-on log: bark body with a lighter end-grain ring, at vertical offset y.
const log = (y, x0 = -6.4, x1 = 4.2, h = 3.4) =>
  `    <path d="M${x0} ${y}L${x1} ${y}Q${x1 + 1.7} ${y + h / 2} ${x1} ${y + h}L${x0} ${y + h}Q${x0 - 0.8} ${y + h / 2} ${x0} ${y}Z" fill="#C9A77A"/>\n` +
  `    <ellipse cx="${x1}" cy="${y + h / 2}" rx="1.5" ry="${h / 2}" fill="#EAD7B4"/>`;

const emblems = {
  // public / static: a daisy, open to visitors
  daisy: `    <path d="${daisyPath()}" fill="#FFFDF8"/>\n    <circle r="2" fill="#F2D27C"/>`,
  // components / ui: three honeycomb cells (no bees)
  honeycomb: [hex(-2.75, 1.6), hex(2.75, 1.6), hex(0, -3.2)].map((d) => `    <path d="${d}" fill="#F2D27C"/>`).join("\n"),
  // lib / utils / helpers: a garden trowel
  trowel: `    <path d="M0.4 0.4L-1.6 -4.6Q-4.2 -6.8 -6.6 -6.6Q-6.8 -4.2 -4.6 -1.6Z" fill="#C9D6E2"/>\n    <path d="M0 2L4.4 6.4Q5.6 7.4 6.6 6.4Q7.6 5.4 6.4 4.4L2 0Z" fill="#9C7A55"/>`,
  // scripts / bin: an upright feather (1A), unlike lib's diagonal trowel
  quill: `    <path d="M0 -7.4Q4.4 -4.4 3.6 1.4Q2.8 4.6 0 5.2Q-2.8 4.6 -3.6 1.4Q-4.4 -4.4 0 -7.4Z" fill="#FFFDF8"/>\n    <path d="M0 -5.8L0 7.4"/>`,
  // dist / build / out: a woven basket (the harvest)
  basket: `    <path d="M-4.6 -0.8Q-4.6 -6.6 0 -6.6Q4.6 -6.6 4.6 -0.8"/>\n    <path d="M-6.6 -0.8L6.6 -0.8L5.2 5.8Q0 6.9 -5.2 5.8Z" fill="#D9B98A"/>\n    <path d="M-5.8 2.6L5.8 2.6"/>`,
  // node_modules / vendor: two side-on logs with a clear gap (2A)
  logs: log(-4.6) + "\n" + log(1.6),
  // .git: a branching twig with buds
  twig: `    <path d="M-3.8 6.6Q-3.2 0.4 -3.8 -4.4"/>\n    <path d="M-3.6 2.4Q1.4 2 3.4 -2.6"/>\n    <circle cx="-3.8" cy="-5" r="2" fill="#8DB38A"/>\n    <circle cx="3.8" cy="-3.6" r="2" fill="#8DB38A"/>`,
};

const folders = [
  // [file name, tint, emblem]
  ["folder-public", "content", "daisy"],
  ["folder-components", "code", "honeycomb"],
  ["folder-lib", "code", "trowel"],
  ["folder-scripts", "code", "quill"],
  ["folder-dist", "build", "basket"],
  ["folder-node-modules", "dimmed", "logs"],
  ["folder-git", "vcs", "twig"],
];

writeBatch("batch-2", folders, emblems, {});
