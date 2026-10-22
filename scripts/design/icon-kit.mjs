// Shared building blocks for every icon batch, so all batches use the same
// shapes, tints and stroke weights (outline 2.0, emblem outline 1.8, letters 2.3).
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";

export const INK = "#403A36";

// Folder body tints by category (closed body / open front panel).
export const tint = {
  code: ["#C9DEC1", "#DDEBD7"], // sage: src, lib, components, scripts
  plain: ["#F2E0A0", "#F7EBC0"], // butter: default, tests
  content: ["#EDC6D2", "#F5DCE4"], // blush: docs, assets, public
  tooling: ["#B8D0E9", "#D3E3F3"], // deeper powder (owner choice): config
  build: ["#F3D2B0", "#F8E3CD"], // apricot (owner choice 3A): dist, build, out
  vcs: ["#D6CBE8", "#E6DFF1"], // heather (owner choice 3A): .git
  dimmed: ["#E3DCCD", "#EEE9DE"], // muted parchment: node_modules, vendor
};

export const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n${body}\n</svg>\n`;

// --- Folder shapes (unchanged from the approved samples)
export const folderClosed = (fill) =>
  `  <path d="M3.6 9Q3.4 6.2 6 6.2L11.6 6.2Q12.9 6.2 13.7 7.3L14.9 9.1L26.2 9.1Q28.7 9 28.5 11.6Q28.7 18.4 28.5 25.1Q28.6 27.2 26.3 27.1Q16 27.4 5.8 27.1Q3.4 27.2 3.5 25Q3.3 17 3.6 9Z" fill="${fill}"/>\n  <path d="M3.6 12.6Q16 12.1 28.4 12.6"/>`;
export const folderOpen = (back, front) =>
  `  <path d="M3.5 25Q3.3 17 3.6 9Q3.4 6.2 6 6.2L11.6 6.2Q12.9 6.2 13.7 7.3L14.9 9.1L24.4 9.1Q26.8 9 26.7 11.5L26.7 13.6" fill="${back}"/>\n  <path d="M3.5 25.2L7.6 15.2Q8.2 13.7 9.8 13.7Q19.6 13.5 29 13.7Q30.6 13.8 30.1 15.4L26.9 25.4Q26.3 27.2 24.4 27.1Q15 27.4 5.6 27.1Q3.4 27.1 3.5 25.2Z" fill="${front}"/>`;
export const place = (emblem, x, y) => `  <g transform="translate(${x} ${y})" stroke-width="1.8">\n${emblem}\n  </g>`;
export const CLOSED_AT = [21.4, 20];
export const OPEN_AT = [19.6, 20.6];

// --- File page (unchanged shape)
export const page = (fill, fold) =>
  `  <path d="M7.5 3.6Q13 3.3 18.6 3.6L25 10Q25.3 19.2 25 28.4Q16.2 28.8 7.5 28.4Q7.2 16 7.5 3.6Z" fill="${fill}"/>\n  <path d="M18.6 3.6Q18.4 7 18.7 9.8Q21.9 10.1 25 10" fill="${fold}"/>`;
export const letters = (color, d) => `  <path d="${d}" stroke="${color}" stroke-width="2.3"/>`;

// Writes a batch into icons/batches/<name>/, clearing old SVGs first so
// options the owner did not choose cannot linger.
export function writeBatch(name, folders, emblems, files) {
  const out = new URL(`../../icons/batches/${name}/`, import.meta.url);
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(out)) if (f.endsWith(".svg")) rmSync(new URL(f, out));
  const written = [];
  const write = (file, body) => {
    writeFileSync(new URL(`${file}.svg`, out), svg(body));
    written.push(file);
  };
  for (const [file, t, e] of folders) {
    const [body, front] = Array.isArray(t) ? t : tint[t]; // a tint key, or [closed, open] for proposals
    write(file, folderClosed(body) + "\n" + place(emblems[e], ...CLOSED_AT));
    write(`${file}-open`, folderOpen(body, front) + "\n" + place(emblems[e], ...OPEN_AT));
  }
  for (const [file, body] of Object.entries(files)) write(file, body);
  console.log(`wrote ${written.length} SVGs to icons/batches/${name}/:`, written.join(", "));
}
