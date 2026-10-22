// Generates icon batch 4 (the remaining 17 Tier 1 file icons; APPROVED 2026-10-21) into
// icons/batches/batch-4/ — NOT packaged, NOT wired into the icon theme.
//   node scripts/design/icons-batch-4.mjs
// Same page shape and stroke rules as batches 1–3 (letters 2.3, pictogram
// outlines 1.8, page outline 2.0). Page colours come from the approved
// palette or approved folder tints; marks are original letters/pictograms.
import { page, letters, writeBatch } from "./icon-kit.mjs";

const INK = "#403A36";
const mark = (inner) => `  <g stroke-width="1.8">\n${inner}\n  </g>`;
const lines = (d, color = "#655C55") => `  <path d="${d}" stroke="${color}"/>`; // 2.0 like the page outline

// Page colour pairs [page, fold].
const P = {
  apricot: ["#F3D2B0", "#E6BC92"],
  blush: ["#F2DDE3", "#E6C6D0"],
  blushDeep: ["#EDC6D2", "#E0B0C0"],
  heather: ["#D6CBE8", "#C2B3DB"],
  powder: ["#DCEAF7", "#C6DBEF"],
  powderDeep: ["#B8D0E9", "#A3C0DE"],
  sage: ["#DCE8D6", "#C9DEC1"],
  parchment: ["#E3DCCD", "#D3C9B5"],
  butter: ["#F5E8B5", "#E6D598"],
  cream: ["#FFFDF8", "#E8DECF"],
};
const pg = ([fill, fold]) => page(fill, fold);

// Reused letter shapes (the S matches the approved TypeScript "S").
const S = "M22 15.4Q20.8 14.4 19.4 14.6Q17.4 14.9 17.6 16.9Q17.8 18.6 19.8 19.2Q22.2 19.8 22 22.1Q21.7 24.3 19.4 24.2Q18 24.1 17.2 23.2";

