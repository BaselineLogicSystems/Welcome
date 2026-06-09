
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findTestFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async entry => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) return findTestFiles(full);
            if (entry.isFile() && entry.name.endsWith('.test.js')) return [full];
            return [];
        })
    );
    return files.flat();
}

async function runAll() {
    const testDir = path.join(__dirname, 'js');
    const testFiles = await findTestFiles(testDir);

    if (testFiles.length === 0) {
        console.error('❌ No test files found in /src/test/js/');
        process.exit(1);
    }

    console.log(`\n🚀 Launching ${testFiles.length} test suites...\n`);

    // We explicitly add --test-reporter=spec to ensure the Spec reporter
    // is fully engaged and reporting all lifecycle failures.
    const testProcess = spawn('node', ['--test', '--test-reporter=spec', ...testFiles], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'testrunner'
        }
    });

    testProcess.on('close', (code) => {
        if (code === 0) {
            console.log(`\n✅ All ${testFiles.length} test files passed`);
            process.exit(0);
        } else {
            console.error(`\n❌ Test suite failed with exit code ${code}`);
            process.exit(code);
        }
    });
}

runAll().catch(err => {
    console.error('Fatal error in test runner:', err);
    process.exit(1);
});