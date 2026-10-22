'use strict';
// Decides when to offer Honeywood Icons. Pure (no vscode import) so every rule
// can be unit-tested: run `npm test`.
//
// Rules:
// - Only while a Honeywood colour theme is in use and the file icon theme is
//   something other than Honeywood Icons. The icon theme is only ever changed
//   when the user clicks "Use Honeywood Icons".
// - Never again after "Use Honeywood Icons" or "Don't ask again".
// - "Not now" (or closing the notification) snoozes the offer for SNOOZE_MS.
// - At most once per window session.
// - At startup, not within STARTUP_GAP_MS of the last offer, so restarts,
//   several open windows and ignored offers don't repeat it.
// - On a colour theme change, only when switching INTO Honeywood from another
//   theme; switching between the two Honeywood styles never prompts.

const ICON_THEME_ID = 'honeywood-icons';
const COLOR_THEMES = ['Honeywood — Picture Book', 'Honeywood — Quiet Ink'];
const STATE_KEY = 'honeywood.iconPrompt';
const DAY_MS = 24 * 60 * 60 * 1000;
const SNOOZE_MS = 7 * DAY_MS;
// An offer that was ignored (left in the notification centre) is treated like
// "Not now" at startup, so it can't come back more often than a snooze.
const STARTUP_GAP_MS = SNOOZE_MS;

const CHOICES = {
  use: 'Use Honeywood Icons',
  notNow: 'Not now',
  never: "Don't ask again",
};

function isHoneywoodColorTheme(label) {
  return COLOR_THEMES.includes(label);
}

// Which colour theme setting is in effect. With auto-detect on, VS Code uses
// the preferred light/dark theme for the OS colour mode instead.
// settings: { colorTheme, autoDetect, preferredLight, preferredDark, isLightMode }
function activeColorThemeLabel(settings) {
  if (settings.autoDetect) return settings.isLightMode ? settings.preferredLight : settings.preferredDark;
  return settings.colorTheme;
}

// trigger: 'startup' | 'themeChange'
// ctx: { colorTheme, previousColorTheme, iconTheme, state, now, shownThisSession }
// Returns { prompt: boolean, reason: string }.
function shouldPrompt(trigger, ctx) {
  const state = ctx.state || {};
  if (!isHoneywoodColorTheme(ctx.colorTheme)) return { prompt: false, reason: 'not-honeywood-colours' };
  if (ctx.iconTheme === ICON_THEME_ID) return { prompt: false, reason: 'already-using-icons' };
  if (state.choice === 'accepted') return { prompt: false, reason: 'accepted-before' };
  if (state.choice === 'never') return { prompt: false, reason: 'dont-ask-again' };
  if (ctx.shownThisSession) return { prompt: false, reason: 'shown-this-session' };
  if (state.snoozedUntil && ctx.now < state.snoozedUntil) return { prompt: false, reason: 'snoozed' };
  if (trigger === 'themeChange' && isHoneywoodColorTheme(ctx.previousColorTheme)) {
    return { prompt: false, reason: 'switched-between-honeywood-styles' };
  }
  if (trigger === 'startup' && state.lastPromptAt && ctx.now - state.lastPromptAt < STARTUP_GAP_MS) {
    return { prompt: false, reason: 'prompted-recently' };
  }
  return { prompt: true, reason: trigger };
}

// New stored state for the user's answer (undefined = notification closed).
function stateAfterAnswer(state, answer, now) {
  const next = { ...(state || {}) };
  if (answer === CHOICES.use) next.choice = 'accepted';
  else if (answer === CHOICES.never) next.choice = 'never';
  else next.snoozedUntil = now + SNOOZE_MS;
  return next;
}

module.exports = {
  ICON_THEME_ID,
  COLOR_THEMES,
  STATE_KEY,
  SNOOZE_MS,
  STARTUP_GAP_MS,
  CHOICES,
  isHoneywoodColorTheme,
  activeColorThemeLabel,
  shouldPrompt,
  stateAfterAnswer,
};
