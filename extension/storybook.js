'use strict';
// The optional Honeywood Storybook view in the Explorer: shows Honeywood's
// gently animated woodland scene, or a local picture the user chooses.
// Nothing is copied, uploaded or sent anywhere. A chosen picture is read from
// the user's own disk through VS Code's webview resource scheme, limited to
// that picture's folder; the built-in scene needs no file access at all.
const vscode = require('vscode');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveIllustration, EXTENSIONS } = require('./storybook-image');
const { buildStorybookHtml, escapeHtml } = require('./storybook-html');

const VIEW_ID = 'honeywood.storybook';
const SECTION = 'honeywood.storybook';

// Where the picker opens the first time.
function picturesFolder() {
  const home = os.homedir();
  return [path.join(home, 'Pictures'), path.join(home, 'OneDrive', 'Pictures')].find((dir) => fs.existsSync(dir)) || home;
}

// Animation is off when paused, or when VS Code's own reduce-motion setting
// is on. With "auto", the webview follows the system setting by itself.
function shouldAnimate(config) {
  return config.get('animation', true) !== false &&
    vscode.workspace.getConfiguration('workbench').get('reduceMotion', 'auto') !== 'on';
}

class StorybookViewProvider {
  constructor(extensionUri) {
    this.sceneFile = path.join(extensionUri.fsPath, 'images', 'storybook', 'honeywood-woodland.svg');
    this.view = undefined;
    this.currentFile = undefined;
    this.scene = undefined;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.onDidReceiveMessage((message) => {
      const type = message && message.type;
      if (type === 'choose') vscode.commands.executeCommand('honeywood.storybook.chooseIllustration');
      if (type === 'open' && this.currentFile) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(this.currentFile), { preview: true });
      }
      if (type === 'imageError') {
        vscode.window.showWarningMessage('Honeywood couldn\'t display that illustration. Try saving it as a PNG or JPEG.');
      }
    });
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) this.render();
    });
    this.render();
  }

  render() {
    if (!this.view) return;
    const webview = this.view.webview;
    try {
      const config = vscode.workspace.getConfiguration(SECTION);
      const picked = resolveIllustration({ setting: config.get('imagePath', ''), defaultFile: this.sceneFile, homedir: os.homedir(), fs });
      const isDefault = picked.source === 'default';
      this.currentFile = picked.file;

      // The built-in scene is inlined, so it needs no resource access. A
      // chosen picture may only be read from its own folder (VS Code accepts
      // folders, not single files, as roots).
      webview.options = {
        enableScripts: true,
        enableCommandUris: false,
        localResourceRoots: isDefault ? [] : [vscode.Uri.file(path.dirname(picked.file))],
      };

      const common = {
        cspSource: webview.cspSource,
        nonce: crypto.randomBytes(18).toString('base64url'),
        caption: config.get('caption', ''),
        problem: picked.problem,
        fit: config.get('fit', 'whole'),
        focus: config.get('focus', 'center'),
        animate: shouldAnimate(config),
      };
      if (isDefault) {
        if (this.scene === undefined) this.scene = fs.readFileSync(this.sceneFile, 'utf8');
        webview.html = buildStorybookHtml({ ...common, scene: this.scene });
      } else {
        // A changed file at the same path should show its new version.
        const src = webview.asWebviewUri(vscode.Uri.file(picked.file)).with({ query: `v=${Math.floor(picked.mtimeMs)}` });
        webview.html = buildStorybookHtml({ ...common, imageSrc: src.toString(), alt: 'Your chosen illustration.' });
      }
    } catch (err) {
      // A Storybook problem stays inside the Storybook view.
      console.error('Honeywood: the Storybook view could not be drawn.', err);
      webview.options = { enableScripts: false, localResourceRoots: [] };
      webview.html = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'"></head>` +
        `<body><p>${escapeHtml('The Honeywood Storybook couldn\'t be shown. Your themes and icons are not affected.')}</p></body></html>`;
    }
  }
}

function register(context) {
  const provider = new StorybookViewProvider(context.extensionUri);
  // Resuming removes the setting again, so it's only stored while paused.
  const setAnimation = (on) =>
    vscode.workspace.getConfiguration(SECTION).update('animation', on ? undefined : false, vscode.ConfigurationTarget.Global);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, provider),

    vscode.commands.registerCommand('honeywood.storybook.show', () =>
      vscode.commands.executeCommand(`${VIEW_ID}.focus`)),

    vscode.commands.registerCommand('honeywood.storybook.chooseIllustration', async () => {
      const current = vscode.workspace.getConfiguration(SECTION).get('imagePath', '');
      const picked = await vscode.window.showOpenDialog({
        title: 'Choose a Honeywood sidebar illustration',
        openLabel: 'Use this illustration',
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: vscode.Uri.file(current && path.isAbsolute(current) ? path.dirname(current) : picturesFolder()),
        filters: { Images: EXTENSIONS.map((ext) => ext.slice(1)) },
      });
      if (!picked || picked.length === 0) return;
      if (picked[0].scheme !== 'file') {
        vscode.window.showWarningMessage('Honeywood can only show illustrations stored on this computer.');
        return;
      }
      await vscode.workspace.getConfiguration(SECTION)
        .update('imagePath', picked[0].fsPath, vscode.ConfigurationTarget.Global);
      await vscode.commands.executeCommand(`${VIEW_ID}.focus`);
    }),

    vscode.commands.registerCommand('honeywood.storybook.useDefault', () =>
      vscode.workspace.getConfiguration(SECTION).update('imagePath', undefined, vscode.ConfigurationTarget.Global)),

    vscode.commands.registerCommand('honeywood.storybook.pauseAnimation', () => setAnimation(false)),
    vscode.commands.registerCommand('honeywood.storybook.resumeAnimation', () => setAnimation(true)),

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(SECTION) || event.affectsConfiguration('workbench.reduceMotion')) provider.render();
    }),
  );
}

module.exports = { register };
