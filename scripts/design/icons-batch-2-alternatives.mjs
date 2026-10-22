// HISTORICAL (superseded 2026-10-21: owner chose 1A, 2A, 3A, now in icons-batch-2.mjs).
// Kept so the comparison can be regenerated. Was: PROPOSAL ONLY: comparison alternatives for the three batch 2 issues at 16px.
// Writes icons/batches/batch-2-alternatives/ (NOT packaged, NOT wired into the
// icon theme). The current batch 2 designs are left untouched.
//   node scripts/design/icons-batch-2-alternatives.mjs
import { writeBatch } from "./icon-kit.mjs";

// Proposed extra category tints (closed body / open front panel).
const apricot = ["#F3D2B0", "#F8E3CD"]; // warm "harvest" tint for build output
const heather = ["#D6CBE8", "#E6DFF1"]; // soft purple, from the palette's heather family
const parchment = ["#E3DCCD", "#EEE9DE"]; // the dimmed tint already used by node_modules

// A side-on log: bark body with a lighter end-grain ring, at vertical offset y.
const log = (y, x0 = -6.4, x1 = 4.2, h = 3.4) =>
  `    <path d="M${x0} ${y}L${x1} ${y}Q${x1 + 1.7} ${y + h / 2} ${x1} ${y + h}L${x0} ${y + h}Q${x0 - 0.8} ${y + h / 2} ${x0} ${y}Z" fill="#C9A77A"/>\n` +
  `    <ellipse cx="${x1}" cy="${y + h / 2}" rx="1.5" ry="${h / 2}" fill="#EAD7B4"/>`;

const emblems = {
  // Issue 1 (scripts): an UPRIGHT feather, so it no longer echoes lib's diagonal trowel.
  quillUpright: `    <path d="M0 -7.4Q4.4 -4.4 3.6 1.4Q2.8 4.6 0 5.2Q-2.8 4.6 -3.6 1.4Q-4.4 -4.4 0 -7.4Z" fill="#FFFDF8"/>\n    <path d="M0 -5.8L0 7.4"/>`,
  // Issue 1, variant: feather standing in a dark inkpot (a heavier silhouette at 16px).
  quillInkpot: `    <path d="M0.8 -7.8Q3.8 -5.2 3.2 -1.2Q2.6 1 0.8 1.4Q-1.2 0.9 -1.6 -1.3Q-1.9 -5.4 0.8 -7.8Z" fill="#FFFDF8"/>\n    <path d="M0.8 -6.4L0.4 2.6"/>\n    <path d="M-4.8 2.2L4.8 2.2L4.2 6.8Q0 7.6 -4.2 6.8Z" fill="#5E6E80"/>`,
  // Issue 2 (node_modules): two side-on logs with a clear gap, not a 2-over-1 pyramid.
  logsTwo: log(-4.6) + "\n" + log(1.6),
  // Issue 2, variant: three slimmer side-on logs.
  logsThree: log(-6, -6.4, 4.2, 2.8) + "\n" + log(-1.4, -6.4, 4.2, 2.8) + "\n" + log(3.2, -6.4, 4.2, 2.8),
  // Issue 3: current emblems, unchanged, re-tinted only.
  basket: `    <path d="M-4.6 -0.8Q-4.6 -6.6 0 -6.6Q4.6 -6.6 4.6 -0.8"/>\n    <path d="M-6.6 -0.8L6.6 -0.8L5.2 5.8Q0 6.9 -5.2 5.8Z" fill="#D9B98A"/>\n    <path d="M-5.8 2.6L5.8 2.6"/>`,
  twig: `    <path d="M-3.8 6.6Q-3.2 0.4 -3.8 -4.4"/>\n    <path d="M-3.6 2.4Q1.4 2 3.4 -2.6"/>\n    <circle cx="-3.8" cy="-5" r="2" fill="#8DB38A"/>\n    <circle cx="3.8" cy="-3.6" r="2" fill="#8DB38A"/>`,
};

const folders = [
  // [file name, tint, emblem]
  ["folder-scripts-upright", "code", "quillUpright"],
  ["folder-scripts-inkpot", "code", "quillInkpot"],
  ["folder-node-modules-logs2", "dimmed", "logsTwo"],
  ["folder-node-modules-logs3", "dimmed", "logsThree"],
  ["folder-dist-apricot", apricot, "basket"],
  ["folder-dist-parchment", parchment, "basket"],
  ["folder-git-heather", heather, "twig"],
  ["folder-git-parchment", parchment, "twig"],
];

writeBatch("batch-2-alternatives", folders, emblems, {});
