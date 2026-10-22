// Tests for the opt-in Honeywood Icons offer (extension/icon-prompt.js) and for
// the manifest and packaging that ship it. Run: npm test
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const p = require("../extension/icon-prompt.js");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const failures = [];
let passed = 0;
function ok(cond, message) {
  if (cond) passed++;
  else failures.push(message);
}

const [PICTURE, QUIET] = p.COLOR_THEMES;
const NOW = Date.UTC(2026, 9, 22, 12);
const base = { colorTheme: PICTURE, previousColorTheme: "Default Light Modern", iconTheme: "vs-seti", state: {}, now: NOW, shownThisSession: false };
const decide = (trigger, over = {}) => p.shouldPrompt(trigger, { ...base, ...over });
function expect(trigger, over, prompt, reason, label) {
  const d = decide(trigger, over);
  ok(d.prompt === prompt && (!reason || d.reason === reason), `${label}: got ${JSON.stringify(d)}, expected prompt=${prompt}${reason ? ` (${reason})` : ""}`);
}

// --- Manifest agrees with the code
ok(JSON.stringify(pkg.contributes.themes.map((t) => t.label)) === JSON.stringify(p.COLOR_THEMES), "colour theme labels in package.json and icon-prompt.js differ");
ok(pkg.contributes.iconThemes[0].id === p.ICON_THEME_ID, "icon theme id in package.json and icon-prompt.js differ");
ok(pkg.main === "./extension/main.js", 'package.json "main" should be ./extension/main.js');
ok(JSON.stringify(pkg.activationEvents) === JSON.stringify(["onStartupFinished"]), "activationEvents should be exactly onStartupFinished");
const source = readFileSync(join(root, "extension/main.js"), "utf8");
const storybookSource = readFileSync(join(root, "extension/storybook.js"), "utf8");
const registered = [...(source + storybookSource).matchAll(/registerCommand\('([^']+)'/g)].map((m) => m[1]).sort();
ok(JSON.stringify(registered) === JSON.stringify(pkg.contributes.commands.map((c) => c.command).sort()), "registered commands differ from contributed commands");
const ignore = readFileSync(join(root, ".vscodeignore"), "utf8").split(/\r?\n/);
for (const f of ["!extension/main.js", "!extension/icon-prompt.js"]) ok(ignore.includes(f), `.vscodeignore must include ${f}`);
// Only the user's explicit choice may change the icon theme.
const updates = [...source.matchAll(/update\(\s*'iconTheme'/g)].length;
ok(updates === 1 && /async function useHoneywoodIcons/.test(source), "iconTheme must be written in exactly one place (useHoneywoodIcons)");
ok(!/iconTheme|colorTheme/.test(storybookSource), "the Storybook view must not touch the colour or icon theme");
ok(!/configurationDefaults/.test(JSON.stringify(pkg.contributes)), "no configurationDefaults: never override the icon theme silently");

// --- First-time setup
expect("themeChange", {}, true, "themeChange", "choosing Honeywood from another theme offers icons");
expect("startup", {}, true, "startup", "starting with Honeywood colours and other icons offers icons once");
expect("startup", { iconTheme: undefined }, true, null, "no icon theme set at all still offers");
expect("themeChange", { iconTheme: null }, true, null, "icon theme None still offers");

// --- Never prompts when it shouldn't
expect("startup", { colorTheme: "Default Light Modern" }, false, "not-honeywood-colours", "other colour theme");
expect("themeChange", { colorTheme: undefined }, false, "not-honeywood-colours", "colour theme unset");
expect("themeChange", { iconTheme: p.ICON_THEME_ID }, false, "already-using-icons", "already using Honeywood Icons");
expect("themeChange", { colorTheme: QUIET, previousColorTheme: PICTURE }, false, "switched-between-honeywood-styles", "Picture Book -> Quiet Ink");
expect("themeChange", { colorTheme: PICTURE, previousColorTheme: QUIET }, false, "switched-between-honeywood-styles", "Quiet Ink -> Picture Book");
expect("themeChange", { shownThisSession: true }, false, "shown-this-session", "already offered in this window");

// --- Answers
const accepted = p.stateAfterAnswer({}, p.CHOICES.use, NOW);
ok(accepted.choice === "accepted", "Use Honeywood Icons is remembered");
expect("themeChange", { state: accepted }, false, "accepted-before", "never re-offered after accepting, even if icons changed later");
expect("startup", { state: accepted, now: NOW + 365 * 864e5 }, false, "accepted-before", "accepted: a year later");

const never = p.stateAfterAnswer({ lastPromptAt: NOW }, p.CHOICES.never, NOW);
ok(never.choice === "never" && never.lastPromptAt === NOW, "Don't ask again is remembered and keeps other fields");
for (const [trigger, later] of [["startup", 1], ["themeChange", 1], ["startup", 400], ["themeChange", 400]]) {
  expect(trigger, { state: never, now: NOW + later * 864e5 }, false, "dont-ask-again", `Don't ask again: ${trigger} after ${later} day(s)`);
}

for (const answer of [p.CHOICES.notNow, undefined]) {
  const label = answer ?? "closing the notification";
  const snoozed = p.stateAfterAnswer({ lastPromptAt: NOW }, answer, NOW);
  ok(snoozed.snoozedUntil === NOW + p.SNOOZE_MS && !snoozed.choice, `${label} snoozes for ${p.SNOOZE_MS / 864e5} days`);
  expect("startup", { state: snoozed, now: NOW + 864e5 }, false, "snoozed", `${label}: restart next day`);
  expect("themeChange", { state: snoozed, now: NOW + 6 * 864e5 }, false, "snoozed", `${label}: re-choosing Honeywood within the snooze`);
  expect("startup", { state: snoozed, now: NOW + p.SNOOZE_MS + 1 }, true, "startup", `${label}: offered again at startup after the snooze`);
  expect("themeChange", { state: snoozed, now: NOW + p.SNOOZE_MS + 1 }, true, "themeChange", `${label}: offered again on choosing Honeywood after the snooze`);
}

// --- Restarts, several windows and ignored offers: not repeated at startup for a week
ok(p.STARTUP_GAP_MS >= p.SNOOZE_MS, "an ignored offer must not return sooner than Not now");
expect("startup", { state: { lastPromptAt: NOW }, now: NOW + 60e3 }, false, "prompted-recently", "restart a minute after an unanswered offer");
expect("startup", { state: { lastPromptAt: NOW }, now: NOW + 6 * 864e5 }, false, "prompted-recently", "ignored offer, six days later");
expect("startup", { state: { lastPromptAt: NOW }, now: NOW + p.STARTUP_GAP_MS + 1 }, true, "startup", "ignored offer, after a week");
expect("themeChange", { state: { lastPromptAt: NOW }, now: NOW + 60e3 }, true, "themeChange", "explicitly choosing Honeywood is a new opportunity");

// --- Auto-detected colour scheme
const auto = { colorTheme: "Default Dark Modern", autoDetect: true, preferredLight: QUIET, preferredDark: "Default Dark Modern" };
ok(p.activeColorThemeLabel({ ...auto, isLightMode: true }) === QUIET, "auto-detect, light mode: uses the preferred light theme");
ok(p.activeColorThemeLabel({ ...auto, isLightMode: false }) === "Default Dark Modern", "auto-detect, dark mode: uses the preferred dark theme");
ok(p.activeColorThemeLabel({ ...auto, autoDetect: false }) === "Default Dark Modern", "no auto-detect: uses workbench.colorTheme");

if (failures.length) {
  console.error(`${failures.length} icon prompt test(s) FAILED:`);
  for (const f of failures) console.error("  ✗", f);
  process.exit(1);
}
console.log(`icon prompt tests: ${passed} passed`);
