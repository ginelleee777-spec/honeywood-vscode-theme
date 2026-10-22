// Tests for the optional Honeywood Storybook view: manifest contributions,
// commands, settings, image-path handling, fallback states, the animated
// built-in scene, layout, the webview's security policy and packaging.
// Run: npm test
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { resolveIllustration, EXTENSIONS, MAX_BYTES } = require("../extension/storybook-image.js");
const { buildStorybookHtml, checkScene, FITS, FOCUSES, SCENE_ASPECT } = require("../extension/storybook-html.js");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const read = (rel) => readFileSync(join(root, rel), "utf8");
const scene = read("images/storybook/honeywood-woodland.svg");

const failures = [];
let passed = 0;
function ok(cond, message) {
  if (cond) passed++;
  else failures.push(message);
}
function throws(fn) {
  try { fn(); return false; } catch { return true; }
}

// --- Manifest: an optional, collapsed Explorer view that coexists with the file tree
const views = pkg.contributes.views;
ok(JSON.stringify(Object.keys(views)) === JSON.stringify(["explorer"]), "views must only be contributed to the built-in Explorer");
ok(!pkg.contributes.viewsContainers, "no separate activity-bar container");
const view = views.explorer[0];
ok(view.type === "webview" && view.id === "honeywood.storybook" && view.name === "Honeywood Storybook", "Explorer webview view id/name");
ok(view.visibility === "collapsed", "the view starts collapsed");
ok(view.when === "!isWeb", "the view is hidden where the extension code can't run (VS Code for the Web)");
ok(JSON.stringify(pkg.extensionKind) === JSON.stringify(["ui", "workspace"]), "extensionKind prefers the local machine, so chosen paths are local");
ok(JSON.stringify(pkg.activationEvents) === JSON.stringify(["onStartupFinished"]), "activation unchanged from 1.1.0");
// Existing 1.1.0 contributions are preserved.
ok(pkg.contributes.themes.length === 2 && pkg.contributes.iconThemes[0].id === "honeywood-icons", "colour and icon themes preserved");
for (const c of ["honeywood.setUp", "honeywood.useIcons"]) ok(pkg.contributes.commands.some((x) => x.command === c), `1.1.0 command ${c} preserved`);

