// build-unix.js
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve paths relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.join(__dirname, '..', '..', '..');
const srcDir = path.join(__dirname, '..', '..', '..', 'src');
const outDir = path.join(__dirname, '..', '..', '..', 'public');

execSync(`mkdir -p ${outDir}`, { stdio: 'inherit' });        // delete output folder

// copy only the files to be published
execSync(
  `cp -r "${srcDir}/public/**/*" "${outDir}/" && \
   cp -r "${rootDir}/.env.*" "${outDir}/config/"`,
  { stdio: 'inherit' }
);
