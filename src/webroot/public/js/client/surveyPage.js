
import { surveyUI } from './surveyUI.js';

window.addEventListener('DOMContentLoaded', async () => {
    try {
        await surveyUI.init('');
    } catch (error) {
        console.error('Failed to initialize survey page:', error);
    }
});