// Generates themes/*.json from src/. Run: npm run build
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { workbench } from "../src/workbench.mjs";
import { variants, tokenColors } from "../src/syntax.mjs";

export const themePath = (id) => new URL(`../themes/honeywood-${id}.json`, import.meta.url);

export function makeTheme(id) {
  const v = variants[id];
  return {
    $schema: "vscode://schemas/color-theme",
    name: `Honeywood — ${v.label}`,
    type: "light",
    semanticHighlighting: true,
    colors: workbench,
    tokenColors: tokenColors(v),
    semanticTokenColors: v.semantic,
  };
}

export const serialise = (theme) => JSON.stringify(theme, null, 2) + "\n";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const id of Object.keys(variants)) {
    writeFileSync(themePath(id), serialise(makeTheme(id)));
    console.log("wrote", fileURLToPath(themePath(id)));
  }
}
