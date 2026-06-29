
import { surveyUI } from './surveyUi.js';
import { loadConfig } from '../config/clientConfig.js';

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const config = await loadConfig();
        const contextRoot = config.app?.contextRoot || "";
        await surveyUI.init(contextRoot);
    } catch (error) {
        console.error('Failed to initialize survey page:', error);
    }
});