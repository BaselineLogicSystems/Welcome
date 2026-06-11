
// build.js
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra'; // Use fs-extra for everything
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..', '..');
const srcDir = path.join(rootDir, 'src');
const outDir = path.join(rootDir, 'public');

// Helper: read config.json
async function readConfigFile() {
  const configPath = path.join(outDir, 'config', 'config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (_) {
    return {};
  }
}

async function run() {
  try {
    // 1. Unified OS-independent copy
    console.log('📦 Preparing public directory...');
    await fs.ensureDir(outDir);
    await fs.ensureDir(path.join(outDir, 'config'));

    // Copy public assets from src/public to /public
    await fs.copy(path.join(srcDir, 'public'), outDir);

    // Copy env files to config directory
    const files = await fs.readdir(rootDir);
    const envFiles = files.filter(f => f.startsWith('.env'));
    for (const file of envFiles) {
      await fs.copy(path.join(rootDir, file), path.join(outDir, 'config', file));
    }

    // 2. Handle Static Build if enabled in config
    const cfg = await readConfigFile();
    if (cfg.app?.buildStatic) {
      console.log('🚀 Running static build...');
      execSync(`node ./src/main/build/build-static.js`, { stdio: 'inherit' });
    } else {
      console.log('Static build skipped – buildStatic flag is false');
    }

    console.log('✅ Build finished successfully');
  } catch (err) {
    console.error('❌ Critical build failure:', err);
    process.exit(1);
  }
}

run();