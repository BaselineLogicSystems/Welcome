// src/build/build-windows.js
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.join(__dirname, '..', '..', '..');
const srcDir    = path.join(__dirname, '..', '..', '..', 'src');
const outDir    = path.join(__dirname, '..', '..', '..', 'public');

execSync(`if not exist ${outDir} mkdir ${outDir}`, { stdio: 'inherit' });

execSync(
    `cpy "${srcDir}\\public\\**\\*" ${outDir}\\ && \
   cpy "${rootDir}\\src\\main\\configEnv\\.env.*" ${outDir}\\config\\`,
    { stdio: 'inherit' }
);
