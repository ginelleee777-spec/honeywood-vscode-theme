// Generates icon batch 3 (Tier 1 file icons: web + config group, APPROVED
// 2026-10-21) into icons/batches/batch-3/ — NOT packaged, NOT wired into the theme.
//   node scripts/design/icons-batch-3.mjs
// Same page shape as the approved file icons; one simple mark per type,
// drawn as paths (letters 2.3, pictogram outlines 1.8).
//
// Revision 1 (owner review, 2026-10-21) — APPROVED with these choices:
//   config: chunky 6-tooth gear filled storybook blue, clear centre, deeper powder page (A)
//   env:    horizontal key with a 2.3 shaft and two long teeth, butter page (A)
//   scss:   plain "S" (S# stayed crowded at true 16px)
//   JSON, YAML and XML keep sage; html, css, yaml, xml and shell are unchanged.
import { page, letters, writeBatch } from "./icon-kit.mjs";

const f = (n) => n.toFixed(2);
const INK = "#403A36";

// Chunky gear: six broad teeth (tooth width ≈ gap width) around (cx, cy).
function gearPath(cx, cy, teeth = 6, rOut = 6.9, rIn = 5.0) {
  const step = (2 * Math.PI) / teeth;
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [r, da] of [[rIn, -0.36 * step], [rOut, -0.22 * step], [rOut, 0.22 * step], [rIn, 0.36 * step]]) {
      pts.push(`${f(cx + r * Math.cos(a + da))} ${f(cy + r * Math.sin(a + da))}`);
    }
  }
  return "M" + pts.join("L") + "Z";
}
const mark = (inner) => `  <g stroke-width="1.8">\n${inner}\n  </g>`;

// Page colour pairs [page, fold] chosen by the owner (option A).
const pages = {
  powderDeep: ["#B8D0E9", "#A3C0DE"], // approved config-folder tint
  butter: ["#F5E8B5", "#E6D598"], // base palette butter yellow (also the Python page)
};

const configIcon = ([fill, fold]) =>
  page(fill, fold) + "\n" + mark(`    <path d="${gearPath(16.2, 19.4)}" fill="#547A9F"/>\n    <circle cx="16.2" cy="19.4" r="2.3" fill="${fill}"/>`);
const envIcon = ([fill, fold]) =>
  page(fill, fold) + "\n" +
  mark(`    <circle cx="11.8" cy="19.4" r="3.4" fill="#F2D27C"/>`) + "\n" +
  letters(INK, "M15.4 19.4L22.6 19.4M19.6 19.4L19.6 22.8M22.6 19.4L22.6 22.2");

const S_LARGE = "M20.6 15.6Q19 14.3 16.6 14.6Q12.6 15.1 12.9 17.9Q13.2 19.6 16.4 20.1Q20.2 20.7 20 22.8Q19.7 24.6 16.4 24.5Q13.9 24.4 12.4 23.1";

const files = {
  html: page("#F3D2B0", "#E6BC92") + "\n" + letters("#8A3A1E", "M14 15.2L10.2 19.4L14 23.6M18.4 15.2L22.2 19.4L18.4 23.6"),
  css: page("#D6CBE8", "#C2B3DB") + "\n" + letters("#5E3F86", "M14 14.6L13 24.4M19 14.6L18 24.4M10.4 17.8L21.6 17.8M10 21.4L21.2 21.4"),
  // Owner choice: plain S (S# stayed crowded at true 16px).
  scss: page("#F2DDE3", "#E6C6D0") + "\n" + letters("#88475F", S_LARGE),
  yaml: page("#DCE8D6", "#C9DEC1") + "\n" + letters("#42634A", "M11.4 14.8L16 20L20.6 14.8M16 20L16 24.6"),
  // Owner choice A: chunky gear on the approved config-folder tint.
  config: configIcon(pages.powderDeep),
  xml: page("#DCE8D6", "#C9DEC1") + "\n" + letters("#42634A", "M12.8 15.4L9.6 19.4L12.8 23.4M19.6 15.4L22.8 19.4L19.6 23.4M17.6 14.6L14.8 24.2"),
  shell: page("#E3DCCD", "#D3C9B5") + "\n" + letters(INK, "M10.6 15.4L14.6 19.2L10.6 23M16.6 23.6L22 23.6"),
  // Owner choice A: horizontal key on butter.
  env: envIcon(pages.butter),
};

writeBatch("batch-3", [], {}, files);
