// clean.js
import { execSync } from 'child_process';
import os from 'os';

const platform = os.platform(); // 'win32', 'darwin', 'linux', etc.
const helper = platform.startsWith('win') ? './src/main/build/clean-windows.js' : './src/main/build/clean-unix.js';

execSync(`node ${helper}`, { stdio: 'inherit' });
