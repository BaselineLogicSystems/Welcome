
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
    await fs.ensureDir(path.join(rootDir, 'api',));

    // Copy public assets from src/public to /public
    // FILTER: Avoid copying the 'js' folder into public if it contains server logic
    // We only copy it if you have a specific client-side JS directory,
    // otherwise we filter it out and handle it separately.
    await fs.copy(path.join(srcDir, 'public'), outDir, {
      filter: (src) => !src.includes('/js/') // Prevent server-side JS from being publicly accessible
    });

    // --- SERVER BUNDLE: Copy logic to ROOT for Vercel execution ---
    console.log('🛠️  Bundling server files to root...');

    // --- VERCEL FIX: Copy server.js to root for Serverless Function execution ---
    const sourceServer = path.join(srcDir, 'public', 'server.js');
    const destServer = path.join(rootDir, 'api', 'server.js');
    await fs.copy(sourceServer, destServer);
    console.log('🚀 Entry point server.js copied to root');

    // Copy env files to config directory
    const envPath = path.join(srcDir, 'main', 'configEnv');
    const files = await fs.readdir(envPath);
    const envFiles = files.filter(f => f.startsWith('.env'));
    for (const file of envFiles) {
      await fs.copy(path.join(envPath, file), path.join(outDir, 'config', file));
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