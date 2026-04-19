import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(__filename), '..');

export const config = {
  projectRoot: PROJECT_ROOT,
  dataDir: path.join(PROJECT_ROOT, 'data'),
  dbPath: path.join(PROJECT_ROOT, 'data', 'actionspy.db'),
  logPath: path.join(PROJECT_ROOT, 'data', 'actionspy.log'),
  tmpDir: path.join(PROJECT_ROOT, 'data', 'tmp'),

  zshHistoryPath: process.env.ACTIONSPY_ZSH_PATH || path.join(os.homedir(), '.zsh_history'),

  intervals: {
    zshMs: 30_000,
    zshJitterMs: 5_000,
    appFocusMs: 2_500,
    appFocusJitterMs: 200,
    browserMs: 180_000,
    browserJitterMs: 30_000,
  },

  browsers: {
    chrome: path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default/History'),
    arc: path.join(os.homedir(), 'Library/Application Support/Arc/User Data/Default/History'),
    safari: path.join(os.homedir(), 'Library/Safari/History.db'),
  },
};
