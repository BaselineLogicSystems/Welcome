// build-unix.js

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

// Resolve paths relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.join(__dirname, '..', '..', '..');
const srcDir = path.join(rootDir, 'src');
const outDir = path.join(rootDir, 'public');

async function build() {
    try {
        await fs.ensureDir(outDir);
        await fs.ensureDir(path.join(outDir, 'config'));

        // Copy public assets
        await fs.copy(path.join(srcDir, 'public'), outDir);

        // Copy env files to config directory
        // Note: We use a glob-like approach by reading the root dir
        // since fs-extra doesn't natively do shell globs for source filenames
        const files = await fs.readdir(rootDir);
        const envFiles = files.filter(f => f.startsWith('.env'));

        for (const file of envFiles) {
            await fs.copy(path.join(rootDir, file), path.join(outDir, 'config', file));
        }

        console.log('✅ Build assets copied successfully');
    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
}

const ignoreBuildResult = build();
