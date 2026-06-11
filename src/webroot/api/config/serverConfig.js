
import fs from 'fs/promises';
import path from 'path';

import { SERVER_CONFIG } from './serverEnv.js';

const configPath = path.join(SERVER_CONFIG.ROOT_DIR, 'config', 'config.json');

async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading JSON at ${filePath}:`, err);
        return null;
    }
}

export async function readConfigFile() {
    const baseCfg = await readJSON(configPath);
    return baseCfg || {};
}
