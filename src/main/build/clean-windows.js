// src/build/build-windows.js
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outApiDir = path.join(__dirname, '..', '..', '..', 'api');
const outPublicDir    = path.join(__dirname, '..', '..', '..', 'public');
const outStaticDir = path.join(__dirname, '..', '..', '..', 'static');

execSync(`rimraf ${outApiDir}`, { stdio: 'inherit' });
execSync(`rimraf ${outPublicDir}`, { stdio: 'inherit' });
execSync(`rimraf ${outStaticDir}`, { stdio: 'inherit' });
