// build-unix.js
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve paths relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outApiDir = path.join(__dirname, '..', '..', '..', 'api');
const outPublicDir = path.join(__dirname, '..', '..', '..', 'public');
const outStaticDir = path.join(__dirname, '..', '..', '..', 'static');

execSync(`rm -rf ${outApiDir}`, { stdio: 'inherit' });        // delete output folder
execSync(`rm -rf ${outPublicDir}`, { stdio: 'inherit' });        // delete output folder
execSync(`rm -rf ${outStaticDir}`, { stdio: 'inherit' });        // delete output folder