const files = {
  // --- Code
  // C#: a single "C" on its own deeper-blush page (owner choice; "C#" crowded at 16px).
  // C/C++ keeps "C" on heather, so the two differ by page colour.
  csharp: pg(P.blushDeep) + "\n" + letters("#6A5486", "M20.2 15.8Q18.4 14.2 15.8 14.6Q11.4 15.2 11.4 19.4Q11.4 23.6 15.8 24.2Q18.4 24.6 20.2 23"),
  // Java: drawn "J"
  java: pg(P.blush) + "\n" + letters("#A33F37", "M12.4 14.6Q15.4 14.4 18.4 14.6M16.4 14.6Q16.6 20 16.4 22.2Q16.2 24.6 13.6 24.3Q12.2 24.1 11.4 23"),
  // Go: drawn "Go"
  go: pg(P.powder) + "\n" + letters("#066E73", "M15.6 15.6Q14.4 14.4 12.6 14.6Q9.8 15 9.8 19.4Q9.8 23.8 12.6 24.2Q15.2 24.4 15.6 22.2L15.6 20.2L13.2 20.2") +
    "\n" + letters("#066E73", "M20.4 17.8Q23 17.8 23 21Q23 24.2 20.4 24.2Q17.8 24.2 17.8 21Q17.8 17.8 20.4 17.8Z"),
  // Rust: drawn "Rs" (no gear/cog logo)
  rust: pg(P.parchment) + "\n" + letters("#A33F37", "M10.4 24.2L10.4 14.8L13.4 14.8Q16 14.8 16 17.4Q16 20 13.4 20L10.4 20M13.4 20L16.2 24.2") +
    "\n" + letters("#A33F37", "M22.6 18.4Q21.8 17.6 20.6 17.7Q19 17.9 19.2 19.2Q19.4 20.4 20.8 20.8Q22.6 21.2 22.4 22.7Q22.2 24.2 20.6 24.1Q19.4 24 18.8 23.4"),
  // C / C++ (and headers): one large "C"
  c: pg(P.heather) + "\n" + letters("#2564AF", "M20.2 15.8Q18.4 14.2 15.8 14.6Q11.4 15.2 11.4 19.4Q11.4 23.6 15.8 24.2Q18.4 24.6 20.2 23"),
  // PowerShell: drawn "PS" (deliberately not the >_ logo-like mark)
  powershell: pg(P.powderDeep) + "\n" + letters(INK, "M10.6 24.2L10.6 14.8L13.6 14.8Q16.4 14.8 16.4 17.6Q16.4 20.4 13.6 20.4L10.6 20.4") + "\n" + letters(INK, S),
  // --- Data
  // SQL: database cylinder
  sql: pg(P.sage) + "\n" + mark(
    `    <path d="M10.4 16.2L10.4 23.4Q10.4 25.6 16 25.6Q21.6 25.6 21.6 23.4L21.6 16.2Z" fill="#FFFDF8"/>\n` +
    `    <path d="M10.4 19.8Q10.4 21.8 16 21.8Q21.6 21.8 21.6 19.8"/>\n` +
    `    <path d="M10.4 16.2Q10.4 14.2 16 14.2Q21.6 14.2 21.6 16.2Q21.6 18.2 16 18.2Q10.4 18.2 10.4 16.2Z" fill="#C9DEC1"/>`),
  // --- Documents
  // Plain text / logs: four ruled lines (the default file has two faint ones)
  text: pg(P.cream) + "\n" + lines("M10.6 14.6L21.6 14.6M10.6 17.9L21.6 17.9M10.6 21.2L21.6 21.2M10.6 24.5L17.4 24.5"),
  // PDF: two lines and a brick-red lower band
  pdf: pg(P.cream) + "\n" + `  <path d="M7.6 20.6L25 20.6L25 28.4Q16.2 28.8 7.5 28.4Z" fill="#A33F37"/>` + "\n" + lines("M10.6 13.4L17.2 13.4M10.6 16.8L21.6 16.8"),
  // README: "i" in a circle
  readme: pg(P.cream) + "\n" + mark(`    <circle cx="16.2" cy="19.6" r="5.8" fill="#DCEAF7"/>\n    <circle cx="16.2" cy="16.7" r="1.2" fill="#3E6489" stroke="none"/>`) +
    "\n" + letters("#3E6489", "M16.2 19L16.2 23"),
  // LICENSE: wax seal with two ribbon tails
  license: pg(P.cream) + "\n" + mark(
    `    <path d="M13.4 21L12 26.6L14.2 25.6L15.4 27.4L16.4 22Z" fill="#98566D"/>\n` +
    `    <path d="M19 21L20.4 26.6L18.2 25.6L17 27.4L16 22Z" fill="#98566D"/>\n` +
    `    <circle cx="16.2" cy="18.2" r="4.8" fill="#C9879E"/>`),
  // --- Media
  // Fonts: drawn "A"
  font: pg(P.butter) + "\n" + letters("#5E400B", "M10.6 24.4L16 14.4L21.4 24.4M12.6 21L19.4 21"),
  // Archives (zip/tar/gz/7z/rar): parcel tied with string and a bow
  archive: pg(P.apricot) + "\n" + lines("M16.2 3.8L16.2 28.2M7.8 20.2L24.8 20.2", "#765639") +
    "\n" + lines("M16.2 20.2Q13.2 16.4 12.4 18Q11.8 19.6 16.2 20.2Q19.2 16.4 20 18Q20.6 19.6 16.2 20.2", "#765639"),
  // --- Tooling
  // .gitignore / .gitattributes / .gitmodules: the .git folder's twig, on its heather tint
  gitignore: pg(P.heather) + "\n" + mark(
    `    <path d="M12.6 25.6Q13.2 20.2 12.6 15.6"/>\n    <path d="M12.8 21.6Q17.6 21.2 19.6 16.8"/>\n` +
    `    <circle cx="12.6" cy="14.4" r="2" fill="#8DB38A"/>\n    <circle cx="20.2" cy="15.6" r="2" fill="#8DB38A"/>`),
  // Lock files: padlock
  lock: pg(P.parchment) + "\n" + letters(INK, "M12.8 18.4L12.8 16Q12.8 12.6 16.2 12.6Q19.6 12.6 19.6 16L19.6 18.4") +
    "\n" + mark(`    <path d="M10.6 18.4L21.8 18.4L21.8 25.6L10.6 25.6Z" fill="#F2D27C"/>\n    <circle cx="16.2" cy="21.8" r="1.2" fill="${INK}" stroke="none"/>`),
  // Package manifests (package.json, pyproject.toml, requirements.txt, …): wooden crate
  package: pg(P.cream) + "\n" + mark(
    `    <path d="M10.2 14.8L22.2 14.8L22.2 25.8L10.2 25.8Z" fill="#D9B98A"/>\n    <path d="M10.2 18.4L22.2 18.4M10.2 22.2L22.2 22.2"/>`),
  // Dockerfile / compose: a light ribbed shipping container (no whale/logo).
  // Cream body with blue ribs: a solid blue body read as a heavy band at 16px.
  docker: pg(P.powderDeep) + "\n" + mark(
    `    <path d="M9.2 16.2L23.2 16.2L23.2 24.8L9.2 24.8Z" fill="#FFFDF8"/>\n    <path d="M12.9 17.6L12.9 23.4M16.2 17.6L16.2 23.4M19.5 17.6L19.5 23.4" stroke="#547A9F"/>`),
};

writeBatch("batch-4", [], {}, files);
