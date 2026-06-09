// build.js
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Helper: read config.json
async function readConfigFile() {
  const configPath = path.join('public', 'config', 'config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (_) {
    return {};
  }
}

import os from 'os';

async function run() {

  const cfg = await readConfigFile();

  const platform = os.platform(); // 'win32', 'darwin', 'linux', etc.
  const helper = platform.startsWith('win') ? './src/main/build/build-windows.js' : './src/main/build/build-unix.js';

  execSync(`node ${helper}`, { stdio: 'inherit' });

  if (!cfg.app?.buildStatic) {
    console.log('Static build skipped – buildStatic flag is false');
    return;
  }
  execSync(`node ./src/main/build/build-static.js`, { stdio: 'inherit' });
}

run();