// --- Commands and menus
const titles = Object.fromEntries(pkg.contributes.commands.map((c) => [c.command, `${c.category}: ${c.title}`]));
ok(titles["honeywood.storybook.chooseIllustration"] === "Honeywood: Choose Sidebar Illustration", "Choose Sidebar Illustration command");
ok(titles["honeywood.storybook.useDefault"] === "Honeywood: Use Default Illustration", "Use Default Illustration command");
ok(titles["honeywood.storybook.show"] === "Honeywood: Show Storybook", "Show Storybook command");
ok(titles["honeywood.storybook.pauseAnimation"] === "Honeywood: Pause Storybook Animation", "Pause command");
ok(titles["honeywood.storybook.resumeAnimation"] === "Honeywood: Resume Storybook Animation", "Resume command");
const storybookSource = read("extension/storybook.js");
const registered = [...storybookSource.matchAll(/registerCommand\('([^']+)'/g)].map((m) => m[1]).sort();
ok(JSON.stringify(registered) === JSON.stringify(Object.keys(titles).filter((c) => c.startsWith("honeywood.storybook.")).sort()), "Storybook commands registered = contributed");
for (const item of pkg.contributes.menus["view/title"]) ok(/^view == honeywood\.storybook\b/.test(item.when), `menu item ${item.command} only on the Storybook view`);
const menuWhen = (cmd) => pkg.contributes.menus["view/title"].find((m) => m.command === cmd)?.when || "";
ok(/ config\.honeywood\.storybook\.animation$/.test(menuWhen("honeywood.storybook.pauseAnimation")), "Pause shows only while animating");
ok(/!config\.honeywood\.storybook\.animation$/.test(menuWhen("honeywood.storybook.resumeAnimation")), "Resume shows only while paused");
ok(/require\('\.\/storybook'\)\.register\(context\)/.test(read("extension/main.js")) && /catch \(err\)/.test(read("extension/main.js")), "Storybook starts inside try/catch so it can't break the icon offer");
ok(/catch \(err\)[\s\S]*couldn\\'t be shown\. Your themes and icons are not affected/.test(storybookSource), "a drawing failure stays inside the view");

// --- Settings: only the Storybook's own settings are written, only in user settings
const props = pkg.contributes.configuration.properties;
ok(props["honeywood.storybook.imagePath"].scope === "machine", "imagePath is machine-scoped (not synced, not per workspace)");
ok(props["honeywood.storybook.caption"].maxLength === 80, "caption is short");
ok(JSON.stringify(props["honeywood.storybook.fit"].enum) === JSON.stringify(FITS) && props["honeywood.storybook.fit"].default === "whole", "fit values match the code");
ok(JSON.stringify(props["honeywood.storybook.focus"].enum) === JSON.stringify(FOCUSES), "focus values match the code");
ok(props["honeywood.storybook.animation"].type === "boolean" && props["honeywood.storybook.animation"].default === true, "animation setting: boolean, on by default");
const writes = [...storybookSource.matchAll(/\.update\('([^']+)'/g)].map((m) => m[1]).sort();
ok(JSON.stringify(writes) === JSON.stringify(["animation", "imagePath", "imagePath"]), `the Storybook only writes its own settings (found ${writes})`);
ok(/ConfigurationTarget\.Global/.test(storybookSource) && !/ConfigurationTarget\.(Workspace|WorkspaceFolder)/.test(storybookSource), "settings go to user settings, never workspace files");
ok(/'animation', on \? undefined : false/.test(storybookSource), "resuming removes the setting rather than storing true");
ok(/get\('reduceMotion', 'auto'\) !== 'on'/.test(storybookSource), "VS Code's reduce-motion setting stills the scene");

// --- No network, telemetry or remote content
for (const rel of ["extension/storybook.js", "extension/storybook-image.js", "extension/storybook-html.js"]) {
  const src = read(rel);
  ok(!/require\('(https?|net|tls|dgram|child_process)'\)|fetch\(|XMLHttpRequest|WebSocket|telemetry|https?:\/\/(?!www\.w3\.org)/i.test(src), `${rel}: no network, telemetry or remote URLs`);
}

// --- Image-path handling and fallback states
const tmp = mkdtempSync(join(tmpdir(), "honeywood-storybook-"));
const DEFAULT = join(root, "images", "storybook", "honeywood-woodland.svg");
const resolveWith = (setting, home = tmp) => resolveIllustration({ setting, defaultFile: DEFAULT, homedir: home, fs });
const samples = {
  "my friends.png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]),
  "photo.JPG": Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16]),
  "art.webp": Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 ")]),
  "anim.gif": Buffer.from("GIF89a......"),
  "pic.avif": Buffer.concat([Buffer.alloc(4), Buffer.from("ftypavif"), Buffer.alloc(4)]),
  "old.bmp": Buffer.from("BM............"),
};
for (const [name, bytes] of Object.entries(samples)) {
  writeFileSync(join(tmp, name), bytes);
  const r = resolveWith(join(tmp, name));
  ok(r.source === "custom" && r.file === normalize(join(tmp, name)) && !r.problem, `${name} is accepted`);
}
ok(resolveWith(`"${join(tmp, "my friends.png")}"`).source === "custom", "a path pasted with quotes is accepted");
ok(resolveWith("~/my friends.png").file === join(tmp, "my friends.png"), "~ expands to the home folder");

const expectDefault = (setting, pattern, label) => {
  const r = resolveWith(setting);
  ok(r.source === "default" && r.file === DEFAULT && pattern.test(r.problem || ""), `${label}: got ${JSON.stringify(r)}`);
};
ok(JSON.stringify(resolveWith("")) === JSON.stringify({ file: DEFAULT, source: "default" }), "empty setting: default scene, no message");
ok(!resolveWith(undefined).problem && !resolveWith(42).problem && !resolveWith("   ").problem, "unset or odd values: default scene, no message");
expectDefault(join(tmp, "gone.png"), /can't be found/, "missing file");
expectDefault("pictures/friends.png", /full path/, "relative path");
mkdirSync(join(tmp, "folder.png"));
expectDefault(join(tmp, "folder.png"), /folder/, "a folder");
writeFileSync(join(tmp, "notes.txt"), "hello");
expectDefault(join(tmp, "notes.txt"), /isn't supported/, "unsupported type");
writeFileSync(join(tmp, "drawing.svg"), "<svg/>");
expectDefault(join(tmp, "drawing.svg"), /isn't supported/, "SVG is not accepted from users");
writeFileSync(join(tmp, "IMG_0001.HEIC"), "x");
expectDefault(join(tmp, "IMG_0001.HEIC"), /JPEG or PNG/, "HEIC explained");
writeFileSync(join(tmp, "renamed.png"), "not really a png");
expectDefault(join(tmp, "renamed.png"), /doesn't look like a valid PNG/, "renamed non-image");
writeFileSync(join(tmp, "empty.jpg"), "");
expectDefault(join(tmp, "empty.jpg"), /valid JPG/, "empty file");
const fakeFs = (code) => ({ statSync() { const e = new Error(code); e.code = code; throw e; } });
const denied = resolveIllustration({ setting: join(tmp, "x.png"), defaultFile: DEFAULT, homedir: tmp, fs: fakeFs("EACCES") });
ok(denied.source === "default" && /permission/.test(denied.problem), "no permission is explained");
const huge = resolveIllustration({ setting: join(tmp, "big.png"), defaultFile: DEFAULT, homedir: tmp,
  fs: { statSync: () => ({ isFile: () => true, size: MAX_BYTES + 1 }) } });
ok(/larger than 50 MB/.test(huge.problem || ""), "very large files are refused");
ok(JSON.stringify(EXTENSIONS) === JSON.stringify([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".bmp"]), "supported formats");

// --- HTML, Content Security Policy and escaping
const nonce = "abcdefghijklmnopqrstuvwx";
const photo = { cspSource: "'self' https://*.vscode-cdn.net", nonce, imageSrc: "https://file+.vscode-resource.vscode-cdn.net/c%3A/pics/friends.png?v=1",
  alt: "Your chosen illustration.", caption: "", problem: "", fit: "whole", focus: "center", animate: true };
const withScene = { ...photo, imageSrc: undefined, scene };
const cspOf = (html) => html.match(/Content-Security-Policy" content="([^"]+)"/)[1].replace(/&#39;/g, "'");
const photoHtml = buildStorybookHtml(photo);
const sceneHtml = buildStorybookHtml(withScene);
for (const [label, html] of [["photo", photoHtml], ["scene", sceneHtml]]) {
  const csp = cspOf(html);
  ok(/^default-src 'none'; /.test(csp), `${label}: CSP starts from default-src 'none'`);
  ok(/style-src 'nonce-abcdefghijklmnopqrstuvwx';/.test(csp) && /script-src 'nonce-abcdefghijklmnopqrstuvwx';/.test(csp), `${label}: one nonce'd style and script`);
  ok(!/unsafe-|data:|blob:|http:|connect-src|font-src|frame-src|media-src/.test(csp), `${label}: nothing unsafe or remote allowed`);
  ok(/base-uri 'none'/.test(csp) && /form-action 'none'/.test(csp), `${label}: base-uri and form-action locked down`);
  ok((html.match(/<script/g) || []).length === 1 && (html.match(/<style/g) || []).length === 1, `${label}: exactly one script and one style`);
  ok(!/<(link|iframe|object|embed|form)\b|http-equiv="refresh"/i.test(html), `${label}: no external or embedded content`);
  ok(!/ResizeObserver|requestAnimationFrame|setInterval|setTimeout/.test(html), `${label}: no resize or animation loops in script`);
}
ok(/img-src 'self' https:\/\/\*\.vscode-cdn\.net;/.test(cspOf(photoHtml)), "photo: images only from the webview resource scheme");
ok(/img-src 'none';/.test(cspOf(sceneHtml)), "scene: no image loading at all (the scene is inline)");
const evil = buildStorybookHtml({ ...photo, caption: '<img src=x onerror=alert(1)>', problem: '"><script>alert(1)</script>',
  imageSrc: 'x" onerror="alert(1)', alt: "<b>", fit: 'x"><script>', focus: "center; } body { display:none" });
ok(!/<img src=x/.test(evil) && /&lt;img src=x onerror=alert\(1\)&gt;/.test(evil), "caption is escaped");
ok(!/"><script>alert/.test(evil), "problem text is escaped");
ok(/src="x&quot; onerror=&quot;alert\(1\)"/.test(evil), "image URI is escaped");
ok(/<body class="whole[ "]/.test(evil) && /object-position: center;/.test(evil) && !/display:none/.test(evil), "fit and focus accept known values only");
ok([{ nonce: "short" }, { nonce: 'abcdefghijklmnop"><x' }, { cspSource: "x; script-src *" }, { cspSource: 'x" onload="' }]
  .every((bad) => throws(() => buildStorybookHtml({ ...photo, ...bad }))), "weak nonces and unexpected CSP sources are rejected");

// --- Captions
const captioned = buildStorybookHtml({ ...photo, caption: "A quiet afternoon by the river" });
ok(/class="[^"]*has-caption/.test(captioned) && /<figcaption class="caption" title="A quiet afternoon by the river">A quiet afternoon by the river<\/figcaption>/.test(captioned), "caption shown, with full text on hover");
ok(!/<figcaption/.test(photoHtml) && !/has-caption/.test(photoHtml.match(/<body[^>]*>/)[0]), "no caption element or space when empty");
ok(/body\.has-caption \{ --cap: 24px; \}/.test(photoHtml) && /\.caption \{[^}]*width: 0;[^}]*min-width: 100%;[^}]*text-overflow: ellipsis/.test(photoHtml), "captions take one fixed line and never widen the card");

// --- Layout: sized from the space the view really has, with no scrollbars
ok(/html, body \{[^}]*overflow: hidden/.test(photoHtml), "the view never scrolls");
ok(/\.stage \{[^}]*flex: 1 1 auto;[^}]*min-height: 0;[^}]*container-type: size;/.test(photoHtml), "the stage is the remaining space and a size container");
ok(/\.art \{[^}]*width: max\(0px, min\(calc\(100cqw - var\(--chrome-x\)\), calc\(\(100cqh - var\(--chrome-y\)\) \* var\(--aspect\)\)\)\);[^}]*aspect-ratio: var\(--aspect\);/.test(photoHtml), "whole: fits both ways at the picture's own proportions");
ok(/\.fill \.art \{[^}]*width: max\(0px, calc\(100cqw - var\(--chrome-x\)\)\);[^}]*height: max\(0px, calc\(100cqh - var\(--chrome-y\)\)\);/.test(photoHtml), "fill: uses the whole stage");
ok(/\.fill \.art > img \{ object-fit: cover; \}/.test(photoHtml) && /\.art > img \{ object-fit: contain; \}/.test(photoHtml), "photos: contain for whole, cover for fill");
ok(/:root \{ --aspect: 0\.8; \}/.test(sceneHtml) && SCENE_ASPECT === 0.8, "scene proportions are known up front (480 x 600)");
ok(/--aspect', String\(img\.naturalWidth \/ img\.naturalHeight\)/.test(photoHtml) && /class="whole loading"/.test(photoHtml), "a chosen picture's proportions are read once when it loads");
ok(/<svg preserveAspectRatio="xMidYMid meet"/.test(sceneHtml), "scene, whole: meet (no distortion)");
const fillScene = (focus) => buildStorybookHtml({ ...withScene, fit: "fill", focus }).match(/<svg preserveAspectRatio="([^"]+)"/)[1];
ok(fillScene("center") === "xMidYMid slice" && fillScene("left") === "xMinYMid slice" && fillScene("bottom") === "xMidYMax slice", "scene, fill: slice around the chosen focus");
ok(/<body class="fill">/.test(buildStorybookHtml({ ...withScene, fit: "fill" })), "fill class applied");
ok(/Choose illustration\.\.\./.test(sceneHtml) && /Change\.\.\./.test(photoHtml), "button label suits the state");
ok(/role="status">The chosen/.test(buildStorybookHtml({ ...withScene, problem: "The chosen illustration can't be found." })), "problems are shown above the scene");

// --- Animation and reduced motion
ok(/@keyframes hw-breathe/.test(sceneHtml) && /@keyframes hw-bee-2/.test(sceneHtml) && /@keyframes hw-flow/.test(sceneHtml), "scene: animation styles included");
ok(!/@keyframes/.test(photoHtml), "chosen pictures are never animated by Honeywood");
ok(/\.still \.hw-scene, \.still \.hw-scene \* \{ animation: none !important; \}/.test(sceneHtml), "pause stops all scene animation");
ok(/@media \(prefers-reduced-motion: reduce\) \{\s*\.hw-scene, \.hw-scene \* \{ animation: none !important; \}/.test(sceneHtml), "system reduced-motion stills the scene");
ok(/<body class="whole still">/.test(buildStorybookHtml({ ...withScene, animate: false })) && /<body class="whole">/.test(sceneHtml), "animate: false adds the still class");
const motionCss = sceneHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
const animated = [...motionCss.matchAll(/animation: hw-[a-z0-9-]+ ([\d.]+)s/g)].map((m) => Number(m[1]));
ok(animated.length >= 15 && animated.every((s) => s >= 0.9), `animations are slow (shortest ${Math.min(...animated)}s)`);
ok(!/animation:[^;]*\b(steps|step-start|step-end)\b/.test(motionCss) && !/filter:|blur\(/.test(motionCss), "no flashing steps or expensive filters");
const props2 = [...motionCss.matchAll(/@keyframes [\s\S]*?\n  \}/g)].join(" ");
ok(!/(width|height|left|top|fill|stroke):/.test(props2.replace(/stroke-dashoffset/g, "")), "keyframes animate only transform, opacity and stroke-dashoffset");

// --- Built-in scene: original, layered and safe
ok(checkScene(scene) === scene.trim(), "scene passes the active-content check");
for (const bad of ['<svg><script>x</script></svg>', '<svg onload="x"></svg>', '<svg><image href="a.png"/></svg>', '<svg><rect style="fill:red"/></svg>',
  '<svg><rect fill="url(http://x/y)"/></svg>', '<svg><foreignObject/></svg>', '<svg><use href="#a"/></svg>', '<div></div>']) {
  ok(throws(() => checkScene(bad)), `checkScene rejects ${bad}`);
}
ok(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 480 600" class="hw-scene" role="img" aria-label="[^"]+"/.test(scene), "scene: 480x600, labelled for screen readers");
for (const friend of ["hw-willow", "hw-bramble", "hw-pip", "hw-tansy"]) {
  ok(new RegExp(`class="hw-friend ${friend}"`).test(scene), `scene: friend ${friend} present`);
  ok(new RegExp(`class="hw-head ${friend}-head"`).test(scene), `scene: ${friend} has an animatable head`);
}
for (const [cls, min] of [["hw-blink", 7], ["hw-breathe", 4], ["hw-sway", 10], ["hw-bee", 3], ["hw-flow", 3], ["hw-glint", 3], ["hw-ripple", 2], ["hw-canopy", 2], ["hw-cloud", 2]]) {
  const n = (scene.match(new RegExp(`class="${cls}\\b`, "g")) || []).length;
  ok(n >= min, `scene: at least ${min} ${cls} layers (found ${n})`);
}
for (const cls of ["hw-butterfly", "hw-bird", "hw-wings", "hw-willow-ear", "hw-tansy-tail", "hw-pip-tail", "hw-hive", "hw-bridge", "hw-oak", "hw-river", "hw-picnic"]) {
  ok(scene.includes(`class="${cls}"`) || scene.includes(`class="hw-${cls.slice(3)} `) || new RegExp(`class="[^"]*\\b${cls}\\b`).test(scene), `scene: ${cls} present`);
}
const animatedTags = [...scene.matchAll(/<[a-z]+ [^>]*class="(?:hw-breathe|hw-head|hw-ear|hw-tail|hw-sway|hw-canopy|hw-bee|hw-butterfly|hw-wings|hw-bird|hw-cloud)\b[^>]*>/g)].map((m) => m[0]);
ok(animatedTags.length >= 25 && animatedTags.every((t) => !/\stransform=/.test(t)), "animated layers carry no transform attribute (CSS would override it)");
ok([...scene.matchAll(/<ellipse [^>]*class="hw-blink[^>]*>/g)].every((m) => /opacity="0"/.test(m[0])), "eyes are open in the still picture (eyelids hidden at rest)");
ok(/Original artwork/.test(scene) && /No tracing, references to existing illustrations, or\s+third-party artwork/.test(scene), "scene carries its provenance note");
ok(/#FFF9F0/.test(scene) && /#DCEAF7|#CBE0F3/.test(scene) && /#5B4B3F/.test(scene) && /#F2C95E|#F6DB8C/.test(scene), "scene uses Honeywood's cream, powder blue, warm ink and honey");

// --- Webview options in the provider
ok(/enableCommandUris: false/.test(storybookSource), "command URIs are disabled");
ok(/localResourceRoots: isDefault \? \[\] : \[vscode\.Uri\.file\(path\.dirname\(picked\.file\)\)\]/.test(storybookSource), "resource roots: none for the scene, only the chosen picture's folder otherwise");
ok(!/retainContextWhenHidden/.test(storybookSource), "no retainContextWhenHidden (memory)");
ok(/picked\[0\]\.scheme !== 'file'/.test(storybookSource), "only local files can be chosen");

// --- Packaging: code and default art in, nothing personal or private
const ignore = read(".vscodeignore").split(/\r?\n/);
for (const f of ["!extension/storybook.js", "!extension/storybook-image.js", "!extension/storybook-html.js", "!images/storybook/honeywood-woodland.svg"]) {
  ok(ignore.includes(f), `.vscodeignore must include ${f}`);
}
ok(!ignore.some((l) => /^!images\/(\*|storybook\/\*)/.test(l)), "images are allowlisted one by one, not by wildcard");

if (failures.length) {
  console.error(`${failures.length} storybook test(s) FAILED:`);
  for (const f of failures) console.error("  ✗", f);
  process.exit(1);
}
console.log(`storybook tests: ${passed} passed`);
