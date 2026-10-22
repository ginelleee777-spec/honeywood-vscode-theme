'use strict';
// Honeywood's only runtime code: a one-time, opt-in offer to switch to
// Honeywood Icons after choosing a Honeywood colour theme, plus two setup
// commands. It never changes a setting unless the user clicks or runs a command.
const vscode = require('vscode');
const prompt = require('./icon-prompt');

const STARTUP_DELAY_MS = 1500;

function readSettings() {
  const wb = vscode.workspace.getConfiguration('workbench');
  const win = vscode.workspace.getConfiguration('window');
  const kind = vscode.window.activeColorTheme.kind;
  return {
    colorTheme: prompt.activeColorThemeLabel({
      colorTheme: wb.get('colorTheme'),
      autoDetect: win.get('autoDetectColorScheme', false),
      preferredLight: wb.get('preferredLightColorTheme'),
      preferredDark: wb.get('preferredDarkColorTheme'),
      isLightMode: kind === vscode.ColorThemeKind.Light || kind === vscode.ColorThemeKind.HighContrastLight,
    }),
    iconTheme: wb.get('iconTheme'),
  };
}

// Sets Honeywood Icons in user settings and reports if a workspace overrides it.
async function useHoneywoodIcons() {
  await vscode.workspace.getConfiguration('workbench')
    .update('iconTheme', prompt.ICON_THEME_ID, vscode.ConfigurationTarget.Global);
  if (vscode.workspace.getConfiguration('workbench').get('iconTheme') !== prompt.ICON_THEME_ID) {
    vscode.window.showInformationMessage(
      'Honeywood Icons is now your default file icon theme, but this workspace sets its own. ' +
      'Remove "workbench.iconTheme" from the workspace settings to see Honeywood Icons here.');
  }
}

function activate(context) {
  const getState = () => context.globalState.get(prompt.STATE_KEY, {});
  const setState = (state) => context.globalState.update(prompt.STATE_KEY, state);
  context.globalState.setKeysForSync([prompt.STATE_KEY]);

  let shownThisSession = false;
  let previousColorTheme = readSettings().colorTheme;

  async function maybePrompt(trigger, previous) {
    const settings = readSettings();
    const decision = prompt.shouldPrompt(trigger, {
      colorTheme: settings.colorTheme,
      previousColorTheme: previous,
      iconTheme: settings.iconTheme,
      state: getState(),
      now: Date.now(),
      shownThisSession,
    });
    if (!decision.prompt) return;

    // Record the offer before showing it, so other windows and restarts see it.
    shownThisSession = true;
    await setState({ ...getState(), lastPromptAt: Date.now() });

    const answer = await vscode.window.showInformationMessage(
      'You are using a Honeywood colour theme. Would you like to use the matching Honeywood Icons for your files too?',
      prompt.CHOICES.use, prompt.CHOICES.notNow, prompt.CHOICES.never);

    // The user may have chosen the icons another way while the message was open.
    if (answer === undefined && readSettings().iconTheme === prompt.ICON_THEME_ID) return;
    await setState(prompt.stateAfterAnswer(getState(), answer, Date.now()));
    if (answer === prompt.CHOICES.use) await useHoneywoodIcons();
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!['workbench.colorTheme', 'workbench.preferredLightColorTheme', 'workbench.preferredDarkColorTheme',
        'window.autoDetectColorScheme'].some((key) => event.affectsConfiguration(key))) return;
      const previous = previousColorTheme;
      previousColorTheme = readSettings().colorTheme;
      if (previousColorTheme !== previous) maybePrompt('themeChange', previous);
    }),

    vscode.commands.registerCommand('honeywood.useIcons', async () => {
      await setState({ ...getState(), choice: 'accepted' });
      await useHoneywoodIcons();
    }),

    vscode.commands.registerCommand('honeywood.setUp', async () => {
      const style = await vscode.window.showQuickPick([
        { label: prompt.COLOR_THEMES[0], description: 'A separate colour for each kind of code' },
        { label: prompt.COLOR_THEMES[1], description: 'A calmer style with four dusty accents' },
      ], { title: 'Set up Honeywood', placeHolder: 'Choose a colour style. Honeywood Icons will be turned on too.' });
      if (!style) return;
      // Icons first, so the colour change below doesn't trigger the offer.
      await setState({ ...getState(), choice: 'accepted' });
      await useHoneywoodIcons();
      const autoDetect = vscode.workspace.getConfiguration('window').get('autoDetectColorScheme', false);
      await vscode.workspace.getConfiguration('workbench').update(
        autoDetect ? 'preferredLightColorTheme' : 'colorTheme', style.label, vscode.ConfigurationTarget.Global);
    }),
  );

  const timer = setTimeout(() => maybePrompt('startup', undefined), STARTUP_DELAY_MS);
  context.subscriptions.push({ dispose: () => clearTimeout(timer) });
}

function deactivate() {}

module.exports = { activate, deactivate };
