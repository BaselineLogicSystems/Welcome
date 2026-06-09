#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';

const ROOT       = process.cwd();
const SRC_PUBLIC = path.join(ROOT, 'src', 'public');
const SRC_PAGES  = path.join(ROOT, 'src', 'public', 'pages');
const OUT_DIR    = path.join(ROOT, 'static');   // or 'static' if you prefer

async function resetOutput() {
  await fs.remove(OUT_DIR);          // delete old static folder
  await fs.ensureDir(OUT_DIR);       // create fresh one
}

async function copyAssets() {
  // Copy everything *except* the server.js itself (and any node modules you don't want)
  await fs.copy(SRC_PUBLIC, OUT_DIR, {
    filter: (src) => !src.includes('.html')
  });

  await fs.copy(SRC_PAGES, OUT_DIR);

}

(async () => {
  console.log('🚀 Building static site…');
  await resetOutput();
  await copyAssets();
  console.log('✅ Build finished – static files are in', OUT_DIR);
})();
