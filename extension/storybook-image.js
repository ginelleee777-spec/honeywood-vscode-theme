'use strict';
// Decides which illustration the Honeywood Storybook view shows, and checks a
// user-chosen file before it is displayed. Pure Node (no vscode import), so
// every rule can be unit-tested: run `npm test`.

const path = require('path');

const MAX_BYTES = 50 * 1024 * 1024;

// Formats the webview can display, with the bytes each file must start with.
// Checking the content, not just the name, stops renamed non-image files.
const FORMATS = {
  '.png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.gif': (b) => ['GIF87a', 'GIF89a'].includes(b.toString('latin1', 0, 6)),
  '.webp': (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
  '.avif': (b) => b.toString('latin1', 4, 8) === 'ftyp' && ['avif', 'avis'].includes(b.toString('latin1', 8, 12)),
  '.bmp': (b) => b.toString('latin1', 0, 2) === 'BM',
};
const EXTENSIONS = Object.keys(FORMATS);

function readHeader(fs, file) {
  const buffer = Buffer.alloc(16);
  const fd = fs.openSync(file, 'r');
  try {
    fs.readSync(fd, buffer, 0, 16, 0);
  } finally {
    fs.closeSync(fd);
  }
  return buffer;
}

// Returns { file, source: 'custom' | 'default', problem? }. `problem` is a
// short, friendly explanation of why the chosen picture isn't shown.
function resolveIllustration({ setting, defaultFile, homedir, fs }) {
  const fallback = (problem) => ({ file: defaultFile, source: 'default', ...(problem ? { problem } : {}) });
  const raw = typeof setting === 'string' ? setting.trim().replace(/^"(.*)"$/, '$1') : '';
  if (!raw) return fallback();

  const expanded = raw === '~' || raw.startsWith('~/') || raw.startsWith('~\\') ? path.join(homedir, raw.slice(1)) : raw;
  if (!path.isAbsolute(expanded)) {
    return fallback('The illustration path must be a full path. Run "Honeywood: Choose Sidebar Illustration" to pick the file.');
  }
  const file = path.normalize(expanded);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.heic' || ext === '.heif') {
    return fallback('HEIC/HEIF photos can\'t be shown in VS Code. Save a copy as JPEG or PNG and choose that instead.');
  }
  if (!EXTENSIONS.includes(ext)) {
    return fallback('That file type isn\'t supported. Choose a PNG, JPEG, WebP, GIF, AVIF or BMP image.');
  }

  let stat;
  try {
    stat = fs.statSync(file);
  } catch (err) {
    return fallback(err && (err.code === 'EACCES' || err.code === 'EPERM')
      ? 'Honeywood doesn\'t have permission to read the chosen illustration.'
      : 'The chosen illustration can\'t be found. It may have been moved, renamed or deleted.');
  }
  if (!stat.isFile()) return fallback('The chosen illustration path is a folder, not an image file.');
  if (stat.size > MAX_BYTES) return fallback('The chosen illustration is larger than 50 MB. Choose a smaller copy.');

  let header;
  try {
    header = readHeader(fs, file);
  } catch {
    return fallback('Honeywood couldn\'t read the chosen illustration.');
  }
  if (!FORMATS[ext](header)) {
    return fallback('The chosen file doesn\'t look like a valid ' + ext.slice(1).toUpperCase() + ' image.');
  }
  return { file, source: 'custom', size: stat.size, mtimeMs: stat.mtimeMs };
}

module.exports = { resolveIllustration, EXTENSIONS, MAX_BYTES };
