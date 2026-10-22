'use strict';
// Builds the Honeywood Storybook view's HTML. Pure (no vscode import), so it
// can be unit-tested: run `npm test`.
//
// Security: a strict Content Security Policy (nothing remote; images only
// from the webview's own resource scheme, and none at all for the built-in
// scene; one script and one style, each with a fresh nonce). Every
// user-provided value (caption, problem text, image URI) is HTML-escaped, and
// fit and focus are restricted to known values. The built-in scene is
// Honeywood's own packaged SVG, inlined so CSS can animate it; it's checked
// for anything active before use.
//
// Layout: CSS container units size the picture from the space the view
// actually has, so no resize script is needed. The script only reads a chosen
// picture's proportions once it has loaded.

const FITS = ['whole', 'fill'];
const FOCUSES = ['center', 'top', 'bottom', 'left', 'right'];
const SVG_ALIGN = { center: 'xMidYMid', top: 'xMidYMin', bottom: 'xMidYMax', left: 'xMinYMid', right: 'xMaxYMid' };
const SCENE_ASPECT = 480 / 600;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// The built-in scene must be plain drawing markup: no scripts, event handlers,
// links, embedded documents, external references or inline styles.
function checkScene(svg) {
  if (typeof svg !== 'string' || !/^<svg[\s>]/.test(svg.trim())) throw new Error('The built-in scene is not an SVG.');
  if (/<script|<foreignObject|<iframe|<image|<use|<style|<a[\s>]|\son\w+\s*=|href\s*=|style\s*=|javascript:|@import/i.test(svg)) {
    throw new Error('The built-in scene contains active or external content.');
  }
  for (const ref of svg.match(/url\([^)]*\)/g) || []) {
    if (!/^url\(#[A-Za-z0-9_-]+\)$/.test(ref)) throw new Error('The built-in scene references external content.');
  }
  return svg.trim();
}

// Honeywood palette: cream paper, powder-blue frame, warm ink. The card keeps
// its own colours so it reads as a picture-book page with any colour theme.
const LAYOUT = `
  :root { color-scheme: light dark; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: transparent; }
  /* Space the card's frame and caption take around the picture. Declared on
     body, where --cap is set, so the sums see the caption. */
  body {
    --pad: 6px;
    --edge: 1.5px;
    --cap: 0px;
    --chrome-x: calc(2 * (var(--pad) + var(--edge)));
    --chrome-y: calc(2 * (var(--pad) + var(--edge)) + var(--cap));
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 8px 10px 10px;
    font-family: var(--vscode-font-family);
  }
  body.has-caption { --cap: 24px; }
  .notice {
    flex: none;
    margin: 0 0 8px;
    padding: 6px 8px;
    border-radius: 8px;
    background: #F2DDE3;
    color: #403A36;
    font-size: 12px;
    line-height: 1.4;
  }
  /* The stage is exactly the space left in the view; its size drives the
     picture through container units (cqw/cqh). */
  .stage {
    flex: 1 1 auto;
    min-height: 0;
    container-type: size;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
  .card {
    position: relative;
    margin: 0;
    padding: var(--pad);
    background: #FFF9F0;
    border: var(--edge) solid #B8D0E9;
    border-radius: 12px;
    box-shadow: 0 1px 0 #DCEAF7, 0 3px 10px rgba(64, 58, 54, 0.10);
  }
  /* "whole": as large as fits both ways, at the picture's own proportions,
     so the card hugs it. "fill": the whole stage, cropped as needed. */
  .art {
    width: max(0px, min(calc(100cqw - var(--chrome-x)), calc((100cqh - var(--chrome-y)) * var(--aspect))));
    aspect-ratio: var(--aspect);
    border-radius: 8px;
    overflow: hidden;
    cursor: zoom-in;
  }
  .fill .art {
    width: max(0px, calc(100cqw - var(--chrome-x)));
    height: max(0px, calc(100cqh - var(--chrome-y)));
    aspect-ratio: auto;
  }
  .art > svg, .art > img { display: block; width: 100%; height: 100%; }
  .art > img { object-fit: contain; }
  .fill .art > img { object-fit: cover; }
  .loading .art > img { visibility: hidden; }
  /* width 0 + min-width 100%: the caption follows the picture's width and
     never widens the card; long captions end with an ellipsis. */
  .caption {
    box-sizing: border-box;
    width: 0;
    min-width: 100%;
    height: var(--cap);
    padding: 3px 6px 0;
    text-align: center;
    color: #403A36;
    font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
    font-style: italic;
    font-size: 13px;
    line-height: 19px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button {
    font: inherit;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid #B8D0E9;
    background: rgba(255, 249, 240, 0.92);
    color: #403A36;
    cursor: pointer;
  }
  button:hover { background: #DCEAF7; }
  button:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
  /* "Change..." appears on hover or keyboard focus, so it takes no space. */
  .change { position: absolute; top: 12px; right: 12px; opacity: 0; transition: opacity 120ms ease-in; }
  .card:hover .change, .change:focus-visible { opacity: 1; }
  .missing .art { display: none; }
`;

// Gentle ambient life for the built-in scene: transforms and opacity only,
// slow and staggered so nothing moves in step. Off when paused, and when the
// system or VS Code asks for reduced motion.
const MOTION = `
  .hw-scene .hw-breathe, .hw-scene .hw-head, .hw-scene .hw-ear, .hw-scene .hw-tail, .hw-scene .hw-sway,
  .hw-scene .hw-canopy, .hw-scene .hw-blink, .hw-scene .hw-glint, .hw-scene .hw-ripple, .hw-scene .hw-wings {
    transform-box: fill-box;
  }
  .hw-breathe { transform-origin: 50% 100%; animation: hw-breathe 5.6s ease-in-out infinite; }
  .hw-breathe-2 { animation-duration: 6.4s; animation-delay: -3s; }
  .hw-breathe-3 { animation-duration: 4.8s; animation-delay: -2s; }
  .hw-breathe-4 { animation-duration: 6s; animation-delay: -4.5s; }
  @keyframes hw-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.012, 1.022); } }

  .hw-blink { transform-origin: 50% 50%; animation: hw-blink 7.2s linear infinite; animation-delay: -1s; }
  .hw-blink-2 { animation-duration: 8.6s; animation-delay: -4s; }
  .hw-blink-3 { animation-duration: 5.9s; animation-delay: -2.5s; }
  .hw-blink-4 { animation-duration: 9.7s; animation-delay: -6s; }
  @keyframes hw-blink {
    0%, 93%, 100% { opacity: 0; transform: scaleY(0.2); }
    95%, 96.5% { opacity: 1; transform: scaleY(1); }
    98% { opacity: 0; transform: scaleY(0.2); }
  }

  .hw-bramble-head { transform-origin: 50% 90%; animation: hw-tilt 13s ease-in-out infinite; animation-delay: -2s; }
  .hw-willow-head { transform-origin: 30% 100%; animation: hw-nod 17s ease-in-out infinite; animation-delay: -8s; }
  .hw-pip-head { transform-origin: 50% 100%; animation: hw-tilt-right 11s ease-in-out infinite; animation-delay: -5s; }
  .hw-tansy-head { transform-origin: 50% 100%; animation: hw-turn 19s ease-in-out infinite; animation-delay: -12s; }
  @keyframes hw-tilt { 0%, 62%, 100% { transform: rotate(0deg); } 70%, 84% { transform: rotate(-4deg); } }
  @keyframes hw-nod { 0%, 70%, 100% { transform: rotate(0deg); } 77%, 88% { transform: rotate(3deg); } }
  @keyframes hw-tilt-right { 0%, 55%, 100% { transform: rotate(0deg); } 62%, 74% { transform: rotate(6deg); } }
  @keyframes hw-turn { 0%, 66%, 100% { transform: rotate(0deg); } 72%, 86% { transform: rotate(-5deg); } }

  .hw-willow-ear { transform-origin: 50% 100%; animation: hw-twitch 9s ease-in-out infinite; animation-delay: -3s; }
  @keyframes hw-twitch {
    0%, 89%, 100% { transform: rotate(0deg); }
    91.5% { transform: rotate(-7deg); }
    94% { transform: rotate(2deg); }
    96.5% { transform: rotate(-3deg); }
  }

  .hw-tansy-tail { transform-origin: 0% 100%; animation: hw-tail 7s ease-in-out infinite alternate; }
  .hw-pip-tail { transform-origin: 100% 100%; animation: hw-tail-small 5.5s ease-in-out infinite alternate; animation-delay: -2s; }
  @keyframes hw-tail { from { transform: rotate(-4deg); } to { transform: rotate(5deg); } }
  @keyframes hw-tail-small { from { transform: rotate(-6deg); } to { transform: rotate(4deg); } }

  .hw-sway { transform-origin: 50% 100%; animation: hw-sway 5s ease-in-out infinite alternate; }
  .hw-sway-1 { animation-duration: 4.6s; animation-delay: -1s; }
  .hw-sway-2 { animation-duration: 5.8s; animation-delay: -3s; }
  .hw-sway-3 { animation-duration: 6.6s; animation-delay: -2s; }
  .hw-sway-4 { animation-duration: 5.2s; animation-delay: -4s; }
  @keyframes hw-sway { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }

  .hw-canopy { transform-origin: 50% 100%; animation: hw-canopy 9s ease-in-out infinite alternate; }
  .hw-canopy-back { animation-duration: 11s; animation-delay: -4s; }
  @keyframes hw-canopy { from { transform: rotate(-0.6deg); } to { transform: rotate(0.6deg); } }

  .hw-cloud-a { animation: hw-drift-a 48s ease-in-out infinite alternate; }
  .hw-cloud-b { animation: hw-drift-b 60s ease-in-out infinite alternate; animation-delay: -20s; }
  @keyframes hw-drift-a { from { transform: translateX(0); } to { transform: translateX(-26px); } }
  @keyframes hw-drift-b { from { transform: translateX(0); } to { transform: translateX(22px); } }
  .hw-sunglow { animation: hw-glow 10s ease-in-out infinite alternate; }
  @keyframes hw-glow { from { opacity: 0.75; } to { opacity: 1; } }

  .hw-flow { stroke-dasharray: 10 26; animation: hw-flow 7s linear infinite; }
  .hw-flow-b { animation-duration: 9s; }
  .hw-flow-c { animation-duration: 6s; }
  @keyframes hw-flow { to { stroke-dashoffset: -72; } }
  .hw-glint { opacity: 0; transform-origin: 50% 50%; animation: hw-glint 6s ease-in-out infinite; }
  .hw-glint-b { animation-duration: 7.5s; animation-delay: -3s; }
  .hw-glint-c { animation-duration: 8.5s; animation-delay: -5s; }
  @keyframes hw-glint { 0%, 100% { opacity: 0; transform: scaleX(0.6); } 50% { opacity: 0.9; transform: scaleX(1); } }
  .hw-ripple { opacity: 0; transform-origin: 50% 50%; animation: hw-ripple 5s ease-out infinite; }
  .hw-ripple-b { animation-duration: 6.5s; animation-delay: -2.5s; }
  @keyframes hw-ripple { 0% { opacity: 0; transform: scale(0.6); } 30% { opacity: 0.8; } 100% { opacity: 0; transform: scale(1.25); } }

  .hw-bee-1 { animation: hw-bee-1 16s ease-in-out infinite; }
  .hw-bee-2 { animation: hw-bee-2 22s ease-in-out infinite; animation-delay: -4s; }
  .hw-bee-3 { animation: hw-bee-3 18s ease-in-out infinite; animation-delay: -6s; }
  @keyframes hw-bee-1 {
    0%, 100% { transform: translate(0, 0); } 15% { transform: translate(18px, -14px); } 30% { transform: translate(30px, 6px); }
    45% { transform: translate(8px, 22px); } 60% { transform: translate(-14px, 10px); } 75% { transform: translate(-8px, -12px); }
  }
  @keyframes hw-bee-2 {
    0%, 100% { transform: translate(0, 0); } 12% { transform: translate(-14px, -10px); } 24% { transform: translate(-26px, 40px); }
    36% { transform: translate(-20px, 98px); } 42% { transform: translate(-19px, 100px); } 48% { transform: translate(-17px, 98px); }
    56% { transform: translate(0, 106px); } 62% { transform: translate(2px, 104px); } 72% { transform: translate(14px, 60px); }
    86% { transform: translate(6px, 10px); }
  }
  @keyframes hw-bee-3 {
    0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-16px, -8px); } 40% { transform: translate(-30px, -30px); }
    60% { transform: translate(-6px, -36px); } 80% { transform: translate(14px, -14px); }
  }

  .hw-butterfly { opacity: 0; animation: hw-butterfly 34s linear infinite; animation-delay: -6s; }
  .hw-wings { transform-origin: 50% 50%; animation: hw-flap 0.9s ease-in-out infinite alternate; }
  @keyframes hw-butterfly {
    0%, 58% { opacity: 0; transform: translate(0, 0); }
    60% { opacity: 1; transform: translate(10px, -4px); }
    70% { transform: translate(140px, -30px); }
    80% { transform: translate(280px, 10px); }
    90% { transform: translate(420px, -24px); }
    96% { opacity: 1; transform: translate(520px, -10px); }
    97%, 100% { opacity: 0; transform: translate(520px, -10px); }
  }
  @keyframes hw-flap { from { transform: scaleX(1); } to { transform: scaleX(0.45); } }
  .hw-bird { opacity: 0; animation: hw-bird 46s linear infinite; animation-delay: -10s; }
  @keyframes hw-bird {
    0%, 70% { opacity: 0; transform: translate(0, 0); }
    72% { opacity: 0.9; transform: translate(14px, -2px); }
    90% { opacity: 0.9; transform: translate(560px, -20px); }
    92%, 100% { opacity: 0; transform: translate(560px, -20px); }
  }

  .still .hw-scene, .still .hw-scene * { animation: none !important; }
  @media (prefers-reduced-motion: reduce) {
    .hw-scene, .hw-scene * { animation: none !important; }
  }
`;

const SCRIPT = `
  (function () {
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('button[data-action]').forEach(function (b) {
      b.addEventListener('click', function () { vscode.postMessage({ type: b.dataset.action }); });
    });
    const art = document.querySelector('.art');
    art.addEventListener('click', function () { vscode.postMessage({ type: 'open' }); });
    const img = document.querySelector('.art > img');
    if (!img) return;
    function measured() {
      if (img.naturalWidth && img.naturalHeight) {
        document.documentElement.style.setProperty('--aspect', String(img.naturalWidth / img.naturalHeight));
      }
      document.body.classList.remove('loading');
    }
    img.addEventListener('load', measured);
    img.addEventListener('error', function () {
      document.body.classList.add('missing');
      vscode.postMessage({ type: 'imageError' });
    });
    if (img.complete && img.naturalWidth) measured();
  })();
`;

// options: { cspSource, nonce, scene (built-in SVG) or imageSrc, alt, caption,
//            problem, fit, focus, animate }
function buildStorybookHtml(options) {
  const { cspSource, nonce, alt, caption, problem } = options;
  if (!/^[A-Za-z0-9_-]{16,}$/.test(nonce)) throw new Error('A strong nonce is required.');
  // VS Code supplies this ('self' plus its own webview resource host); reject
  // anything that could end the directive or the attribute.
  if (!/^[A-Za-z0-9+.:/_*' -]+$/.test(cspSource)) throw new Error('Unexpected webview CSP source.');
  const isScene = typeof options.scene === 'string';
  const fit = FITS.includes(options.fit) ? options.fit : 'whole';
  const focus = FOCUSES.includes(options.focus) ? options.focus : 'center';
  const animate = options.animate !== false;

  const csp = [
    "default-src 'none'",
    // The built-in scene is inline, so it needs no image source at all.
    isScene ? "img-src 'none'" : `img-src ${cspSource}`,
    `style-src 'nonce-${nonce}'`,
    `script-src 'nonce-${nonce}'`,
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  let art;
  if (isScene) {
    const align = SVG_ALIGN[focus] + (fit === 'fill' ? ' slice' : ' meet');
    art = checkScene(options.scene).replace(/^<svg\b/, `<svg preserveAspectRatio="${align}" focusable="false"`);
  } else {
    art = `<img src="${escapeHtml(options.imageSrc)}" alt="${escapeHtml(alt)}">`;
  }

  const classes = [fit, caption ? 'has-caption' : '', animate ? '' : 'still', isScene ? '' : 'loading'].filter(Boolean).join(' ');
  const notice = problem ? `<p class="notice" role="status">${escapeHtml(problem)}</p>` : '';
  const captionHtml = caption ? `<figcaption class="caption" title="${escapeHtml(caption)}">${escapeHtml(caption)}</figcaption>` : '';
  const label = isScene ? 'Choose illustration...' : 'Change...';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style nonce="${nonce}">${LAYOUT}${isScene ? MOTION : ''}
  :root { --aspect: ${isScene ? SCENE_ASPECT : 1}; }
  .art > img { object-position: ${focus}; }</style>
<title>Honeywood Storybook</title>
</head>
<body class="${classes}">
${notice}<main class="stage">
<figure class="card">
<div class="art" title="Open full size">${art}</div>
${captionHtml}<button type="button" class="change" data-action="choose">${label}</button>
</figure>
</main>
<script nonce="${nonce}">${SCRIPT}</script>
</body>
</html>`;
}

module.exports = { buildStorybookHtml, checkScene, escapeHtml, FITS, FOCUSES, SCENE_ASPECT };
